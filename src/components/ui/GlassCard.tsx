import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import clsx from 'clsx';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  as?: 'div' | 'section';
}

export default function GlassCard({ children, className, delay = 0, hover = true }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hover ? { y: -4, boxShadow: '0 20px 45px -15px rgba(0,0,0,0.5)' } : undefined}
      className={clsx(
        'glass rounded-[24px] p-5 sm:p-6 transition-shadow',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
