import { motion } from 'framer-motion';

function colorFor(value: number, invert = false) {
  const v = invert ? 100 - value : value;
  if (v >= 66) return '#10b981';
  if (v >= 33) return '#f59e0b';
  return '#ef4444';
}

export default function BarGauge({
  label,
  value,
  suffix = '%',
  invert = false,
  delay = 0,
}: {
  label: string;
  value: number;
  suffix?: string;
  invert?: boolean;
  delay?: number;
}) {
  const color = colorFor(value, invert);
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-white/60">{label}</span>
        <span className="font-medium tabular-nums" style={{ color }}>
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/8 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
