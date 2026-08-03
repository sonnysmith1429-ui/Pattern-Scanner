import { motion } from 'framer-motion';
import { ScanLine } from 'lucide-react';
import clsx from 'clsx';

export default function Logo({ size = 40, showText = true, textClass }: { size?: number; showText?: boolean; textClass?: string }) {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        initial={{ rotate: -8, scale: 0.9, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-600/30"
        style={{ width: size, height: size }}
      >
        <motion.div
          className="absolute inset-0 rounded-2xl bg-blue-500"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: 'blur(14px)' }}
        />
        <ScanLine className="relative z-10 text-white" size={size * 0.55} strokeWidth={2.2} />
      </motion.div>
      {showText && (
        <span className={clsx('font-semibold tracking-tight', textClass)}>Pattern Scanner</span>
      )}
    </div>
  );
}
