import type { FplDataset, Player, PlayerAnalysis, Position, Squad, TransferRecommendation } from '../../types';
import { computePlayerAnalysis, buildPositionPopulations } from '../analytics';
import { clamp, round1 } from '../analytics/normalise';
import { replacementScore } from './replacementScore';

let recCounter = 0;

export function candidatePool(dataset: FplDataset, position: Position, currentId: number, excludeIds: Set<number>): Player[] {
  return dataset.players.filter(
    (p) => p.position === position && p.id !== currentId && !excludeIds.has(p.id) && p.minutes >= 90 && (p.status === 'a' || p.status === 'd'),
  );
}

export function buildReasons(current: Player, currentA: PlayerAnalysis, candidate: Player, candidateA: PlayerAnalysis): string[] {
  const reasons: string[] = [];
  if (candidateA.formScore - currentA.formScore >= 12) {
    reasons.push(`Better recent form (${candidate.form.toFixed(1)} vs ${current.form.toFixed(1)} pts/game)`);
  }
  if (candidateA.fixtureScore - currentA.fixtureScore >= 12) reasons.push('Better upcoming fixtures');
  if ((candidate.xGI ?? 0) - (current.xGI ?? 0) >= 0.5) {
    reasons.push(`Higher expected goal involvement (${(candidate.xGI ?? 0).toFixed(2)} vs ${(current.xGI ?? 0).toFixed(2)} xGI)`);
  }
  if (candidateA.attackingScore - currentA.attackingScore >= 12) reasons.push('More attacking involvement for the position');
  if (candidateA.valueScore - currentA.valueScore >= 12) reasons.push('Better points return for the price');
  if (candidateA.minutesScore - currentA.minutesScore >= 15) reasons.push('More secure starting minutes');
  if (candidate.selectedByPercent < current.selectedByPercent - 3) {
    reasons.push(`Lower ownership (${candidate.selectedByPercent.toFixed(1)}% vs ${current.selectedByPercent.toFixed(1)}%) — potential differential`);
  }
  if (!reasons.length) reasons.push('Higher overall projected points for the position');
  return reasons;
}

export function buildTransferRecommendation(
  current: Player,
  currentA: PlayerAnalysis,
  candidate: Player,
  candidateA: PlayerAnalysis,
  squad: Squad,
): TransferRecommendation {
  recCounter += 1;
  const reasons = buildReasons(current, currentA, candidate, candidateA);
  const costDelta = round1(candidate.price - current.price);
  const bank = squad.context.bank;
  const affordable = bank == null ? costDelta <= 0.001 : costDelta <= bank + 0.001;

  return {
    id: `rec-${current.id}-${candidate.id}-${recCounter}`,
    outPlayerId: current.id,
    inPlayerId: candidate.id,
    reasons,
    projectedGainPoints: round1(candidateA.expectedPoints5gw - currentA.expectedPoints5gw),
    fixtureImprovement: clamp((candidateA.fixtureScore - currentA.fixtureScore) / 100, -1, 1),
    valueImprovement: Math.round(candidateA.valueScore - currentA.valueScore),
    costDelta,
    affordable,
    outReplacementScore: round1(replacementScore(currentA)),
    inReplacementScore: round1(replacementScore(candidateA)),
  };
}

export interface BestReplacement {
  candidate: Player;
  analysis: PlayerAnalysis;
  score: number;
}

/** Returns the strongest same-position candidate not already owned, or null if nothing beats the incumbent. */
export function findBestReplacement(
  current: Player,
  currentA: PlayerAnalysis,
  dataset: FplDataset,
  positionPopulations: ReturnType<typeof buildPositionPopulations>,
  excludeIds: Set<number>,
  affordableOnly: boolean,
  bank: number | null,
): BestReplacement | null {
  const pool = candidatePool(dataset, current.position, current.id, excludeIds);
  const currentScore = replacementScore(currentA);
  let best: BestReplacement | null = null;

  for (const candidate of pool) {
    if (affordableOnly && bank != null && candidate.price - current.price > bank + 0.001) continue;
    const analysis = computePlayerAnalysis(candidate, dataset, positionPopulations);
    const score = replacementScore(analysis);
    if (score > currentScore + 3 && (!best || score > best.score)) {
      best = { candidate, analysis, score };
    }
  }
  return best;
}
