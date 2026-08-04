import { Crown, Star } from 'lucide-react';
import type { CaptainSuggestion, Player } from '../../types';
import GlassCard from '../ui/GlassCard';
import PlayerAvatar from '../ui/PlayerAvatar';

export default function CaptainCard({ captain, playerById }: { captain: CaptainSuggestion; playerById: Map<number, Player> }) {
  const best = playerById.get(captain.bestPlayerId);
  const alt = captain.alternativePlayerId != null ? playerById.get(captain.alternativePlayerId) : null;

  if (!best) {
    return (
      <GlassCard hover={false}>
        <h3 className="font-medium mb-2">Captaincy</h3>
        <p className="text-sm text-white/50">No starting XI detected — captaincy can't be assessed.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard hover={false}>
      <h3 className="font-medium mb-4 flex items-center gap-2">
        <Crown size={16} className="text-amber-400" /> Captaincy
      </h3>
      <div className="flex items-center gap-3">
        <PlayerAvatar code={best.code} name={best.displayName} size={44} />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/40">Best captain</p>
          <p className="font-medium">{best.displayName}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold tabular-nums text-emerald-400">{captain.bestProjectedPoints.toFixed(1)}</p>
          <p className="text-[11px] text-white/35">projected pts</p>
        </div>
      </div>
      <p className="text-xs text-white/50 mt-2.5 leading-relaxed">{captain.bestReason}</p>

      {alt && (
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/8">
          <PlayerAvatar code={alt.code} name={alt.displayName} size={36} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/40 flex items-center gap-1">
              <Star size={11} /> Alternative
            </p>
            <p className="text-sm">{alt.displayName}</p>
          </div>
          <span className="text-sm tabular-nums text-white/60">{captain.alternativeProjectedPoints?.toFixed(1)}</span>
        </div>
      )}
    </GlassCard>
  );
}
