import { Activity } from 'lucide-react';
import type { Indicators } from '../../lib/types';
import GlassCard from '../ui/GlassCard';
import BarGauge from '../ui/BarGauge';

export default function IndicatorsCard({ indicators }: { indicators: Indicators }) {
  return (
    <GlassCard delay={0.15} className="col-span-1 lg:col-span-2">
      <div className="flex items-center gap-2 mb-5">
        <Activity size={16} className="text-blue-400" />
        <h3 className="text-sm font-medium text-white/50">Technical Indicators</h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
        <BarGauge label="RSI" value={indicators.rsi} suffix="" delay={0.1} />
        <BarGauge label="Trend Strength" value={indicators.trendStrength} delay={0.15} />
        <BarGauge label="Momentum" value={indicators.momentum} delay={0.2} />
        <BarGauge label="Volatility" value={indicators.volatility} delay={0.25} />
        <BarGauge label="Risk Level" value={indicators.riskLevel} invert delay={0.3} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/8">
        <Stat label="MACD" value={indicators.macd} />
        <Stat label="Moving Averages" value={indicators.movingAverages} />
        <Stat label="Volume" value={indicators.volume} />
        <Stat label="EMA (21)" value={`$${indicators.ema.toFixed(2)}`} />
        <Stat label="VWAP" value={`$${indicators.vwap.toFixed(2)}`} />
        <Stat label="Support / Resistance" value={`$${indicators.support.toFixed(0)} / $${indicators.resistance.toFixed(0)}`} />
      </div>
    </GlassCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] px-3 py-2.5">
      <p className="text-[11px] text-white/40 mb-0.5">{label}</p>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  );
}
