import type { FplDataset, Player, PlayerAnalysis, Squad, TeamAnalysis, TransferRecommendation } from '../../types';
import { buildPositionPopulations, computePlayerAnalysis } from '../analytics';
import { round1 } from '../analytics/normalise';
import { replacementScore } from './replacementScore';
import { buildTransferRecommendation, candidatePool } from './shared';

export interface FixMyTeamResult {
  transfers: TransferRecommendation[];
  projectedImprovementPoints: number;
  combinationsConsidered: number;
  freeTransfersUsed: number;
  bankIsEstimate: boolean;
  freeTransfersIsEstimate: boolean;
  notes: string[];
}

/**
 * A greedy budget-aware optimiser: for every starter, find their single
 * best affordable replacement, then take the highest-gain transfers up to
 * the number of free transfers available (spending down the bank as it
 * goes). This is a heuristic, not an exhaustive search of every squad
 * combination — see the "estimate" framing in the UI.
 */
export function buildFixMyTeam(dataset: FplDataset, squad: Squad, teamAnalysis: TeamAnalysis): FixMyTeamResult {
  const playerById = new Map(dataset.players.map((p) => [p.id, p]));
  const analysisById = new Map(teamAnalysis.playerAnalyses.map((a) => [a.playerId, a]));
  const positionPopulations = buildPositionPopulations(dataset.players);
  const excludeIds = new Set(squad.picks.map((p) => p.playerId));

  const starters = squad.picks
    .filter((p) => p.isStarter)
    .map((p) => playerById.get(p.playerId))
    .filter((p): p is Player => !!p);

  const bankIsEstimate = squad.context.bank == null;
  const bank = squad.context.bank ?? 0;
  const freeTransfersIsEstimate = squad.context.freeTransfers == null;
  const highPriorityCount = teamAnalysis.weaknesses.filter((w) => w.priority !== 'low').length;
  const freeTransfers = squad.context.freeTransfers ?? Math.min(3, Math.max(1, highPriorityCount || 1));

  let combinationsConsidered = 0;
  const candidates: { current: Player; currentA: PlayerAnalysis; candidate: Player; candidateA: PlayerAnalysis; gain: number; cost: number }[] = [];

  for (const current of starters) {
    const currentA = analysisById.get(current.id);
    if (!currentA) continue;
    const pool = candidatePool(dataset, current.position, current.id, excludeIds);
    combinationsConsidered += pool.length;

    let best: { candidate: Player; analysis: PlayerAnalysis } | null = null;
    let bestScore = -Infinity;
    for (const candidate of pool) {
      if (!bankIsEstimate && candidate.price - current.price > bank + 0.001) continue;
      const analysis = computePlayerAnalysis(candidate, dataset, positionPopulations);
      const score = replacementScore(analysis);
      if (score > bestScore) {
        bestScore = score;
        best = { candidate, analysis };
      }
    }

    if (best) {
      const gain = round1(best.analysis.expectedPoints5gw - currentA.expectedPoints5gw);
      if (gain > 0.5) {
        candidates.push({
          current,
          currentA,
          candidate: best.candidate,
          candidateA: best.analysis,
          gain,
          cost: round1(best.candidate.price - current.price),
        });
      }
    }
  }

  candidates.sort((a, b) => b.gain - a.gain);

  const chosen: typeof candidates = [];
  const chosenInIds = new Set<number>();
  let remainingBank = bank;
  for (const c of candidates) {
    if (chosen.length >= freeTransfers) break;
    if (chosenInIds.has(c.candidate.id)) continue; // never suggest buying the same incoming player twice
    if (!bankIsEstimate && c.cost > remainingBank + 0.001) continue;
    chosen.push(c);
    chosenInIds.add(c.candidate.id);
    if (!bankIsEstimate) remainingBank -= c.cost;
  }

  const transfers = chosen.map((c) => buildTransferRecommendation(c.current, c.currentA, c.candidate, c.candidateA, squad));
  const projectedImprovementPoints = round1(chosen.reduce((s, c) => s + c.gain, 0));

  const notes: string[] = [
    'Projected improvement is a statistical estimate based on current data, not a guaranteed outcome.',
  ];
  if (bankIsEstimate) notes.push('Bank balance was not provided, so affordability is estimated — enter it in Settings for precise transfers.');
  if (freeTransfersIsEstimate) notes.push(`Free transfers were not provided — assumed ${freeTransfers} based on squad weaknesses found.`);
  if (squad.context.wildcardActive) notes.push('Wildcard active — price/bank constraints are relaxed for this suggestion.');

  return {
    transfers,
    projectedImprovementPoints,
    combinationsConsidered,
    freeTransfersUsed: chosen.length,
    bankIsEstimate,
    freeTransfersIsEstimate,
    notes,
  };
}
