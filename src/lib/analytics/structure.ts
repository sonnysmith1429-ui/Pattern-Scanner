import type { Player, Position, SquadStructure } from '../../types';
import { POSITIONS } from '../fpl/constants';

const PREMIUM_PRICE_THRESHOLD = 8.5;

export function computeSquadStructure(allPicks: Player[], benchPlayers: Player[]): SquadStructure {
  const clubCounts = new Map<number, { teamName: string; count: number }>();
  for (const p of allPicks) {
    const existing = clubCounts.get(p.teamId);
    if (existing) existing.count += 1;
    else clubCounts.set(p.teamId, { teamName: p.teamName, count: 1 });
  }
  const clubConcentration = Array.from(clubCounts.entries())
    .map(([teamId, v]) => ({ teamId, teamName: v.teamName, count: v.count }))
    .sort((a, b) => b.count - a.count);

  const spendByPosition = {} as Record<Position, number>;
  const pointsByPosition = {} as Record<Position, number>;
  for (const pos of POSITIONS) {
    spendByPosition[pos] = Math.round(allPicks.filter((p) => p.position === pos).reduce((s, p) => s + p.price, 0) * 10) / 10;
    pointsByPosition[pos] = allPicks.filter((p) => p.position === pos).reduce((s, p) => s + p.totalPoints, 0);
  }

  const premiumCount = allPicks.filter((p) => p.price >= PREMIUM_PRICE_THRESHOLD).length;
  const benchSpend = Math.round(benchPlayers.reduce((s, p) => s + p.price, 0) * 10) / 10;
  const totalValue = Math.round(allPicks.reduce((s, p) => s + p.price, 0) * 10) / 10;

  const notes: string[] = [];
  const topClub = clubConcentration[0];
  if (topClub && topClub.count >= 3) {
    notes.push(`${topClub.count} players from ${topClub.teamName} — a heavier-than-usual concentration in one club (max allowed is 3).`);
  }
  const bestPositionSpend = (Object.entries(spendByPosition) as [Position, number][]).sort((a, b) => b[1] - a[1])[0];
  const bestPositionPoints = (Object.entries(pointsByPosition) as [Position, number][]).sort((a, b) => b[1] - a[1])[0];
  if (bestPositionSpend) {
    notes.push(`£${bestPositionSpend[1].toFixed(1)}m invested in ${bestPositionSpend[0]}, the largest positional outlay in the squad.`);
  }
  if (bestPositionPoints) {
    notes.push(`${bestPositionPoints[0]} has produced the most total points of any position in the squad (${bestPositionPoints[1]} pts).`);
  }
  if (premiumCount === 0) {
    notes.push('No premium players (£8.5m+) in the squad — ceiling may be limited on big gameweeks.');
  } else if (premiumCount >= 4) {
    notes.push(`${premiumCount} premium players (£8.5m+) — a heavily top-loaded squad, which can squeeze value elsewhere.`);
  }

  return { clubConcentration, spendByPosition, pointsByPosition, premiumCount, benchSpend, totalValue, notes };
}
