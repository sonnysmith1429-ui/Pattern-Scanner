import type { FplDataset, Squad, Player, PlayerAnalysis, TeamAnalysis, CategoryScores } from '../../types';
import { buildPositionPopulations, clamp } from './normalise';
import { computePlayerAnalysis } from './playerScore';
import { computeBenchAnalysis } from './bench';
import { computeSquadStructure } from './structure';
import { computeCaptainSuggestion } from './captaincy';
import { buildWeaknesses } from './weaknesses';
import { CATEGORY_WEIGHTS } from './weights';
import { scoreTier } from '../fpl/constants';

interface WeightedPlayer {
  player: Player;
  analysis: PlayerAnalysis;
  weight: number;
}

function weightedAverage(items: WeightedPlayer[], select: (a: PlayerAnalysis) => number): number {
  const weightSum = items.reduce((s, i) => s + i.weight, 0);
  if (weightSum === 0) return 0;
  const total = items.reduce((s, i) => s + select(i.analysis) * i.weight, 0);
  return Math.round(total / weightSum);
}

function computeSquadBalanceScore(
  structure: ReturnType<typeof computeSquadStructure>,
  starters: Player[],
  analyses: PlayerAnalysis[],
): number {
  let score = 100;
  const byId = new Map(analyses.map((a) => [a.playerId, a]));

  const topClub = structure.clubConcentration[0];
  if (topClub && topClub.count >= 3) score -= 15 * (topClub.count - 2);

  if (structure.premiumCount === 0) score -= 10;
  if (structure.premiumCount >= 5) score -= 10;

  if (structure.totalValue > 0) {
    const maxShare = Math.max(...Object.values(structure.spendByPosition)) / structure.totalValue;
    if (maxShare > 0.42) score -= 15;
  }

  if (structure.benchSpend < 14) score -= 10;
  else if (structure.totalValue > 0 && structure.benchSpend > structure.totalValue * 0.22) score -= 8;

  const captainOptions = starters.filter((p) => (byId.get(p.id)?.overallScore ?? 0) >= 70).length;
  if (captainOptions === 0) score -= 15;
  else if (captainOptions === 1) score -= 5;

  return clamp(Math.round(score), 0, 100);
}

export function computeTeamAnalysis(dataset: FplDataset, squad: Squad): TeamAnalysis {
  const playerById = new Map(dataset.players.map((p) => [p.id, p]));
  const resolvedPicks = squad.picks
    .map((pick) => ({ pick, player: playerById.get(pick.playerId) }))
    .filter((x): x is { pick: (typeof squad.picks)[number]; player: Player } => !!x.player);

  const starters = resolvedPicks.filter((x) => x.pick.isStarter).map((x) => x.player);
  const bench = resolvedPicks.filter((x) => !x.pick.isStarter).map((x) => x.player);
  const allPicks = [...starters, ...bench];

  const positionPopulations = buildPositionPopulations(dataset.players);
  const analyses = allPicks.map((p) => computePlayerAnalysis(p, dataset, positionPopulations));
  const analysisById = new Map(analyses.map((a) => [a.playerId, a]));

  const weighted: WeightedPlayer[] = allPicks.map((player) => ({
    player,
    analysis: analysisById.get(player.id) as PlayerAnalysis,
    weight: starters.some((s) => s.id === player.id) ? 1 : 0.4,
  }));

  const structure = computeSquadStructure(allPicks, bench);
  const bench_ = computeBenchAnalysis(bench, analyses);

  const categoryScores: CategoryScores = {
    playerQuality: weightedAverage(weighted, (a) => a.attackingScore * 0.5 + a.defensiveScore * 0.5),
    form: weightedAverage(weighted, (a) => a.formScore),
    fixtures: weightedAverage(weighted, (a) => a.fixtureScore),
    value: weightedAverage(weighted, (a) => a.valueScore),
    squadBalance: computeSquadBalanceScore(structure, starters, analyses),
    availability: weightedAverage(weighted, (a) => a.riskScore),
  };

  const overallScore = clamp(
    Math.round(
      categoryScores.playerQuality * CATEGORY_WEIGHTS.playerQuality +
        categoryScores.form * CATEGORY_WEIGHTS.form +
        categoryScores.fixtures * CATEGORY_WEIGHTS.fixtures +
        categoryScores.value * CATEGORY_WEIGHTS.value +
        categoryScores.squadBalance * CATEGORY_WEIGHTS.squadBalance +
        categoryScores.availability * CATEGORY_WEIGHTS.availability,
    ),
    0,
    100,
  );

  const weaknesses = buildWeaknesses(starters, bench, analyses, bench_, structure);
  const captain = computeCaptainSuggestion(starters, analyses);

  return {
    overallScore,
    tier: scoreTier(overallScore),
    categoryScores,
    playerAnalyses: analyses,
    weaknesses,
    recommendations: [],
    captain,
    bench: bench_,
    structure,
    generatedAt: new Date().toISOString(),
  };
}
