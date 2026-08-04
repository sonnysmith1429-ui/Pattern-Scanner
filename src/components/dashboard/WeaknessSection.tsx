import { motion } from 'framer-motion';
import { AlertOctagon, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import type { Player, Weakness } from '../../types';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

const PRIORITY_META: Record<Weakness['priority'], { icon: React.ReactNode; tone: 'danger' | 'warning' | 'neutral'; label: string }> = {
  high: { icon: <AlertOctagon size={15} />, tone: 'danger', label: 'High priority' },
  medium: { icon: <AlertTriangle size={15} />, tone: 'warning', label: 'Medium priority' },
  low: { icon: <Info size={15} />, tone: 'neutral', label: 'Low priority' },
};

export default function WeaknessSection({
  weaknesses,
  playerById,
  onViewTransfer,
}: {
  weaknesses: Weakness[];
  playerById: Map<number, Player>;
  onViewTransfer: (outPlayerId: number) => void;
}) {
  if (!weaknesses.length) {
    return (
      <GlassCard hover={false} className="text-center py-10">
        <p className="text-white/60">No significant weaknesses found — nice squad.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {weaknesses.map((w, i) => {
        const meta = PRIORITY_META[w.priority];
        const replacement = w.suggestedReplacementIds[0] ? playerById.get(w.suggestedReplacementIds[0]) : null;
        const affected = w.affectedPlayerIds[0];

        return (
          <motion.div key={w.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, duration: 0.4 }}>
            <GlassCard hover={false} className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-medium text-white/30">{i + 1}.</span>
                  <h3 className="font-medium">{w.title}</h3>
                  <Badge tone={meta.tone} icon={meta.icon}>
                    {meta.label}
                  </Badge>
                </div>
                <p className="text-sm text-white/55 leading-relaxed">{w.description}</p>
                {replacement && <p className="text-sm text-emerald-400 mt-1.5">Suggested replacement: {replacement.displayName}</p>}
              </div>
              {affected != null && (
                <button
                  onClick={() => onViewTransfer(affected)}
                  className="shrink-0 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  View transfer <ArrowRight size={14} />
                </button>
              )}
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}
