import type { Player, PlayerAnalysis, CaptainSuggestion } from '../../types';
import { round1 } from './normalise';

function reasonFor(player: Player, analysis: PlayerAnalysis): string {
  const bits: string[] = [];
  if (analysis.formScore >= 70) bits.push(`strong recent form (${player.form.toFixed(1)} pts/game)`);
  if (analysis.fixtureScore >= 65) bits.push('favourable upcoming fixtures');
  if (analysis.attackingScore >= 70) bits.push('high attacking output for the position');
  if (!bits.length) bits.push('the best balance of expected returns and reliability in your starting XI');
  return `Backed by ${bits.join(' and ')}.`;
}

export function computeCaptainSuggestion(starters: Player[], analyses: PlayerAnalysis[]): CaptainSuggestion {
  const byId = new Map(analyses.map((a) => [a.playerId, a]));
  const ranked = [...starters]
    .filter((p) => byId.has(p.id))
    .sort((a, b) => (byId.get(b.id)?.expectedPoints5gw ?? 0) - (byId.get(a.id)?.expectedPoints5gw ?? 0));

  const best = ranked[0];
  const alt = ranked[1];
  if (!best) {
    return {
      bestPlayerId: 0,
      bestProjectedPoints: 0,
      bestReason: 'No starting XI detected.',
      alternativePlayerId: null,
      alternativeProjectedPoints: null,
      alternativeReason: null,
    };
  }

  const bestAnalysis = byId.get(best.id) as PlayerAnalysis;
  const bestProjected = round1((bestAnalysis.expectedPoints5gw / 5) * 2);

  const result: CaptainSuggestion = {
    bestPlayerId: best.id,
    bestProjectedPoints: bestProjected,
    bestReason: reasonFor(best, bestAnalysis),
    alternativePlayerId: null,
    alternativeProjectedPoints: null,
    alternativeReason: null,
  };

  if (alt) {
    const altAnalysis = byId.get(alt.id) as PlayerAnalysis;
    result.alternativePlayerId = alt.id;
    result.alternativeProjectedPoints = round1((altAnalysis.expectedPoints5gw / 5) * 2);
    result.alternativeReason = reasonFor(alt, altAnalysis);
  }

  return result;
}
