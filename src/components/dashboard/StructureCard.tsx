import { Layers } from 'lucide-react';
import type { SquadStructure } from '../../types';
import GlassCard from '../ui/GlassCard';
import SquadValueDonut from '../charts/SquadValueDonut';

export default function StructureCard({ structure }: { structure: SquadStructure }) {
  return (
    <GlassCard hover={false}>
      <h3 className="font-medium mb-4 flex items-center gap-2">
        <Layers size={16} className="text-emerald-400" /> Squad Structure
      </h3>
      <SquadValueDonut spendByPosition={structure.spendByPosition} />
      <div className="mt-4 space-y-1.5">
        {structure.notes.map((n) => (
          <p key={n} className="text-xs text-white/50 leading-relaxed">
            {n}
          </p>
        ))}
      </div>
    </GlassCard>
  );
}
