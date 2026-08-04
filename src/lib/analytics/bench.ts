import type { Player, PlayerAnalysis, BenchAnalysis } from '../../types';

/**
 * Bench Strength considers expected minutes, price efficiency and fixtures
 * of the four bench players — weighted towards the first sub, since that's
 * the player most likely to actually be used.
 */
export function computeBenchAnalysis(benchPlayers: Player[], analyses: PlayerAnalysis[]): BenchAnalysis {
  if (!benchPlayers.length) {
    return { score: 0, expectedMinutesAvg: 0, totalBenchCost: 0, notes: ['No bench players detected.'] };
  }

  const weights = [0.4, 0.3, 0.2, 0.1];
  const byId = new Map(analyses.map((a) => [a.playerId, a]));

  let weightedScore = 0;
  let weightSum = 0;
  let minutesSum = 0;

  benchPlayers.forEach((p, i) => {
    const a = byId.get(p.id);
    if (!a) return;
    const w = weights[i] ?? 0.1;
    const playerScore = a.minutesScore * 0.55 + a.overallScore * 0.45;
    weightedScore += playerScore * w;
    weightSum += w;
    minutesSum += a.minutesScore;
  });

  const score = Math.round(weightSum > 0 ? weightedScore / weightSum : 0);
  const expectedMinutesAvg = Math.round((minutesSum / benchPlayers.length) * 0.9);
  const totalBenchCost = Math.round(benchPlayers.reduce((s, p) => s + p.price, 0) * 10) / 10;

  const notes: string[] = [];
  if (score < 45) notes.push('Bench offers little cover — most bench players see limited minutes.');
  else if (score >= 70) notes.push('Bench players are regular starters for their clubs, giving genuine cover.');
  if (totalBenchCost < 16) notes.push(`Only £${totalBenchCost.toFixed(1)}m tied up on the bench, leaving more budget for starters.`);
  else notes.push(`£${totalBenchCost.toFixed(1)}m tied up on the bench — consider whether that could be better spent on starters.`);

  return { score, expectedMinutesAvg, totalBenchCost, notes };
}
