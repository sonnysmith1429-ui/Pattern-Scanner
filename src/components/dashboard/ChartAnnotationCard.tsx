import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import type { Annotation } from '../../lib/types';
import GlassCard from '../ui/GlassCard';

const COLORS: Record<Annotation['type'], string> = {
  trendline: '#60a5fa',
  support: '#10b981',
  resistance: '#ef4444',
  pattern: '#f59e0b',
  breakout: '#a78bfa',
  arrow: '#60a5fa',
  highlight: '#f59e0b',
};

export default function ChartAnnotationCard({
  image,
  annotations,
}: {
  image: string;
  annotations: Annotation[];
}) {
  return (
    <GlassCard delay={0.05} className="col-span-1 lg:col-span-2">
      <div className="flex items-center gap-2 mb-4">
        <Layers size={16} className="text-blue-400" />
        <h3 className="text-sm font-medium text-white/50">Chart Annotation</h3>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-black/40 aspect-video">
        <img src={image} alt="Annotated chart" className="absolute inset-0 w-full h-full object-contain" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          {annotations.map((a, i) => (
            <AnnotationShape key={i} annotation={a} delay={0.3 + i * 0.35} />
          ))}
        </svg>
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          {Array.from(new Set(annotations.map((a) => a.type))).map((type) => (
            <span
              key={type}
              className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/70"
            >
              <span className="w-2 h-2 rounded-full" style={{ background: COLORS[type] }} />
              {labelFor(type)}
            </span>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function labelFor(type: Annotation['type']) {
  switch (type) {
    case 'trendline':
      return 'Trendline';
    case 'support':
      return 'Support';
    case 'resistance':
      return 'Resistance';
    case 'pattern':
      return 'Pattern';
    case 'breakout':
      return 'Breakout Zone';
    case 'arrow':
      return 'Direction';
    case 'highlight':
      return 'Key Candle';
  }
}

function AnnotationShape({ annotation, delay }: { annotation: Annotation; delay: number }) {
  const color = COLORS[annotation.type];
  const pts = annotation.points;

  if (annotation.type === 'highlight') {
    const p = pts[0];
    return (
      <motion.circle
        cx={p.x}
        cy={p.y}
        r={3.2}
        fill="none"
        stroke={color}
        strokeWidth={0.8}
        initial={{ opacity: 0, r: 8 }}
        animate={{ opacity: 1, r: 3.2 }}
        transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      />
    );
  }

  if (annotation.type === 'breakout') {
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    const w = Math.max(...xs) - x;
    const h = Math.max(...ys) - y;
    return (
      <motion.rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={color}
        fillOpacity={0.12}
        stroke={color}
        strokeWidth={0.5}
        strokeDasharray="2 1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay, duration: 0.6 }}
      />
    );
  }

  if (annotation.type === 'arrow') {
    const [a, b] = pts;
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const ah = 3;
    const p1 = { x: b.x - ah * Math.cos(angle - 0.4), y: b.y - ah * Math.sin(angle - 0.4) };
    const p2 = { x: b.x - ah * Math.cos(angle + 0.4), y: b.y - ah * Math.sin(angle + 0.4) };
    return (
      <g>
        <motion.line
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke={color}
          strokeWidth={0.6}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay, duration: 0.6, ease: 'easeOut' }}
        />
        <motion.polygon
          points={`${b.x},${b.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`}
          fill={color}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.5, duration: 0.3 }}
        />
      </g>
    );
  }

  if (annotation.type === 'pattern') {
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return (
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={0.7}
        strokeDasharray="3 1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay, duration: 0.9, ease: 'easeInOut' }}
      />
    );
  }

  // trendline, support, resistance
  const [a, b] = pts;
  return (
    <motion.line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={color}
      strokeWidth={0.6}
      strokeDasharray={annotation.type === 'trendline' ? undefined : '2 1.2'}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ delay, duration: 0.7, ease: 'easeOut' }}
    />
  );
}
