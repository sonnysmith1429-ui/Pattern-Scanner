import type { FplDataset, Player, Squad, TeamAnalysis, TransferRecommendation } from '../../types';
import { buildPositionPopulations } from '../analytics';
import { buildTransferRecommendation, findBestReplacement } from './shared';

/**
 * Ranks a replacement for every starter, keeps only the ones that actually
 * beat the incumbent, and returns the strongest transfers overall.
 * Affordability is not enforced here (see fixMyTeam.ts for the
 * budget-constrained version) — this list is "what's out there", the UI
 * flags each card as affordable or not against the entered bank.
 */
export function buildTopRecommendations(dataset: FplDataset, squad: Squad, teamAnalysis: TeamAnalysis): TransferRecommendation[] {
  const playerById = new Map(dataset.players.map((p) => [p.id, p]));
  const analysisById = new Map(teamAnalysis.playerAnalyses.map((a) => [a.playerId, a]));
  const positionPopulations = buildPositionPopulations(dataset.players);
  const excludeIds = new Set(squad.picks.map((p) => p.playerId));

  // Weakest players get first pick of the best replacement — once a candidate
  // is recommended in for one player, they're excluded from later searches
  // so the same incoming player is never suggested twice in one list.
  const starters = squad.picks
    .filter((p) => p.isStarter)
    .map((p) => playerById.get(p.playerId))
    .filter((p): p is Player => !!p)
    .sort((a, b) => (analysisById.get(a.id)?.overallScore ?? 100) - (analysisById.get(b.id)?.overallScore ?? 100));

  const recommendations: TransferRecommendation[] = [];
  for (const current of starters) {
    const currentA = analysisById.get(current.id);
    if (!currentA) continue;
    const best = findBestReplacement(current, currentA, dataset, positionPopulations, excludeIds, false, squad.context.bank);
    if (!best) continue;
    recommendations.push(buildTransferRecommendation(current, currentA, best.candidate, best.analysis, squad));
    excludeIds.add(best.candidate.id);
  }

  return recommendations.sort((a, b) => b.projectedGainPoints - a.projectedGainPoints).slice(0, 6);
}
