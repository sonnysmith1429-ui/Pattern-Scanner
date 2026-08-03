import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

function colorFor(value: number) {
  if (value >= 70) return { stroke: '#10b981', glow: 'rgba(16,185,129,0.45)', text: 'text-emerald-400' };
  if (value >= 40) return { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.45)', text: 'text-orange-400' };
  return { stroke: '#ef4444', glow: 'rgba(239,68,68,0.45)', text: 'text-red-400' };
}

export default function CircularGauge({
  value,
  size = 200,
  strokeWidth = 14,
  label,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [display, setDisplay] = useState(0);
  const mv = useMotionValue(0);
  const { stroke, glow, text } = colorFor(value);

  const strokeDashoffset = useTransform(mv, (v) => circumference - (v / 100) * circumference);

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.2,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, mv]);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-4 rounded-full"
        style={{ boxShadow: `0 0 60px 10px ${glow}`, opacity: 0.5 }}
      />
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="gauge-track"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset, filter: `drop-shadow(0 0 8px ${glow})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-4xl font-semibold tabular-nums ${text}`}>{display}%</span>
        {label && <span className="text-xs text-white/50 mt-1">{label}</span>}
      </div>
    </div>
  );
}
