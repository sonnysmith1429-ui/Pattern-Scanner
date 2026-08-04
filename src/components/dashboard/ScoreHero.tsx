import { motion } from 'framer-motion';
import { RotateCcw, Heart } from 'lucide-react';
import CircularGauge from '../ui/CircularGauge';
import GlowButton from '../ui/GlowButton';
import DataFreshnessBadge from '../ui/DataFreshnessBadge';
import type { DataFreshness, TeamAnalysis } from '../../types';
import { TIER_LABELS } from '../../lib/fpl/constants';

function verdictLine(teamAnalysis: TeamAnalysis): string {
  const high = teamAnalysis.weaknesses.filter((w) => w.priority === 'high').length;
  const med = teamAnalysis.weaknesses.filter((w) => w.priority === 'medium').length;
  if (!teamAnalysis.weaknesses.length) return 'No major weaknesses found — a well-balanced squad across the board.';
  if (high) return `${TIER_LABELS[teamAnalysis.tier]} squad — ${high} high-priority weakness${high > 1 ? 'es' : ''} found.`;
  if (med) return `${TIER_LABELS[teamAnalysis.tier]} squad — ${med} area${med > 1 ? 's' : ''} worth addressing.`;
  return `${TIER_LABELS[teamAnalysis.tier]} squad with only minor issues.`;
}

export default function ScoreHero({
  teamAnalysis,
  freshness,
  onRefresh,
  refreshing,
  onRescan,
  isFavourite,
  onToggleFavourite,
}: {
  teamAnalysis: TeamAnalysis;
  freshness: DataFreshness;
  onRefresh: () => void;
  refreshing: boolean;
  onRescan: () => void;
  isFavourite: boolean;
  onToggleFavourite: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="glass rounded-[28px] p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <CircularGauge value={teamAnalysis.overallScore} size={168} strokeWidth={13} label="Team Rating" />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <DataFreshnessBadge freshness={freshness} onRefresh={onRefresh} refreshing={refreshing} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{teamAnalysis.overallScore}/100</h1>
          <p className="text-white/60 mt-1.5 max-w-lg">{verdictLine(teamAnalysis)}</p>
          <div className="flex items-center justify-center sm:justify-start gap-3 mt-5">
            <GlowButton size="md" variant="secondary" icon={<RotateCcw size={15} />} onClick={onRescan}>
              Analyse another team
            </GlowButton>
            <button
              onClick={onToggleFavourite}
              title={isFavourite ? 'Remove from history favourites' : 'Save to favourites'}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
                isFavourite ? 'bg-rose-500/15 text-rose-400' : 'bg-white/5 text-white/40 hover:text-white'
              }`}
            >
              <Heart size={17} fill={isFavourite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
