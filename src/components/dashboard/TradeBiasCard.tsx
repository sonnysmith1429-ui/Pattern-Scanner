import { ArrowUpRight, ArrowDownRight, Minus, Target, Clock, ShieldAlert, CheckCircle2, Wand2 } from 'lucide-react';
import type { TradeBias } from '../../lib/types';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

const BIAS_STYLE = {
  Bullish: { tone: 'success' as const, icon: <ArrowUpRight size={14} /> },
  Bearish: { tone: 'danger' as const, icon: <ArrowDownRight size={14} /> },
  Neutral: { tone: 'neutral' as const, icon: <Minus size={14} /> },
};

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

export default function TradeBiasCard({
  bias,
  currentPrice,
  priceSource,
}: {
  bias: TradeBias;
  currentPrice: number;
  priceSource: 'manual' | 'estimated';
}) {
  const style = BIAS_STYLE[bias.bias];
  const holdLabel = `~${formatMinutes(bias.holdMinutesMin)}–${formatMinutes(bias.holdMinutesMax)}`;

  return (
    <GlassCard delay={0.2} className="col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-medium text-white/50">Educational Trade Bias</h3>
        <Badge tone={style.tone} icon={style.icon}>
          {bias.bias} · {bias.confidence}%
        </Badge>
      </div>

      <div className="mb-4">
        {priceSource === 'manual' ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 size={12} />
            Levels calculated from your entered price of ${currentPrice.toFixed(2)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-white/35">
            <Wand2 size={12} />
            Reference price of ${currentPrice.toFixed(2)} is estimated — enter a real price next scan for accurate levels
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <Zone label="Entry Area" value={`$${bias.entry.toFixed(2)}`} tone="accent" icon={<Target size={10} />} />
        <Zone label="Take-Profit" value={`$${bias.takeProfit.toFixed(2)}`} tone="success" icon={<Target size={10} />} />
        <Zone label="Stop-Loss" value={`$${bias.stopLoss.toFixed(2)}`} tone="danger" icon={<Target size={10} />} />
        <Zone label="Support Zone" value={`$${bias.supportZone.toFixed(2)}`} tone="neutral" icon={<Target size={10} />} />
        <Zone label="Resistance Zone" value={`$${bias.resistanceZone.toFixed(2)}`} tone="neutral" icon={<Target size={10} />} />
        <Zone label="Est. Hold Time" value={holdLabel} tone="accent" icon={<Clock size={10} />} />
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 px-4 py-3 text-xs text-orange-200/80">
        <ShieldAlert size={15} className="shrink-0 mt-0.5 text-orange-400" />
        <p>
          These entry, target, stop and hold-time levels are illustrative examples for educational
          purposes only — not financial advice or a recommendation to trade. Real setups can resolve
          faster, slower, or not at all.
        </p>
      </div>
    </GlassCard>
  );
}

function Zone({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: 'accent' | 'success' | 'danger' | 'neutral';
  icon: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    accent: 'text-blue-400',
    success: 'text-emerald-400',
    danger: 'text-red-400',
    neutral: 'text-white/70',
  };
  return (
    <div className="rounded-xl bg-white/[0.03] px-3 py-3 text-center">
      <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1 flex items-center justify-center gap-1">
        {icon} {label}
      </p>
      <p className={`font-semibold tabular-nums ${colors[tone]}`}>{value}</p>
    </div>
  );
}
