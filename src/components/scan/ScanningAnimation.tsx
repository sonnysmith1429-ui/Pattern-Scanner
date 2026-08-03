import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

const STAGES = [
  'Uploading image…',
  'Detecting candlesticks…',
  'Finding support and resistance…',
  'Recognising chart patterns…',
  'Estimating technical indicators…',
  'Generating educational analysis…',
  'Complete',
];

const STAGE_DURATIONS = [650, 800, 800, 900, 800, 850, 500];

export default function ScanningAnimation({
  image,
  onComplete,
}: {
  image: string;
  onComplete: () => void;
}) {
  const [stageIndex, setStageIndex] = useState(0);
  const particles = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 2.5 + Math.random() * 2.5,
        size: 2 + Math.random() * 3,
      })),
    [],
  );

  useEffect(() => {
    if (stageIndex >= STAGES.length - 1) {
      const t = setTimeout(onComplete, STAGE_DURATIONS[STAGE_DURATIONS.length - 1]);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStageIndex((i) => i + 1), STAGE_DURATIONS[stageIndex]);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIndex]);

  const progress = Math.round((stageIndex / (STAGES.length - 1)) * 100);

  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center px-4 sm:px-6 py-10">
      <div className="w-full max-w-2xl">
        <div className="relative rounded-[28px] overflow-hidden glass p-2">
          <div className="relative rounded-3xl overflow-hidden aspect-video bg-black/50">
            <img src={image} alt="Scanning" className="absolute inset-0 w-full h-full object-contain" />

            {/* AI grid overlay */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(59,130,246,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.35) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            {/* scanning line */}
            <motion.div
              className="absolute left-0 right-0 h-24"
              style={{
                background:
                  'linear-gradient(180deg, transparent, rgba(59,130,246,0.55), rgba(147,197,253,0.9), rgba(59,130,246,0.55), transparent)',
                boxShadow: '0 0 30px 6px rgba(59,130,246,0.5)',
              }}
              animate={{ top: ['-10%', '100%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* particles */}
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute rounded-full bg-blue-300"
                style={{
                  left: `${p.left}%`,
                  bottom: 0,
                  width: p.size,
                  height: p.size,
                  boxShadow: '0 0 6px 2px rgba(147,197,253,0.8)',
                }}
                animate={{ y: [0, -260], opacity: [0, 1, 0] }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* corner brackets */}
            {(['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'] as const).map((pos) => (
              <div
                key={pos}
                className={`absolute ${pos} w-8 h-8 border-blue-400/70 ${
                  pos.includes('top') ? 'border-t-2' : 'border-b-2'
                } ${pos.includes('left') ? 'border-l-2 rounded-tl-lg' : 'border-r-2 rounded-tr-lg'}`}
              />
            ))}

            <div className="absolute bottom-3 right-4 text-[11px] font-mono text-blue-300/80 tracking-wider">
              AI ANALYSIS ENGINE
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/50">Processing</span>
            <span className="text-sm font-medium text-blue-400 tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-300"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ boxShadow: '0 0 12px rgba(59,130,246,0.7)' }}
            />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <AnimatePresence>
            {STAGES.slice(0, stageIndex + 1).map((stage, i) => {
              const isCurrent = i === stageIndex && i !== STAGES.length - 1;
              const isDone = i < stageIndex || i === STAGES.length - 1;
              return (
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {isCurrent ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  </div>
                  <span className={isDone ? 'text-white/80' : 'text-white/50'}>{stage}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
