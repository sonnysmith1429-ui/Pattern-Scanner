import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRightLeft, ChevronDown, BarChart3, Wallet } from 'lucide-react';
import type { Player, PlayerAnalysis, TransferRecommendation } from '../../types';
import GlassCard from '../ui/GlassCard';
import GlowButton from '../ui/GlowButton';
import PlayerAvatar from '../ui/PlayerAvatar';
import Badge from '../ui/Badge';
import ExpectedPointsBarChart from '../charts/ExpectedPointsBarChart';
import { formatPrice, formatSigned, clampPct } from '../../lib/utils/format';

export default function TransferCard({
  rec,
  outPlayer,
  inPlayer,
  outAnalysis,
  inAnalysis,
  aiVerdict,
  onMakeTransfer,
  onCompare,
  onSeeStats,
  delay = 0,
}: {
  rec: TransferRecommendation;
  outPlayer: Player;
  inPlayer: Player;
  outAnalysis?: PlayerAnalysis;
  inAnalysis?: PlayerAnalysis;
  aiVerdict?: string;
  onMakeTransfer: () => void;
  onCompare: () => void;
  onSeeStats: () => void;
  delay?: number;
}) {
  const [showWhy, setShowWhy] = useState(false);
  const fixturePct = clampPct(50 + rec.fixtureImprovement * 50);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <GlassCard hover={false}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] uppercase tracking-wider text-white/40 font-medium">Recommended Transfer</span>
          <Badge tone={rec.affordable ? 'success' : 'warning'} icon={<Wallet size={11} />}>
            {rec.costDelta > 0 ? `+${formatPrice(rec.costDelta)}` : rec.costDelta < 0 ? `-${formatPrice(Math.abs(rec.costDelta))}` : 'Same price'}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <PlayerAvatar code={outPlayer.code} name={outPlayer.displayName} size={40} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-white/35 uppercase tracking-wide">Out</p>
            <p className="text-sm font-medium truncate">{outPlayer.displayName}</p>
            <p className="text-xs text-white/40">{formatPrice(outPlayer.price)}</p>
          </div>
        </div>

        <div className="flex justify-center my-1.5">
          <ArrowDown size={16} className="text-white/25" />
        </div>

        <div className="flex items-center gap-3">
          <PlayerAvatar code={inPlayer.code} name={inPlayer.displayName} size={40} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-emerald-400/70 uppercase tracking-wide">In</p>
            <p className="text-sm font-medium truncate">{inPlayer.displayName}</p>
            <p className="text-xs text-white/40">{formatPrice(inPlayer.price)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/5 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-white/40">Expected gain</p>
            <p className={`text-sm font-semibold tabular-nums ${rec.projectedGainPoints >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatSigned(rec.projectedGainPoints)} pts / 5 GWs
            </p>
          </div>
          <div className="bg-white/5 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-white/40 mb-1.5">Fixture improvement</p>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${fixturePct}%` }} />
            </div>
          </div>
        </div>

        <button onClick={() => setShowWhy((s) => !s)} className="w-full flex items-center justify-between text-xs text-white/50 hover:text-white mt-4 cursor-pointer">
          <span>Why this transfer?</span>
          <ChevronDown size={14} className={`transition-transform ${showWhy ? 'rotate-180' : ''}`} />
        </button>
        {showWhy && (
          <div className="mt-2 space-y-1">
            {rec.reasons.map((r) => (
              <p key={r} className="text-xs text-white/55 flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">+</span> {r}
              </p>
            ))}
            {aiVerdict && <p className="text-xs text-white/60 italic mt-2 border-l-2 border-blue-400/40 pl-2">"{aiVerdict}"</p>}
            {outAnalysis && inAnalysis && (
              <div className="mt-3">
                <ExpectedPointsBarChart outName={outPlayer.displayName} outValue={outAnalysis.expectedPoints5gw} inName={inPlayer.displayName} inValue={inAnalysis.expectedPoints5gw} />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          <GlowButton size="sm" variant="secondary" icon={<BarChart3 size={13} />} onClick={onCompare}>
            Compare
          </GlowButton>
          <GlowButton size="sm" variant="ghost" onClick={onSeeStats}>
            See Stats
          </GlowButton>
          <GlowButton size="sm" icon={<ArrowRightLeft size={13} />} onClick={onMakeTransfer} className="ml-auto">
            Make Transfer
          </GlowButton>
        </div>
      </GlassCard>
    </motion.div>
  );
}
