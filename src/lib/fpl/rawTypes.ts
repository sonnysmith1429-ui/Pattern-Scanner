/**
 * Minimal typings for the official FPL API's raw JSON shapes (snake_case).
 * Only the fields this app reads are declared. If the upstream API adds or
 * renames fields, this is the only file that should need updating alongside
 * normalise.ts.
 */

export interface RawElement {
  id: number;
  code: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number;
  element_type: number;
  now_cost: number;
  total_points: number;
  event_points: number;
  minutes: number;
  starts: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  bonus: number;
  bps: number;
  ict_index: string;
  influence: string;
  creativity: string;
  threat: string;
  form: string;
  points_per_game: string;
  selected_by_percent: string;
  transfers_in_event: number;
  transfers_out_event: number;
  expected_goals?: string;
  expected_assists?: string;
  expected_goal_involvements?: string;
  expected_goals_conceded?: string;
  saves: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  own_goals: number;
  status: string;
  news: string;
  chance_of_playing_next_round: number | null;
  dreamteam_count: number;
  penalties_order: number | null;
  direct_freekicks_order: number | null;
  corners_and_indirect_freekicks_order: number | null;
}

export interface RawTeam {
  id: number;
  code: number;
  name: string;
  short_name: string;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
}

export interface RawEvent {
  id: number;
  name: string;
  deadline_time: string;
  is_current: boolean;
  is_next: boolean;
  finished: boolean;
}

export interface RawBootstrap {
  elements: RawElement[];
  teams: RawTeam[];
  events: RawEvent[];
}

export interface RawFixture {
  id: number;
  event: number | null;
  kickoff_time: string | null;
  finished: boolean;
  team_h: number;
  team_a: number;
  team_h_difficulty: number;
  team_a_difficulty: number;
  team_h_score: number | null;
  team_a_score: number | null;
}

export interface RawElementSummaryHistory {
  round: number;
  total_points: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  bonus: number;
  clean_sheets: number;
  expected_goals?: string;
  expected_assists?: string;
  was_home: boolean;
  opponent_team: number;
}

export interface RawElementSummary {
  history: RawElementSummaryHistory[];
  fixtures: RawFixture[];
}

export interface RawManagerPick {
  element: number;
  position: number;
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
}

export interface RawManagerPicksResponse {
  picks: RawManagerPick[];
  entry_history: { bank: number; event_transfers: number };
}
