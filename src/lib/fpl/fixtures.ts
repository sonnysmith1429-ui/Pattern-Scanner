import type { Fixture, FplDataset, Team, UpcomingFixture } from '../../types';
import { CURRENT_GAMEWEEK } from './mockData';

function currentGameweek(dataset: FplDataset): number {
  const current = dataset.events.find((e) => e.isCurrent) ?? dataset.events.find((e) => e.isNext);
  return current?.id ?? CURRENT_GAMEWEEK;
}

export function getUpcomingFixturesForTeam(dataset: FplDataset, teamId: number, count = 8): UpcomingFixture[] {
  const fromGw = currentGameweek(dataset);
  const teamById = new Map<number, Team>(dataset.teams.map((t) => [t.id, t]));
  return dataset.fixtures
    .filter(
      (f) =>
        !f.finished &&
        f.gameweek !== null &&
        f.gameweek >= fromGw &&
        (f.homeTeamId === teamId || f.awayTeamId === teamId),
    )
    .sort((a, b) => (a.gameweek ?? 0) - (b.gameweek ?? 0))
    .slice(0, count)
    .map((f) => {
      const isHome = f.homeTeamId === teamId;
      const opponentId = isHome ? f.awayTeamId : f.homeTeamId;
      return {
        fixtureId: f.id,
        gameweek: f.gameweek,
        opponent: teamById.get(opponentId)?.shortName ?? '???',
        isHome,
        difficulty: isHome ? f.homeDifficulty : f.awayDifficulty,
        kickoffTime: f.kickoffTime,
      };
    });
}

export function averageDifficulty(fixtures: UpcomingFixture[], count: number): number {
  const slice = fixtures.slice(0, count);
  if (!slice.length) return 3;
  return slice.reduce((s, f) => s + f.difficulty, 0) / slice.length;
}

export function getCurrentGameweek(dataset: FplDataset): number {
  return currentGameweek(dataset);
}

/** All of a team's upcoming fixtures (any count) used by the fixtures page grid. */
export function getFixtureGrid(dataset: FplDataset, teamId: number, count = 6): UpcomingFixture[] {
  return getUpcomingFixturesForTeam(dataset, teamId, count);
}

export function fixtureDifficultyColor(difficulty: number): string {
  if (difficulty <= 1) return 'bg-emerald-500/80';
  if (difficulty === 2) return 'bg-emerald-400/60';
  if (difficulty === 3) return 'bg-amber-400/70';
  if (difficulty === 4) return 'bg-orange-500/70';
  return 'bg-rose-500/80';
}

export type { Fixture };
