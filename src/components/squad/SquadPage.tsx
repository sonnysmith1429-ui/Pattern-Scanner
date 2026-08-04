import type { FplDataset, Squad, TeamAnalysis } from '../../types';
import SquadPitch from './SquadPitch';
import { formatPrice } from '../../lib/utils/format';

export default function SquadPage({
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
  const totalValue = teamAnalysis.structure.totalValue;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Your Squad</h1>
          <p className="text-white/50 mt-1 text-sm">Tap a player for a full breakdown.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-white/60">
          <span>Squad value: <strong className="text-white">{formatPrice(totalValue)}</strong></span>
          {squad.context.bank != null && (
            <span>Bank: <strong className="text-white">{formatPrice(squad.context.bank)}</strong></span>
          )}
        </div>
      </div>

      <SquadPitch dataset={dataset} squad={squad} teamAnalysis={teamAnalysis} onOpenPlayer={onOpenPlayer} />
    </div>
  );
}
