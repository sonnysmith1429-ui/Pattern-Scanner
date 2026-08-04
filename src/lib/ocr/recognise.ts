import type { Player, DetectedSquad, DetectedPick } from '../../types';
import { extractTextFromImage, type OcrWord } from './extractor';
import { buildPlayerIndex, matchName, MATCH_ACCEPT_THRESHOLD } from './matcher';

export class OcrUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OcrUnavailableError';
  }
}

const STOPWORDS = new Set([
  'points', 'pts', 'total', 'gw', 'bench', 'pick', 'team', 'my', 'captain', 'vice', 'transfers',
  'squad', 'value', 'bank', 'live', 'fpl', 'fantasy', 'premier', 'league', 'view', 'edit', 'save',
]);

function isLikelyNameToken(text: string): boolean {
  const clean = text.trim();
  if (clean.length < 2) return false;
  if (/^[£$]?\d+(\.\d+)?m?$/i.test(clean)) return false;
  if (/^\d+$/.test(clean)) return false;
  if (STOPWORDS.has(clean.toLowerCase())) return false;
  if (!/[a-zA-Z]/.test(clean)) return false;
  return true;
}

interface Line {
  words: OcrWord[];
  y: number;
}

function groupIntoLines(words: OcrWord[]): Line[] {
  const sorted = [...words].sort((a, b) => a.bbox.y0 - b.bbox.y0);
  const lines: Line[] = [];
  const avgHeight = sorted.reduce((s, w) => s + (w.bbox.y1 - w.bbox.y0), 0) / (sorted.length || 1) || 12;

  for (const w of sorted) {
    const centerY = (w.bbox.y0 + w.bbox.y1) / 2;
    const line = lines.find((l) => Math.abs(l.y - centerY) < avgHeight * 0.7);
    if (line) {
      line.words.push(w);
      line.y = (line.y * (line.words.length - 1) + centerY) / line.words.length;
    } else {
      lines.push({ words: [w], y: centerY });
    }
  }
  for (const l of lines) l.words.sort((a, b) => a.bbox.x0 - b.bbox.x0);
  return lines;
}

interface Candidate {
  text: string;
  bbox: OcrWord['bbox'];
}

function buildCandidateTokens(lines: Line[]): Candidate[] {
  const candidates: Candidate[] = [];
  for (const line of lines) {
    const words = line.words.filter((w) => isLikelyNameToken(w.text));
    for (let i = 0; i < words.length; i++) {
      candidates.push({ text: words[i].text, bbox: words[i].bbox });
      const next = words[i + 1];
      if (next) {
        candidates.push({
          text: `${words[i].text} ${next.text}`,
          bbox: {
            x0: words[i].bbox.x0,
            y0: Math.min(words[i].bbox.y0, next.bbox.y0),
            x1: next.bbox.x1,
            y1: Math.max(words[i].bbox.y1, next.bbox.y1),
          },
        });
      }
    }
  }
  return candidates;
}

function findCaptainBadges(words: OcrWord[]): { isCaptain: boolean; isVice: boolean; bbox: OcrWord['bbox'] }[] {
  const badges: { isCaptain: boolean; isVice: boolean; bbox: OcrWord['bbox'] }[] = [];
  for (const w of words) {
    const clean = w.text.replace(/[()]/g, '').trim().toUpperCase();
    if (clean === 'C') badges.push({ isCaptain: true, isVice: false, bbox: w.bbox });
    else if (clean === 'V') badges.push({ isCaptain: false, isVice: true, bbox: w.bbox });
  }
  return badges;
}

function bboxCenter(b: OcrWord['bbox']) {
  return { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2 };
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export async function recogniseSquadFromImage(dataUrl: string, players: Player[]): Promise<DetectedSquad> {
  let words: OcrWord[];
  try {
    const result = await extractTextFromImage(dataUrl);
    words = result.words.filter((w) => w.confidence >= 35);
  } catch (err) {
    throw new OcrUnavailableError(`Could not process the image (${(err as Error).message}). Try a clearer screenshot, or use Demo Squad.`);
  }

  if (words.length < 5) {
    throw new OcrUnavailableError('We could not detect any readable text in this screenshot. Try a clearer, uncropped screenshot of your full squad.');
  }

  const index = buildPlayerIndex(players);
  const lines = groupIntoLines(words);
  const tokens = buildCandidateTokens(lines);

  const bestByPlayer = new Map<
    number,
    { score: number; bbox: OcrWord['bbox']; text: string; alternatives: { playerId: number; score: number }[] }
  >();
  for (const token of tokens) {
    const matches = matchName(token.text, index, 3);
    if (!matches.length) continue;
    const top = matches[0];
    if (top.score < 0.45) continue;
    const existing = bestByPlayer.get(top.player.id);
    if (!existing || top.score > existing.score) {
      bestByPlayer.set(top.player.id, {
        score: top.score,
        bbox: token.bbox,
        text: token.text,
        alternatives: matches.slice(1).map((m) => ({ playerId: m.player.id, score: Math.round(m.score * 100) / 100 })),
      });
    }
  }

  let ranked = Array.from(bestByPlayer.entries())
    .map(([playerId, v]) => ({ playerId, ...v }))
    .sort((a, b) => b.score - a.score);

  if (ranked.length > 15) ranked = ranked.slice(0, 15);
  ranked.sort((a, b) => a.bbox.y0 - b.bbox.y0);

  const total = ranked.length;
  const benchCount = total >= 15 ? 4 : total > 11 ? total - 11 : 0;
  const startersCount = total - benchCount;

  const badges = findCaptainBadges(words);

  const picks: DetectedPick[] = ranked.map((r, i) => {
    const center = bboxCenter(r.bbox);
    const nearBadge = badges
      .map((b) => ({ b, d: distance(center, bboxCenter(b.bbox)) }))
      .sort((a, b) => a.d - b.d)[0];
    const badgeClose = nearBadge && nearBadge.d < 80;

    return {
      slotId: `ocr-${i}`,
      rawText: r.text,
      isStarter: i < startersCount,
      isBench: i >= startersCount,
      isCaptain: !!badgeClose && nearBadge!.b.isCaptain,
      isViceCaptain: !!badgeClose && nearBadge!.b.isVice,
      matchedPlayerId: r.score >= MATCH_ACCEPT_THRESHOLD ? r.playerId : null,
      matchConfidence: Math.round(r.score * 100) / 100,
      alternatives: r.score >= MATCH_ACCEPT_THRESHOLD ? r.alternatives : [{ playerId: r.playerId, score: r.score }, ...r.alternatives],
    };
  });

  const playersFound = picks.filter((p) => p.matchedPlayerId != null).length;
  const overallConfidence = picks.length ? Math.round((picks.reduce((s, p) => s + p.matchConfidence, 0) / picks.length) * 100) / 100 : 0;

  return {
    picks,
    overallConfidence,
    playersFound,
    playersExpected: 15,
    source: 'ocr',
  };
}
