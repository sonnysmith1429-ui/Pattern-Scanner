import { ArrowUpRight, ArrowDownRight, Minus, Target, ShieldAlert } from 'lucide-react';
import type { TradeBias } from '../../lib/types';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

const BIAS_STYLE = {
  Bullish: { tone: 'success' as const, icon: <ArrowUpRight size={14} /> },
  Bearish: { tone: 'danger' as const, icon: <ArrowDownRight size={14} /> },
  Neutral: { tone: 'neutral' as const, icon: <Minus size={14} /> },
};

export default function TradeBiasCard({ bias }: { bias: TradeBias }) {
  const style = BIAS_STYLE[bias.bias];
  return (
    <GlassCard delay={0.2} className="col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-white/50">Educational Trade Bias</h3>
        <Badge tone={style.tone} icon={style.icon}>
          {bias.bias} · {bias.confidence}%
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        <Zone label="Entry Area" value={bias.entry} tone="accent" />
        <Zone label="Take-Profit" value={bias.takeProfit} tone="success" />
        <Zone label="Stop-Loss" value={bias.stopLoss} tone="danger" />
        <Zone label="Support Zone" value={bias.supportZone} tone="neutral" />
        <Zone label="Resistance Zone" value={bias.resistanceZone} tone="neutral" />
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 px-4 py-3 text-xs text-orange-200/80">
        <ShieldAlert size={15} className="shrink-0 mt-0.5 text-orange-400" />
        <p>
          These entry, target and stop levels are illustrative examples for educational purposes only —
          not financial advice or a recommendation to trade.
        </p>
      </div>
    </GlassCard>
  );
}

function Zone({ label, value, tone }: { label: string; value: number; tone: 'accent' | 'success' | 'danger' | 'neutral' }) {
  const colors: Record<string, string> = {
    accent: 'text-blue-400',
    success: 'text-emerald-400',
    danger: 'text-red-400',
    neutral: 'text-white/70',
  };
  return (
    <div className="rounded-xl bg-white/[0.03] px-3 py-3 text-center">
      <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1 flex items-center justify-center gap-1">
        <Target size={10} /> {label}
      </p>
      <p className={`font-semibold tabular-nums ${colors[tone]}`}>${value.toFixed(2)}</p>
    </div>
  );
}
