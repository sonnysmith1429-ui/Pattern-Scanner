import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, AlertTriangle } from 'lucide-react';
import GlowButton from '../ui/GlowButton';

export interface ScanStep {
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}

/**
 * Presentational only — the actual pipeline (OCR / manager-id fetch, FPL
 * data, analytics, AI) runs in the App-level orchestrator, which drives
 * `steps` as each real async phase completes. Nothing here is a fake timer
 * decoupled from real work.
 */
export default function ScanningAnimation({
  image,
  steps,
  error,
  onRetry,
  onUseDemo,
}: {
  image: string | null;
  steps: ScanStep[];
  error?: string | null;
  onRetry?: () => void;
  onUseDemo?: () => void;
}) {
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 2.5 + Math.random() * 2.5,
        size: 2 + Math.random() * 3,
      })),
    [],
  );

  const doneCount = steps.filter((s) => s.status === 'done').length;
  const progress = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center px-4 sm:px-6 py-10">
      <div className="w-full max-w-2xl">
        <div className="relative rounded-[28px] overflow-hidden glass p-2">
          <div className="relative rounded-3xl overflow-hidden aspect-video bg-black/50">
            {image && <img src={image} alt="Squad being analysed" className="absolute inset-0 w-full h-full object-contain" />}

            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(52,211,153,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.3) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            {!error && (
              <motion.div
                className="absolute left-0 right-0 h-24"
                style={{
                  background:
                    'linear-gradient(180deg, transparent, rgba(52,211,153,0.5), rgba(96,165,250,0.9), rgba(52,211,153,0.5), transparent)',
                  boxShadow: '0 0 30px 6px rgba(52,211,153,0.4)',
                }}
                animate={{ top: ['-10%', '100%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {!error &&
              particles.map((p) => (
                <motion.span
                  key={p.id}
                  className="absolute rounded-full bg-blue-300"
                  style={{ left: `${p.left}%`, bottom: 0, width: p.size, height: p.size, boxShadow: '0 0 6px 2px rgba(147,197,253,0.8)' }}
                  animate={{ y: [0, -260], opacity: [0, 1, 0] }}
                  transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
                />
              ))}

            {(['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'] as const).map((pos) => (
              <div
                key={pos}
                className={`absolute ${pos} w-8 h-8 border-emerald-400/70 ${pos.includes('top') ? 'border-t-2' : 'border-b-2'} ${
                  pos.includes('left') ? 'border-l-2 rounded-tl-lg' : 'border-r-2 rounded-tr-lg'
                }`}
              />
            ))}

            <div className="absolute bottom-3 right-4 text-[11px] font-mono text-emerald-300/80 tracking-wider">FPL ANALYST AI</div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/50">{error ? 'Analysis interrupted' : 'Analysing squad'}</span>
            <span className="text-sm font-medium text-emerald-400 tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ boxShadow: '0 0 12px rgba(52,211,153,0.6)' }}
            />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <AnimatePresence>
            {steps.map((step) => (
              <motion.div key={step.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }} className="flex items-center gap-3 text-sm">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    step.status === 'error'
                      ? 'bg-rose-500/20 text-rose-400'
                      : step.status === 'done'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : step.status === 'active'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-white/5 text-white/30'
                  }`}
                >
                  {step.status === 'error' ? <AlertTriangle size={12} /> : step.status === 'active' ? <Loader2 size={12} className="animate-spin" /> : step.status === 'done' ? <Check size={12} /> : null}
                </div>
                <span className={step.status === 'pending' ? 'text-white/35' : step.status === 'error' ? 'text-rose-400' : 'text-white/80'}>{step.label}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 glass rounded-2xl p-5 text-center">
            <p className="text-sm text-white/70 mb-4">{error}</p>
            <div className="flex items-center justify-center gap-3">
              {onRetry && <GlowButton size="md" variant="secondary" onClick={onRetry}>Try again</GlowButton>}
              {onUseDemo && <GlowButton size="md" onClick={onUseDemo}>Use Demo Squad instead</GlowButton>}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
