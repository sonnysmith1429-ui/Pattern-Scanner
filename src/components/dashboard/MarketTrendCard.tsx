import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReactElement } from 'react';
import type { Trend } from '../../lib/types';
import GlassCard from '../ui/GlassCard';
import BarGauge from '../ui/BarGauge';

const TREND_STYLE: Record<Trend, { icon: ReactElement; color: string; bg: string }> = {
  'Strong Uptrend': { icon: <TrendingUp size={24} />, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  'Moderate Uptrend': { icon: <TrendingUp size={24} />, color: 'text-emerald-300', bg: 'bg-emerald-500/10' },
  Sideways: { icon: <Minus size={24} />, color: 'text-white/60', bg: 'bg-white/10' },
  'Weak Downtrend': { icon: <TrendingDown size={24} />, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  'Strong Downtrend': { icon: <TrendingDown size={24} />, color: 'text-red-400', bg: 'bg-red-500/15' },
};

export default function MarketTrendCard({ trend, confidence }: { trend: Trend; confidence: number }) {
  const style = TREND_STYLE[trend];
  return (
    <GlassCard delay={0.05}>
      <h3 className="text-sm font-medium text-white/50 mb-4">Market Trend</h3>
      <div className="flex items-center gap-4 mb-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${style.bg} ${style.color}`}>
          {style.icon}
        </div>
        <div>
          <p className="text-xl font-semibold">{trend}</p>
          <p className="text-sm text-white/40">Detected from overall structure</p>
        </div>
      </div>
      <BarGauge label="Confidence" value={confidence} />
    </GlassCard>
  );
}
