import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Check, ArrowRight, Loader2 } from 'lucide-react';
import type { FplDataset, Player, Squad, TeamAnalysis } from '../../types';
import { buildFixMyTeam, type FixMyTeamResult } from '../../lib/recommendations';
import GlowButton from '../ui/GlowButton';
import GlassCard from '../ui/GlassCard';
import PlayerAvatar from '../ui/PlayerAvatar';
import { formatSigned, withMinDuration } from '../../lib/utils/format';

const PROGRESS_LINES = [
  'Testing possible combinations',
  'Analysing fixtures',
  'Checking price constraints',
  'Checking position constraints',
  'Checking club limits',
  'Calculating projected points',
];

export default function FixMyTeamPanel({
  dataset,
  squad,
  teamAnalysis,
  onApply,
}: {
  dataset: FplDataset;
  squad: Squad;
  teamAnalysis: TeamAnalysis;
  onApply: (result: FixMyTeamResult) => void;
}) {
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [result, setResult] = useState<FixMyTeamResult | null>(null);
  const playerById = new Map(dataset.players.map((p) => [p.id, p]));

  async function run() {
    setStatus('running');
    const computed = await withMinDuration(Promise.resolve(buildFixMyTeam(dataset, squad, teamAnalysis)), 1900);
    setResult(computed);
    setStatus('done');
  }

  if (status === 'idle') {
    return (
      <GlassCard hover={false} className="text-center bg-gradient-to-br from-blue-500/10 to-emerald-500/10">
        <Sparkles className="mx-auto text-blue-400 mb-3" size={26} />
        <h3 className="text-lg font-semibold mb-2">Fix My Team</h3>
        <p className="text-sm text-white/55 max-w-md mx-auto mb-5">
          Run the optimiser to find the strongest combination of transfers within your free transfers and budget.
        </p>
        <GlowButton size="lg" onClick={run}>
          ✨ Fix My Team
        </GlowButton>
      </GlassCard>
    );
  }

  if (status === 'running') {
    return (
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Loader2 size={16} className="animate-spin text-blue-400" />
          <span className="font-medium">Optimising your squad…</span>
        </div>
        <div className="space-y-2">
          {PROGRESS_LINES.map((line, i) => (
            <motion.div key={line} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.28 }} className="text-sm text-white/50 flex items-center gap-2">
              <Check size={13} className="text-emerald-400" /> {line}
            </motion.div>
          ))}
        </div>
      </GlassCard>
    );
  }

  if (!result) return null;

  return (
    <GlassCard hover={false}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center gap-2">
          <Sparkles size={16} className="text-blue-400" /> Recommended squad changes
        </h3>
        <span className={`text-sm font-semibold tabular-nums ${result.projectedImprovementPoints >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {formatSigned(result.projectedImprovementPoints)} pts / 5 GWs
        </span>
      </div>

      {!result.transfers.length && <p className="text-sm text-white/50">No beneficial transfers found within your current constraints — your squad is already well optimised.</p>}

      <div className="space-y-3">
        <AnimatePresence>
          {result.transfers.map((t, i) => {
            const out = playerById.get(t.outPlayerId) as Player;
            const inP = playerById.get(t.inPlayerId) as Player;
            return (
              <motion.div key={t.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5">
                <span className="text-[10px] text-white/30 w-14 shrink-0">Transfer {i + 1}</span>
                <PlayerAvatar code={out.code} name={out.displayName} size={26} />
                <span className="text-sm truncate">{out.displayName}</span>
                <ArrowRight size={13} className="text-white/30 shrink-0" />
                <PlayerAvatar code={inP.code} name={inP.displayName} size={26} />
                <span className="text-sm truncate flex-1">{inP.displayName}</span>
                <span className="text-xs text-emerald-400 tabular-nums shrink-0">{formatSigned(t.projectedGainPoints)}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-4 space-y-1">
        {result.notes.map((n) => (
          <p key={n} className="text-[11px] text-white/35">
            {n}
          </p>
        ))}
      </div>

      {result.transfers.length > 0 && (
        <div className="mt-5 flex justify-end">
          <GlowButton size="md" icon={<Check size={14} />} onClick={() => onApply(result)}>
            Apply all transfers
          </GlowButton>
        </div>
      )}
    </GlassCard>
  );
}
