import type { DetectedSquad, Squad, SquadPick, UserContext } from '../types';

export function detectedSquadToSquad(detected: DetectedSquad, context: UserContext): Squad {
  const picks: SquadPick[] = detected.picks
    .filter((p) => p.matchedPlayerId != null)
    .map((p, _i, arr) => {
      const benchOnly = arr.filter((x) => x.isBench);
      return {
        playerId: p.matchedPlayerId as number,
        isStarter: p.isStarter,
        isCaptain: p.isCaptain,
        isViceCaptain: p.isViceCaptain,
        benchOrder: p.isBench ? benchOnly.indexOf(p) : null,
      };
    });

  // Guarantee exactly one captain/vice so downstream captaincy logic never has to guard for zero.
  if (picks.length && !picks.some((p) => p.isCaptain)) {
    const starters = picks.filter((p) => p.isStarter);
    if (starters.length) starters[0].isCaptain = true;
  }
  if (picks.length && !picks.some((p) => p.isViceCaptain)) {
    const starters = picks.filter((p) => p.isStarter && !p.isCaptain);
    if (starters.length) starters[0].isViceCaptain = true;
  }

  return { picks, context };
}

export const DEFAULT_USER_CONTEXT: UserContext = { bank: null, freeTransfers: null, wildcardActive: false };
