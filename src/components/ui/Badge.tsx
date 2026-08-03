import clsx from 'clsx';
import type { ReactNode } from 'react';

const tones: Record<string, string> = {
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  danger: 'bg-red-500/15 text-red-400 border-red-500/30',
  neutral: 'bg-white/10 text-white/70 border-white/15',
  accent: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

export default function Badge({
  children,
  tone = 'neutral',
  icon,
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
