import { motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import clsx from 'clsx';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface GlowButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'md' | 'lg' | 'sm';
  icon?: ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  title?: string;
}

const variants: Record<string, string> = {
  primary:
    'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-[0_0_0_rgba(59,130,246,0)] hover:shadow-[0_0_35px_rgba(59,130,246,0.55)]',
  secondary:
    'glass text-white hover:border-white/20',
  ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/5',
  danger:
    'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]',
};

const sizes: Record<string, string> = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-sm rounded-2xl',
  lg: 'px-8 py-4 text-base rounded-2xl',
};

export default function GlowButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  onClick,
  className,
  fullWidth,
  disabled,
  ...rest
}: GlowButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.6;
    const ripple: Ripple = {
      id: Date.now(),
      x: e.clientX - rect.left - size / 2,
      y: e.clientY - rect.top - size / 2,
      size,
    };
    setRipples((r) => [...r, ripple]);
    window.setTimeout(() => {
      setRipples((r) => r.filter((rp) => rp.id !== ripple.id));
    }, 650);
    onClick?.();
  }

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.96 }}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={handleClick}
      disabled={disabled}
      className={clsx(
        'relative overflow-hidden font-medium inline-flex items-center justify-center gap-2 select-none',
        'transition-[box-shadow,border-color] duration-300 ease-out cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon}
      <span className="relative z-10">{children}</span>
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ opacity: 0.45, scale: 0 }}
          animate={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="absolute rounded-full bg-white/40 pointer-events-none"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </motion.button>
  );
}
