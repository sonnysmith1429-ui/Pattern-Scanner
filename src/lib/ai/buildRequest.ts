import type { FplDataset, Squad, TeamAnalysis, AIAnalysisRequest } from '../../types';

/** Converts already-computed analytics output into the structured payload sent to the AI layer. */
export function buildAiRequest(dataset: FplDataset, squad: Squad, teamAnalysis: TeamAnalysis): AIAnalysisRequest {
  const playerById = new Map(dataset.players.map((p) => [p.id, p]));
  const analysisById = new Map(teamAnalysis.playerAnalyses.map((a) => [a.playerId, a]));

  const squadSummary = squad.picks
    .map((pick) => {
      const player = playerById.get(pick.playerId);
      const analysis = analysisById.get(pick.playerId);
      if (!player || !analysis) return null;
      return {
        playerId: player.id,
        name: player.displayName,
        position: player.position,
        price: player.price,
        isStarter: pick.isStarter,
        overallScore: analysis.overallScore,
        form: player.form,
        notes: analysis.notes,
      };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  const weaknesses = teamAnalysis.weaknesses.map((w) => ({
    title: w.title,
    priority: w.priority,
    description: w.description,
  }));

  const topRecommendations = teamAnalysis.recommendations.slice(0, 4).map((r) => ({
    outName: playerById.get(r.outPlayerId)?.displayName ?? `#${r.outPlayerId}`,
    inName: playerById.get(r.inPlayerId)?.displayName ?? `#${r.inPlayerId}`,
    reasons: r.reasons,
    projectedGainPoints: r.projectedGainPoints,
  }));

  const captainPlayer = playerById.get(teamAnalysis.captain.bestPlayerId);
  const hasXG = squad.picks.some((p) => {
    const player = playerById.get(p.playerId);
    return player && player.xG != null;
  });

  return {
    overallScore: teamAnalysis.overallScore,
    categoryScores: teamAnalysis.categoryScores,
    squadSummary,
    weaknesses,
    topRecommendations,
    captain: {
      name: captainPlayer?.displayName ?? 'Unknown',
      projectedPoints: teamAnalysis.captain.bestProjectedPoints,
      reason: teamAnalysis.captain.bestReason,
    },
    benchScore: teamAnalysis.bench.score,
    dataAvailable: {
      hasXG,
      hasFixtures: dataset.fixtures.length > 0,
      hasBank: squad.context.bank != null,
    },
  };
}
