import type { Player, Position } from '../../types';
import { MIN_MINUTES_THRESHOLD } from '../fpl/constants';

export function per90(value: number, minutes: number): number {
  return minutes > 0 ? (value / minutes) * 90 : 0;
}

export function perMillion(value: number, price: number): number {
  return price > 0 ? value / price : 0;
}

export function percentileRank(value: number, pool: number[]): number {
  if (!pool.length) return 50;
  const below = pool.filter((v) => v <= value).length;
  return Math.round((below / pool.length) * 100);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Players grouped by position, restricted to those who clear the minimum
 * minutes threshold so a couple of good substitute appearances don't skew
 * rate stats. Falls back to the full position group if too few players
 * clear the bar (e.g. very early season).
 */
export function buildPositionPopulations(players: Player[]): Record<Position, Player[]> {
  const groups: Record<Position, Player[]> = { GKP: [], DEF: [], MID: [], FWD: [] };
  for (const p of players) groups[p.position].push(p);

  const result: Record<Position, Player[]> = { GKP: [], DEF: [], MID: [], FWD: [] };
  for (const pos of Object.keys(groups) as Position[]) {
    const eligible = groups[pos].filter((p) => p.minutes >= MIN_MINUTES_THRESHOLD);
    result[pos] = eligible.length >= 5 ? eligible : groups[pos];
  }
  return result;
}

/** True when a player's sample size is too small for rate stats to be trustworthy. */
export function hasSmallSample(player: Player): boolean {
  return player.minutes < MIN_MINUTES_THRESHOLD;
}
