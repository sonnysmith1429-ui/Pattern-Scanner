import { ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

export const DISCLAIMER_TEXT =
  'Pattern Scanner provides AI-assisted technical chart analysis for educational and informational purposes only. Financial markets are inherently uncertain, and no analysis can predict future price movements with certainty. Any trade ideas, target zones, stop-loss examples, or risk assessments shown are illustrative examples rather than recommendations. Users should conduct their own research and consider seeking advice from a qualified financial professional before making investment decisions.';

export default function Disclaimer({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div
      className={clsx(
        'glass rounded-2xl flex items-start gap-3 text-white/60',
        compact ? 'p-3 text-xs' : 'p-4 sm:p-5 text-sm',
        className,
      )}
    >
      <ShieldAlert className="shrink-0 text-orange-400 mt-0.5" size={compact ? 16 : 20} />
      <p className="leading-relaxed">
        {compact
          ? 'Educational technical analysis only — not financial advice. Illustrative examples, not recommendations.'
          : DISCLAIMER_TEXT}
      </p>
    </div>
  );
}
