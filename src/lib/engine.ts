import type { FplDataset, Squad, TeamAnalysis } from '../types';
import { computeTeamAnalysis } from './analytics';
import { buildTopRecommendations } from './recommendations';

/**
 * The one function the UI calls to go from (dataset, squad) -> full
 * TeamAnalysis. Runs the statistics engine, then the recommendation engine,
 * then folds recommendations back into each weakness's suggestedReplacementIds.
 * Kept out of lib/analytics and lib/recommendations so neither has to import
 * the other.
 */
export function analyseSquad(dataset: FplDataset, squad: Squad): TeamAnalysis {
  const base = computeTeamAnalysis(dataset, squad);
  const recommendations = buildTopRecommendations(dataset, squad, base);

  const weaknesses = base.weaknesses.map((w) => ({
    ...w,
    suggestedReplacementIds: recommendations.filter((r) => w.affectedPlayerIds.includes(r.outPlayerId)).map((r) => r.inPlayerId),
  }));

  return { ...base, recommendations, weaknesses };
}
