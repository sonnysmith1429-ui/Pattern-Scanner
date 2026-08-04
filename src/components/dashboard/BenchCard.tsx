import { Armchair } from 'lucide-react';
import type { BenchAnalysis } from '../../types';
import GlassCard from '../ui/GlassCard';
import BarGauge from '../ui/BarGauge';

export default function BenchCard({ bench }: { bench: BenchAnalysis }) {
  return (
    <GlassCard hover={false}>
      <h3 className="font-medium mb-4 flex items-center gap-2">
        <Armchair size={16} className="text-sky-400" /> Bench Strength
      </h3>
      <BarGauge label={`${bench.score}/100`} value={bench.score} suffix="" />
      <div className="mt-4 space-y-1.5">
        {bench.notes.map((n) => (
          <p key={n} className="text-xs text-white/50 leading-relaxed">
            {n}
          </p>
        ))}
      </div>
    </GlassCard>
  );
}
