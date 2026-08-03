import GlassCard from '../ui/GlassCard';
import CircularGauge from '../ui/CircularGauge';

export default function ConfidenceMeterCard({ confidence }: { confidence: number }) {
  return (
    <GlassCard delay={0.1} className="flex flex-col items-center text-center h-full">
      <h3 className="text-sm font-medium text-white/50 mb-6 self-start">Overall Confidence</h3>
      <div className="flex-1 flex items-center">
        <CircularGauge value={confidence} size={180} label="AI Confidence Score" />
      </div>
    </GlassCard>
  );
}
