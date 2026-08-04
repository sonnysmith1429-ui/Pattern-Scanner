import { useState } from 'react';
import type { FplDataset, Squad } from '../../types';
import PlayerAvatar from '../ui/PlayerAvatar';
import { getUpcomingFixturesForTeam, fixtureDifficultyColor, getCurrentGameweek } from '../../lib/fpl/fixtures';
import { pushToast } from '../../lib/toast';

export default function FixturesPage({ dataset, squad, onOpenPlayer }: { dataset: FplDataset; squad: Squad; onOpenPlayer: (playerId: number) => void }) {
  const [count, setCount] = useState<5 | 8>(5);
  const playerById = new Map(dataset.players.map((p) => [p.id, p]));
  const teamById = new Map(dataset.teams.map((t) => [t.id, t]));
  const startGw = getCurrentGameweek(dataset);

  const rows = squad.picks
    .map((pick) => playerById.get(pick.playerId))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({ player: p, fixtures: getUpcomingFixturesForTeam(dataset, p.teamId, count) }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Fixtures</h1>
          <p className="text-white/50 mt-1 text-sm">Upcoming fixture difficulty for every player in your squad.</p>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {([5, 8] as const).map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${count === n ? 'bg-blue-500 text-white' : 'text-white/50 hover:text-white'}`}
            >
              Next {n}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-white/40 text-xs">
              <th className="px-4 py-3 font-normal">Player</th>
              {Array.from({ length: count }, (_, i) => (
                <th key={i} className="px-2 py-3 font-normal text-center">
                  GW{startGw + i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {rows.map(({ player, fixtures }) => (
              <tr key={player.id} className="hover:bg-white/5">
                <td className="px-4 py-2.5">
                  <button onClick={() => onOpenPlayer(player.id)} className="flex items-center gap-2.5 cursor-pointer text-left">
                    <PlayerAvatar code={player.code} name={player.displayName} size={26} />
                    <div>
                      <p className="font-medium leading-tight">{player.displayName}</p>
                      <p className="text-[11px] text-white/35 leading-tight">{teamById.get(player.teamId)?.shortName}</p>
                    </div>
                  </button>
                </td>
                {Array.from({ length: count }, (_, i) => {
                  const f = fixtures[i];
                  if (!f) return <td key={i} className="px-2 py-2.5 text-center text-white/20 text-xs">—</td>;
                  return (
                    <td key={i} className="px-2 py-2.5 text-center">
                      <button
                        onClick={() =>
                          pushToast(`GW${f.gameweek}: vs ${f.opponent} (${f.isHome ? 'Home' : 'Away'}) — difficulty ${f.difficulty}/5`, 'info')
                        }
                        className={`w-10 h-8 rounded-lg text-[11px] font-medium text-black/80 cursor-pointer hover:scale-105 transition-transform ${fixtureDifficultyColor(f.difficulty)}`}
                        title={`GW${f.gameweek} vs ${f.opponent} (${f.isHome ? 'H' : 'A'})`}
                      >
                        {f.opponent}
                        <span className="block text-[9px] opacity-70">{f.isHome ? 'H' : 'A'}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 text-xs text-white/40">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500/80" /> Easy
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-400/70" /> Medium
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-rose-500/80" /> Hard
        </span>
      </div>
    </div>
  );
}
