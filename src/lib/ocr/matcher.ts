import type { Player } from '../../types';

export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[n];
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / maxLen;
}

interface IndexEntry {
  player: Player;
  key: string;
}

export function buildPlayerIndex(players: Player[]): IndexEntry[] {
  const entries: IndexEntry[] = [];
  for (const p of players) {
    const second = normalizeName(p.secondName);
    const display = normalizeName(p.displayName);
    const full = normalizeName(`${p.firstName} ${p.secondName}`);
    const initialSecond = normalizeName(`${p.firstName[0] ?? ''} ${p.secondName}`);
    const keys = new Set([second, display, full, initialSecond]);
    for (const key of keys) if (key) entries.push({ player: p, key });
  }
  return entries;
}

export interface NameMatch {
  player: Player;
  score: number;
}

/** Best-match score across every alias we indexed for a player, so "Salah" and "M Salah" both hit the same record. */
export function matchName(raw: string, index: IndexEntry[], limit = 5): NameMatch[] {
  const query = normalizeName(raw);
  if (!query || query.length < 2) return [];

  const bestByPlayer = new Map<number, number>();
  for (const entry of index) {
    let score = similarity(query, entry.key);
    if (entry.key.includes(query) || query.includes(entry.key)) {
      score = Math.max(score, 0.75 + Math.min(query.length, entry.key.length) / (entry.key.length + query.length) * 0.2);
    }
    const existing = bestByPlayer.get(entry.player.id) ?? 0;
    if (score > existing) bestByPlayer.set(entry.player.id, score);
  }

  const players = new Map(index.map((e) => [e.player.id, e.player]));
  return Array.from(bestByPlayer.entries())
    .map(([playerId, score]) => ({ player: players.get(playerId) as Player, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export const MATCH_ACCEPT_THRESHOLD = 0.62;
