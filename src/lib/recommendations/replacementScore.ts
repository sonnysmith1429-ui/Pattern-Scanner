import type { PlayerAnalysis } from '../../types';

/**
 * Replacement Score = Expected Points + Fixture Score + Form + Value
 *                      + Minutes Security - Rotation Risk
 *
 * Not a percentage — just a ranking number used to compare same-position,
 * price-eligible candidates against each other and against the incumbent.
 */
export function replacementScore(analysis: PlayerAnalysis): number {
  return (
    analysis.expectedPoints5gw * 4 +
    analysis.fixtureScore * 0.3 +
    analysis.formScore * 0.3 +
    analysis.valueScore * 0.25 +
    analysis.minutesScore * 0.15 -
    (100 - analysis.riskScore) * 0.2
  );
}
