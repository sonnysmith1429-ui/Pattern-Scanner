/**
 * Normalised FPL domain types.
 * These are what the rest of the app consumes — never the raw bootstrap-static
 * shape. See src/lib/fpl/normalise.ts for the raw -> normalised mapping, which
 * is the single place that needs updating if the upstream API changes shape.
 */

export type Position = 'GKP' | 'DEF' | 'MID' | 'FWD';

export type AvailabilityStatus = 'a' | 'd' | 'i' | 's' | 'u' | 'n';

export interface Player {
  id: number;
  code: number;
  firstName: string;
  secondName: string;
  displayName: string;
  teamId: number;
  team: string;
  teamName: string;
  position: Position;
  price: number;
  totalPoints: number;
  eventPoints: number;
  minutes: number;
  starts: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  goalsConceded: number;
  bonus: number;
  bps: number;
  ictIndex: number;
  influence: number;
  creativity: number;
  threat: number;
  form: number;
  pointsPerGame: number;
  selectedByPercent: number;
  transfersInEvent: number;
  transfersOutEvent: number;
  xG: number | null;
  xA: number | null;
  xGI: number | null;
  xGC: number | null;
  saves: number;
  penaltiesSaved: number;
  penaltiesMissed: number;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
  status: AvailabilityStatus;
  news: string;
  chanceOfPlayingNextRound: number | null;
  dreamTeamCount: number;
  setPieceNotes: string | null;
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  strengthOverallHome: number;
  strengthOverallAway: number;
  strengthAttackHome: number;
  strengthAttackAway: number;
  strengthDefenceHome: number;
  strengthDefenceAway: number;
}

export interface Gameweek {
  id: number;
  name: string;
  deadlineTime: string;
  isCurrent: boolean;
  isNext: boolean;
  finished: boolean;
}

export interface Fixture {
  id: number;
  gameweek: number | null;
  kickoffTime: string | null;
  finished: boolean;
  homeTeamId: number;
  awayTeamId: number;
  homeDifficulty: number;
  awayDifficulty: number;
  homeScore: number | null;
  awayScore: number | null;
}

export type DataSource = 'live' | 'cache' | 'mock';

export interface DataFreshness {
  source: DataSource;
  fetchedAt: string;
  note?: string;
}

export interface FplDataset {
  players: Player[];
  teams: Team[];
  events: Gameweek[];
  fixtures: Fixture[];
  freshness: DataFreshness;
}

export interface PlayerGameweekHistory {
  gameweek: number;
  points: number;
  minutes: number;
  goals: number;
  assists: number;
  bonus: number;
  cleanSheets: number;
  xG: number | null;
  xA: number | null;
  wasHome: boolean;
  opponentTeamId: number;
}

/** A single upcoming fixture for a player, with resolved opponent + difficulty. */
export interface UpcomingFixture {
  fixtureId: number;
  gameweek: number | null;
  opponent: string;
  isHome: boolean;
  difficulty: number;
  kickoffTime: string | null;
}
