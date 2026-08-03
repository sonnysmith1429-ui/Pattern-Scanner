import { motion } from 'framer-motion';
import { Shapes } from 'lucide-react';
import type { RecognisedPattern } from '../../lib/types';
import GlassCard from '../ui/GlassCard';

function confidenceColor(c: number) {
  if (c >= 75) return 'text-emerald-400 bg-emerald-500/15';
  if (c >= 55) return 'text-orange-400 bg-orange-500/15';
  return 'text-white/50 bg-white/10';
}

export default function PatternsCard({ patterns }: { patterns: RecognisedPattern[] }) {
  return (
    <GlassCard delay={0.1}>
      <div className="flex items-center gap-2 mb-4">
        <Shapes size={16} className="text-blue-400" />
        <h3 className="text-sm font-medium text-white/50">Recognised Patterns</h3>
      </div>
      <div className="space-y-2.5">
        {patterns.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
            className="flex items-center justify-between rounded-xl bg-white/[0.03] hover:bg-white/[0.06] px-4 py-3 transition-colors"
          >
            <span className="text-sm font-medium">{p.name}</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${confidenceColor(p.confidence)}`}>
              {p.confidence}%
            </span>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
