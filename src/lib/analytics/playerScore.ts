import type { Player, Position, FplDataset, PlayerAnalysis } from '../../types';
import { getUpcomingFixturesForTeam, averageDifficulty, getCurrentGameweek } from '../fpl/fixtures';
import { per90, percentileRank, clamp, round1, hasSmallSample } from './normalise';
import { computeExpectedPoints } from './expectedPoints';
import { POSITION_QUALITY_WEIGHTS, PLAYER_SCORE_WEIGHTS, FIXTURE_WINDOW_WEIGHTS } from './weights';

function attackRaw(p: Player): number {
  const xG = p.xG ?? 0;
  const xA = p.xA ?? 0;
  switch (p.position) {
    case 'GKP':
      return 0;
    case 'DEF':
      return per90(p.goals * 6 + p.assists * 4 + xG * 4 + xA * 3 + p.threat * 0.02 + p.creativity * 0.02, p.minutes);
    case 'MID':
      return per90(p.goals * 5 + p.assists * 4 + xG * 4 + xA * 4 + p.threat * 0.03 + p.creativity * 0.03, p.minutes);
    case 'FWD':
      return per90(p.goals * 5 + p.assists * 3 + xG * 5 + xA * 3 + p.threat * 0.04, p.minutes);
  }
}

function defenseRaw(p: Player): number {
  switch (p.position) {
    case 'GKP':
      return per90(p.cleanSheets * 5 + p.saves * 0.6 + p.bonus * 0.5, p.minutes) - per90(p.goalsConceded * 0.3, p.minutes);
    case 'DEF':
      return per90(p.cleanSheets * 5 + p.bonus * 0.4, p.minutes) - per90(p.goalsConceded * 0.4, p.minutes);
    case 'MID':
      return per90(p.cleanSheets * 1.2 + p.bonus * 0.2, p.minutes);
    case 'FWD':
      return per90(p.bonus * 0.15, p.minutes);
  }
}

function noteBuilder(
  player: Player,
  scores: Pick<PlayerAnalysis, 'attackingScore' | 'defensiveScore' | 'formScore' | 'fixtureScore' | 'valueScore' | 'riskScore'>,
  avgFixtureDifficulty5: number,
): string[] {
  const notes: string[] = [];
  if (hasSmallSample(player)) {
    notes.push(`Small sample: only ${player.minutes} minutes played this season, so rate stats carry low confidence.`);
  }
  if (scores.formScore >= 80) notes.push(`Excellent recent form (${player.form.toFixed(1)} pts/game over recent gameweeks).`);
  else if (scores.formScore <= 25) notes.push(`Poor recent form (${player.form.toFixed(1)} pts/game) relative to others in this position.`);

  if (scores.fixtureScore >= 75) notes.push(`Favourable upcoming fixtures (avg difficulty ${avgFixtureDifficulty5.toFixed(1)}/5 over the next 5).`);
  else if (scores.fixtureScore <= 30) notes.push(`Tough upcoming fixtures (avg difficulty ${avgFixtureDifficulty5.toFixed(1)}/5 over the next 5).`);

  if (scores.valueScore <= 25) notes.push(`Below-average points return for the price versus similarly priced ${player.position}s.`);
  else if (scores.valueScore >= 80) notes.push(`Strong points return for the price versus similarly priced ${player.position}s.`);

  if (scores.riskScore <= 40) {
    if (player.status !== 'a') notes.push(`Availability concern: ${player.news || 'flagged as not fully available'}.`);
    else notes.push(`Rotation risk: minutes have been inconsistent this season.`);
  }
  return notes;
}

export function computePlayerAnalysis(
  player: Player,
  dataset: FplDataset,
  positionPopulations: Record<Position, Player[]>,
): PlayerAnalysis {
  const pool = positionPopulations[player.position];
  const attackPool = pool.map(attackRaw);
  const defensePool = pool.map(defenseRaw);
  const formPool = pool.map((p) => p.form);
  const valuePool = pool.map((p) => (p.price > 0 ? p.totalPoints / p.price : 0));

  const attackingScore = player.position === 'GKP' ? 50 : percentileRank(attackRaw(player), attackPool);
  const defensiveScore = percentileRank(defenseRaw(player), defensePool);
  const formScore = percentileRank(player.form, formPool);
  const valueScore = percentileRank(player.price > 0 ? player.totalPoints / player.price : 0, valuePool);

  const upcoming = getUpcomingFixturesForTeam(dataset, player.teamId, 8);
  const fx3 = averageDifficulty(upcoming, 3);
  const fx5 = averageDifficulty(upcoming, 5);
  const fx8 = averageDifficulty(upcoming, 8);
  const blendedDifficulty =
    fx3 * FIXTURE_WINDOW_WEIGHTS.next3 + fx5 * FIXTURE_WINDOW_WEIGHTS.next5 + fx8 * FIXTURE_WINDOW_WEIGHTS.next8;
  const fixtureScore = clamp(Math.round(((5 - blendedDifficulty) / 4) * 100), 0, 100);

  const currentGw = getCurrentGameweek(dataset);
  const gamesPlayedSoFar = Math.max(1, currentGw - 1);
  const minutesShare = clamp(player.minutes / (gamesPlayedSoFar * 90), 0, 1);
  let riskBase = 100;
  if (player.status === 'd') riskBase = player.chanceOfPlayingNextRound ?? 50;
  else if (player.status === 'i' || player.status === 's') riskBase = 5;
  else if (player.status === 'u' || player.status === 'n') riskBase = 0;
  const riskScore = clamp(Math.round(riskBase * clamp(0.4 + 0.6 * minutesShare, 0, 1)), 0, 100);

  const qw = POSITION_QUALITY_WEIGHTS[player.position];
  const qualityScore = Math.round(attackingScore * qw.attacking + defensiveScore * qw.defensive);

  const overallScore = clamp(
    Math.round(
      qualityScore * PLAYER_SCORE_WEIGHTS.quality +
        formScore * PLAYER_SCORE_WEIGHTS.form +
        fixtureScore * PLAYER_SCORE_WEIGHTS.fixtures +
        valueScore * PLAYER_SCORE_WEIGHTS.value +
        riskScore * PLAYER_SCORE_WEIGHTS.risk,
    ),
    0,
    100,
  );

  const qualityPool = pool.map((p) => {
    const w = POSITION_QUALITY_WEIGHTS[p.position];
    return attackRaw(p) * w.attacking + defenseRaw(p) * w.defensive;
  });
  const percentileVsPosition = percentileRank(attackRaw(player) * qw.attacking + defenseRaw(player) * qw.defensive, qualityPool);

  const expected = computeExpectedPoints(player, upcoming, gamesPlayedSoFar);

  return {
    playerId: player.id,
    position: player.position,
    overallScore,
    formScore,
    fixtureScore,
    valueScore,
    attackingScore,
    defensiveScore,
    minutesScore: Math.round(minutesShare * 100),
    riskScore,
    expectedPoints5gw: expected.totalExpected,
    pointsPerMillion: round1(player.price > 0 ? player.totalPoints / player.price : 0),
    percentileVsPosition,
    notes: noteBuilder(player, { attackingScore, defensiveScore, formScore, fixtureScore, valueScore, riskScore }, fx5),
    upcomingFixtures: upcoming,
  };
}
