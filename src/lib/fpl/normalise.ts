import type {
  Player,
  Team,
  Gameweek,
  Fixture,
  PlayerGameweekHistory,
  AvailabilityStatus,
} from '../../types';
import { ELEMENT_TYPE_TO_POSITION } from './constants';
import type {
  RawBootstrap,
  RawElement,
  RawTeam,
  RawEvent,
  RawFixture,
  RawElementSummary,
} from './rawTypes';

function num(v: string | undefined | null): number {
  if (v === undefined || v === null || v === '') return 0;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function numOrNull(v: string | undefined | null): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function setPieceSummary(el: RawElement): string | null {
  const roles: string[] = [];
  if (el.penalties_order === 1) roles.push('1st choice penalties');
  if (el.direct_freekicks_order === 1) roles.push('1st choice free kicks');
  if (el.corners_and_indirect_freekicks_order === 1) roles.push('1st choice corners');
  return roles.length ? roles.join(', ') : null;
}

function normalisePlayer(el: RawElement, teamById: Map<number, RawTeam>): Player {
  const team = teamById.get(el.team);
  return {
    id: el.id,
    code: el.code,
    firstName: el.first_name,
    secondName: el.second_name,
    displayName: el.web_name,
    teamId: el.team,
    team: team?.short_name ?? '???',
    teamName: team?.name ?? 'Unknown',
    position: ELEMENT_TYPE_TO_POSITION[el.element_type] ?? 'MID',
    price: el.now_cost / 10,
    totalPoints: el.total_points,
    eventPoints: el.event_points,
    minutes: el.minutes,
    starts: el.starts,
    goals: el.goals_scored,
    assists: el.assists,
    cleanSheets: el.clean_sheets,
    goalsConceded: el.goals_conceded,
    bonus: el.bonus,
    bps: el.bps,
    ictIndex: num(el.ict_index),
    influence: num(el.influence),
    creativity: num(el.creativity),
    threat: num(el.threat),
    form: num(el.form),
    pointsPerGame: num(el.points_per_game),
    selectedByPercent: num(el.selected_by_percent),
    transfersInEvent: el.transfers_in_event,
    transfersOutEvent: el.transfers_out_event,
    xG: numOrNull(el.expected_goals),
    xA: numOrNull(el.expected_assists),
    xGI: numOrNull(el.expected_goal_involvements),
    xGC: numOrNull(el.expected_goals_conceded),
    saves: el.saves,
    penaltiesSaved: el.penalties_saved,
    penaltiesMissed: el.penalties_missed,
    yellowCards: el.yellow_cards,
    redCards: el.red_cards,
    ownGoals: el.own_goals,
    status: (el.status as AvailabilityStatus) ?? 'a',
    news: el.news ?? '',
    chanceOfPlayingNextRound: el.chance_of_playing_next_round,
    dreamTeamCount: el.dreamteam_count,
    setPieceNotes: setPieceSummary(el),
  };
}

function normaliseTeam(t: RawTeam): Team {
  return {
    id: t.id,
    name: t.name,
    shortName: t.short_name,
    strengthOverallHome: t.strength_overall_home,
    strengthOverallAway: t.strength_overall_away,
    strengthAttackHome: t.strength_attack_home,
    strengthAttackAway: t.strength_attack_away,
    strengthDefenceHome: t.strength_defence_home,
    strengthDefenceAway: t.strength_defence_away,
  };
}

function normaliseEvent(e: RawEvent): Gameweek {
  return {
    id: e.id,
    name: e.name,
    deadlineTime: e.deadline_time,
    isCurrent: e.is_current,
    isNext: e.is_next,
    finished: e.finished,
  };
}

export function normaliseFixture(f: RawFixture): Fixture {
  return {
    id: f.id,
    gameweek: f.event,
    kickoffTime: f.kickoff_time,
    finished: f.finished,
    homeTeamId: f.team_h,
    awayTeamId: f.team_a,
    homeDifficulty: f.team_h_difficulty,
    awayDifficulty: f.team_a_difficulty,
    homeScore: f.team_h_score,
    awayScore: f.team_a_score,
  };
}

export function normaliseBootstrap(raw: RawBootstrap): { players: Player[]; teams: Team[]; events: Gameweek[] } {
  const teamById = new Map(raw.teams.map((t) => [t.id, t]));
  return {
    players: raw.elements.map((el) => normalisePlayer(el, teamById)),
    teams: raw.teams.map(normaliseTeam),
    events: raw.events.map(normaliseEvent),
  };
}

export function normaliseElementSummary(raw: RawElementSummary): {
  history: PlayerGameweekHistory[];
  fixtures: Fixture[];
} {
  return {
    history: raw.history.map((h) => ({
      gameweek: h.round,
      points: h.total_points,
      minutes: h.minutes,
      goals: h.goals_scored,
      assists: h.assists,
      bonus: h.bonus,
      cleanSheets: h.clean_sheets,
      xG: numOrNull(h.expected_goals),
      xA: numOrNull(h.expected_assists),
      wasHome: h.was_home,
      opponentTeamId: h.opponent_team,
    })),
    fixtures: raw.fixtures.map(normaliseFixture),
  };
}
