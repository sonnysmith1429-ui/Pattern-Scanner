import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import { scoreTier } from '../../lib/fpl/constants';

const TIER_HEX: Record<ReturnType<typeof scoreTier>, { stroke: string; glow: string; text: string }> = {
  elite: { stroke: '#34d399', glow: 'rgba(52,211,153,0.45)', text: 'text-emerald-400' },
  strong: { stroke: '#2dd4bf', glow: 'rgba(45,212,191,0.4)', text: 'text-teal-400' },
  decent: { stroke: '#38bdf8', glow: 'rgba(56,189,248,0.4)', text: 'text-sky-400' },
  'below-average': { stroke: '#fbbf24', glow: 'rgba(251,191,36,0.4)', text: 'text-amber-400' },
  poor: { stroke: '#fb7185', glow: 'rgba(251,113,133,0.4)', text: 'text-rose-400' },
};

export default function CircularGauge({
  value,
  size = 200,
  strokeWidth = 14,
  label,
  suffix = '',
  max = 100,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  suffix?: string;
  max?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [display, setDisplay] = useState(0);
  const mv = useMotionValue(0);
  const { stroke, glow, text } = TIER_HEX[scoreTier(value)];

  const strokeDashoffset = useTransform(mv, (v) => circumference - (v / max) * circumference);

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
      <div className="absolute inset-4 rounded-full" style={{ boxShadow: `0 0 60px 10px ${glow}`, opacity: 0.5 }} />
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} className="gauge-track" strokeWidth={strokeWidth} fill="none" />
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
        <span className={`text-4xl font-semibold tabular-nums ${text}`}>
          {display}
          {suffix}
        </span>
        {max !== 100 || suffix === '' ? null : <span className="text-xs text-white/40 -mt-0.5">/ {max}</span>}
        {label && <span className="text-xs text-white/50 mt-1">{label}</span>}
      </div>
    </div>
  );
}
