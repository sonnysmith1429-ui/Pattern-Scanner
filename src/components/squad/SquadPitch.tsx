import type { FplDataset, Player, Position, Squad, TeamAnalysis } from '../../types';
import PitchPlayerCard from './PitchPlayerCard';
import { POSITIONS } from '../../lib/fpl/constants';

export default function SquadPitch({
  dataset,
  squad,
  teamAnalysis,
  onOpenPlayer,
}: {
  dataset: FplDataset;
  squad: Squad;
  teamAnalysis: TeamAnalysis;
  onOpenPlayer: (playerId: number) => void;
}) {
  const playerById = new Map(dataset.players.map((p) => [p.id, p]));
  const analysisById = new Map(teamAnalysis.playerAnalyses.map((a) => [a.playerId, a]));

  const starters = squad.picks
    .filter((p) => p.isStarter)
    .map((p) => ({ pick: p, player: playerById.get(p.playerId) }))
    .filter((x): x is { pick: (typeof squad.picks)[number]; player: Player } => !!x.player);

  const bench = squad.picks
    .filter((p) => !p.isStarter)
    .sort((a, b) => (a.benchOrder ?? 0) - (b.benchOrder ?? 0))
    .map((p) => ({ pick: p, player: playerById.get(p.playerId) }))
    .filter((x): x is { pick: (typeof squad.picks)[number]; player: Player } => !!x.player);

  const rows: Record<Position, typeof starters> = { GKP: [], DEF: [], MID: [], FWD: [] };
  for (const s of starters) rows[s.player.position].push(s);

  return (
    <div>
      <div
        className="relative rounded-[28px] overflow-hidden py-8 px-4"
        style={{
          background:
            'repeating-linear-gradient(180deg, #113822 0px, #113822 60px, #0f3320 60px, #0f3320 120px)',
        }}
      >
        <div className="absolute inset-6 border border-white/15 rounded-2xl pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-white/15 pointer-events-none" />

        <div className="relative flex flex-col gap-6 sm:gap-8">
          {POSITIONS.map((pos) => (
            <div key={pos} className="flex items-start justify-center gap-3 sm:gap-6 flex-wrap">
              {rows[pos].map(({ pick, player }, i) => (
                <PitchPlayerCard
                  key={player.id}
                  player={player}
                  analysis={analysisById.get(player.id)}
                  isCaptain={pick.isCaptain}
                  isViceCaptain={pick.isViceCaptain}
                  onClick={() => onOpenPlayer(player.id)}
                  delay={i * 0.04}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">Bench</h3>
        <div className="glass rounded-2xl p-4 flex items-start gap-4 sm:gap-6 flex-wrap justify-center">
          {bench.map(({ pick, player }, i) => (
            <PitchPlayerCard
              key={player.id}
              player={player}
              analysis={analysisById.get(player.id)}
              isCaptain={pick.isCaptain}
              isViceCaptain={pick.isViceCaptain}
              onClick={() => onOpenPlayer(player.id)}
              delay={i * 0.04}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
