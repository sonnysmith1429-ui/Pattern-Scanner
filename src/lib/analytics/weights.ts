/**
 * Every weight the analytics engine uses lives here. Change a number here to
 * retune the whole scoring model — nothing else needs to change.
 * Each weighted group below sums to 1.0.
 */

/** Team Rating = sum of these, each category already scored 0-100. */
export const CATEGORY_WEIGHTS = {
  playerQuality: 0.25,
  form: 0.2,
  fixtures: 0.2,
  value: 0.15,
  squadBalance: 0.1,
  availability: 0.1,
} as const;

/** How a single player's overallScore is built from their component scores. */
export const PLAYER_SCORE_WEIGHTS = {
  quality: 0.35,
  form: 0.2,
  fixtures: 0.2,
  value: 0.15,
  risk: 0.1,
} as const;

/** Attacking vs defensive contribution to a player's "quality" sub-score, per position. */
export const POSITION_QUALITY_WEIGHTS: Record<'GKP' | 'DEF' | 'MID' | 'FWD', { attacking: number; defensive: number }> = {
  GKP: { attacking: 0.1, defensive: 0.9 },
  DEF: { attacking: 0.45, defensive: 0.55 },
  MID: { attacking: 0.72, defensive: 0.28 },
  FWD: { attacking: 0.88, defensive: 0.12 },
};

/** Near-term fixtures matter more than distant ones, but all three windows count. */
export const FIXTURE_WINDOW_WEIGHTS = { next3: 0.5, next5: 0.3, next8: 0.2 };

export const EXPECTED_POINTS_FIXTURE_COUNT = 5;
