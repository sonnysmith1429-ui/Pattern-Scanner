import { ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

export const DISCLAIMER_TEXT =
  'FPL Analyst AI provides statistical estimates and recommendations for informational purposes. Player performance and projected points are not guaranteed. FPL Analyst AI is an independent project and is not affiliated with, endorsed by, or connected to the Premier League or Fantasy Premier League.';

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
        {compact ? 'Statistical estimates only — not guaranteed. Not affiliated with the Premier League or Fantasy Premier League.' : DISCLAIMER_TEXT}
      </p>
    </div>
  );
}
