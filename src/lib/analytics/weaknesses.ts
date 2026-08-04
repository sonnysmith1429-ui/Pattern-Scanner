import type { Player, PlayerAnalysis, Weakness, BenchAnalysis, SquadStructure } from '../../types';
import { POSITION_LABELS } from '../fpl/constants';

let counter = 0;
function id(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

/**
 * Weaknesses are derived purely from the already-computed scores — nothing
 * here invents a new statistic, it just decides what's worth surfacing and
 * how urgently. suggestedReplacementIds starts empty; the top-level engine
 * (lib/engine.ts) fills it in once the recommendation engine has run.
 */
export function buildWeaknesses(
  starters: Player[],
  bench: Player[],
  analyses: PlayerAnalysis[],
  benchAnalysis: BenchAnalysis,
  structure: SquadStructure,
): Weakness[] {
  const byId = new Map(analyses.map((a) => [a.playerId, a]));
  const weaknesses: Weakness[] = [];

  const weakStarters = starters
    .map((p) => ({ player: p, analysis: byId.get(p.id) }))
    .filter((x): x is { player: Player; analysis: PlayerAnalysis } => !!x.analysis && x.analysis.overallScore < 48)
    .sort((a, b) => a.analysis.overallScore - b.analysis.overallScore);

  for (const { player, analysis } of weakStarters.slice(0, 3)) {
    const priority = analysis.overallScore < 32 ? 'high' : analysis.overallScore < 42 ? 'medium' : 'low';
    const reasons: string[] = [];
    if (analysis.formScore < 40) reasons.push('poor recent form');
    if (analysis.fixtureScore < 40) reasons.push('difficult upcoming fixtures');
    if (analysis.valueScore < 40) reasons.push('weak points return for the price');
    if (analysis.riskScore < 50) reasons.push('availability/rotation risk');
    if (!reasons.length) reasons.push('below-average output for the position');

    weaknesses.push({
      id: id('weak-player'),
      title: `${POSITION_LABELS[player.position]}: ${player.displayName}`,
      priority,
      description: `${player.displayName} rates ${analysis.overallScore}/100 (${analysis.percentileVsPosition}th percentile among ${player.position}s), driven by ${reasons.join(' and ')}.`,
      affectedPlayerIds: [player.id],
      suggestedReplacementIds: [],
    });
  }

  const riskyStarters = starters
    .map((p) => ({ player: p, analysis: byId.get(p.id) }))
    .filter(
      (x): x is { player: Player; analysis: PlayerAnalysis } =>
        !!x.analysis && x.analysis.riskScore < 45 && !weakStarters.some((w) => w.player.id === x.player.id),
    );
  for (const { player, analysis } of riskyStarters) {
    weaknesses.push({
      id: id('risk'),
      title: `Availability risk: ${player.displayName}`,
      priority: analysis.riskScore < 20 ? 'high' : 'medium',
      description:
        player.status !== 'a'
          ? `${player.displayName} is flagged "${player.status}"${player.news ? `: ${player.news}` : ''} — this is a starter whose involvement is uncertain.`
          : `${player.displayName} has an inconsistent minutes record this season (risk score ${analysis.riskScore}/100), creating rotation risk in your starting XI.`,
      affectedPlayerIds: [player.id],
      suggestedReplacementIds: [],
    });
  }

  if (benchAnalysis.score < 45) {
    weaknesses.push({
      id: id('bench'),
      title: 'Bench depth',
      priority: 'low',
      description: `Bench strength is ${benchAnalysis.score}/100. ${benchAnalysis.notes.join(' ')}`,
      affectedPlayerIds: bench.map((p) => p.id),
      suggestedReplacementIds: [],
    });
  }

  const topClub = structure.clubConcentration[0];
  if (topClub && topClub.count >= 3) {
    weaknesses.push({
      id: id('structure'),
      title: 'Club concentration',
      priority: 'low',
      description: `${topClub.count} players from ${topClub.teamName} — a poor fixture for that club would hit a large part of your squad at once.`,
      affectedPlayerIds: [],
      suggestedReplacementIds: [],
    });
  }

  const priorityOrder: Record<Weakness['priority'], number> = { high: 0, medium: 1, low: 2 };
  return weaknesses.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
