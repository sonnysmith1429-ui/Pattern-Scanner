import type { Position } from '../../types';

export const POSITIONS: Position[] = ['GKP', 'DEF', 'MID', 'FWD'];

export const POSITION_LABELS: Record<Position, string> = {
  GKP: 'Goalkeeper',
  DEF: 'Defender',
  MID: 'Midfielder',
  FWD: 'Forward',
};

export const POSITION_COLORS: Record<Position, string> = {
  GKP: '#fbbf24',
  DEF: '#38bdf8',
  MID: '#34d399',
  FWD: '#fb7185',
};

export const POSITION_SQUAD_SLOTS: Record<Position, number> = {
  GKP: 2,
  DEF: 5,
  MID: 5,
  FWD: 3,
};

export const SQUAD_SIZE = 15;
export const STARTING_XI_SIZE = 11;

/** Below this, a player's sample size is too small to trust rate-based stats. */
export const MIN_MINUTES_THRESHOLD = 270;

export const ELEMENT_TYPE_TO_POSITION: Record<number, Position> = {
  1: 'GKP',
  2: 'DEF',
  3: 'MID',
  4: 'FWD',
};

export const AVAILABILITY_LABELS: Record<string, string> = {
  a: 'Available',
  d: 'Doubtful',
  i: 'Injured',
  s: 'Suspended',
  u: 'Unavailable',
  n: 'Not in squad',
};

export function playerPhotoUrl(code: number): string {
  return `https://resources.premierleague.com/premierleague/photos/players/110x140/p${code}.png`;
}

export function teamBadgeUrl(teamCode: number): string {
  return `https://resources.premierleague.com/premierleague/badges/70/t${teamCode}.png`;
}

export function scoreTier(score: number): 'poor' | 'below-average' | 'decent' | 'strong' | 'elite' {
  if (score >= 90) return 'elite';
  if (score >= 75) return 'strong';
  if (score >= 60) return 'decent';
  if (score >= 40) return 'below-average';
  return 'poor';
}

export const TIER_LABELS: Record<ReturnType<typeof scoreTier>, string> = {
  elite: 'Elite',
  strong: 'Strong',
  decent: 'Decent',
  'below-average': 'Below average',
  poor: 'Poor',
};

/** Tailwind-safe colour tokens per tier — deliberately muted, not neon. */
export const TIER_COLORS: Record<ReturnType<typeof scoreTier>, { text: string; ring: string; bg: string }> = {
  elite: { text: 'text-emerald-400', ring: 'stroke-emerald-400', bg: 'bg-emerald-400/10' },
  strong: { text: 'text-teal-400', ring: 'stroke-teal-400', bg: 'bg-teal-400/10' },
  decent: { text: 'text-sky-400', ring: 'stroke-sky-400', bg: 'bg-sky-400/10' },
  'below-average': { text: 'text-amber-400', ring: 'stroke-amber-400', bg: 'bg-amber-400/10' },
  poor: { text: 'text-rose-400', ring: 'stroke-rose-400', bg: 'bg-rose-400/10' },
};

export const TIER_HEX: Record<ReturnType<typeof scoreTier>, string> = {
  elite: '#34d399',
  strong: '#2dd4bf',
  decent: '#38bdf8',
  'below-average': '#fbbf24',
  poor: '#fb7185',
};
