import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { subscribeToasts, dismissToast, type Toast } from '../../lib/toast';

const ICONS: Record<Toast['tone'], React.ReactNode> = {
  success: <CheckCircle2 className="text-emerald-400" size={18} />,
  error: <AlertTriangle className="text-rose-400" size={18} />,
  info: <Info className="text-sky-400" size={18} />,
};

export default function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[min(92vw,380px)]" role="status" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-2xl px-4 py-3 flex items-center gap-2.5 text-sm shadow-xl"
          >
            {ICONS[t.tone]}
            <span className="flex-1 text-white/85">{t.message}</span>
            <button onClick={() => dismissToast(t.id)} className="text-white/40 hover:text-white cursor-pointer" aria-label="Dismiss">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
