import type { Player, UpcomingFixture } from '../../types';
import { averageDifficulty } from '../fpl/fixtures';
import { clamp, round1 } from './normalise';
import { EXPECTED_POINTS_FIXTURE_COUNT } from './weights';

/**
 * Transparent projected-points model:
 *
 *   Expected Points = Base Performance
 *                    x Form Modifier
 *                    x Fixture Modifier
 *                    x Minutes Probability
 *                    x Availability Modifier
 *
 * This is a statistical estimate, not a prediction — see the disclaimer
 * shown everywhere "Projected points" appears in the UI.
 */
export function availabilityModifier(player: Player): number {
  if (player.status === 'a') return 1;
  if (player.status === 'd') return player.chanceOfPlayingNextRound != null ? player.chanceOfPlayingNextRound / 100 : 0.5;
  if (player.status === 'i' || player.status === 's') return 0.05;
  return 0;
}

export function minutesProbability(player: Player, gamesPlayedSoFar: number): number {
  const possibleMinutes = Math.max(1, gamesPlayedSoFar) * 90;
  return clamp(player.minutes / possibleMinutes, 0, 1);
}

export function fixtureModifier(fixtures: UpcomingFixture[], count = EXPECTED_POINTS_FIXTURE_COUNT): number {
  const avgDiff = averageDifficulty(fixtures, count);
  return clamp(1 + (3 - avgDiff) * 0.08, 0.7, 1.3);
}

export function formModifier(player: Player): number {
  if (player.pointsPerGame <= 0) return 1;
  return clamp(player.form / Math.max(player.pointsPerGame, 0.5), 0.6, 1.6);
}

export interface ExpectedPointsBreakdown {
  basePerformance: number;
  formModifier: number;
  fixtureModifier: number;
  minutesProbability: number;
  availabilityModifier: number;
  perGameExpected: number;
  totalExpected: number;
  fixturesUsed: number;
}

export function computeExpectedPoints(
  player: Player,
  upcomingFixtures: UpcomingFixture[],
  gamesPlayedSoFar: number,
  fixtureCount = EXPECTED_POINTS_FIXTURE_COUNT,
): ExpectedPointsBreakdown {
  const basePerformance = player.pointsPerGame;
  const fm = formModifier(player);
  const fx = fixtureModifier(upcomingFixtures, fixtureCount);
  const mp = minutesProbability(player, gamesPlayedSoFar);
  const am = availabilityModifier(player);
  const perGameExpected = basePerformance * fm * fx * mp * am;
  const fixturesUsed = Math.min(fixtureCount, upcomingFixtures.length) || fixtureCount;

  return {
    basePerformance: round1(basePerformance),
    formModifier: round1(fm),
    fixtureModifier: round1(fx),
    minutesProbability: round1(mp),
    availabilityModifier: round1(am),
    perGameExpected: round1(perGameExpected),
    totalExpected: round1(perGameExpected * fixturesUsed),
    fixturesUsed,
  };
}
