import { motion } from 'framer-motion';
import { SearchX, Upload, Sparkles } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlowButton from '../ui/GlowButton';

export default function ChartNotDetected({
  image,
  onRetry,
  onTryDemo,
}: {
  image: string;
  onRetry: () => void;
  onTryDemo: () => void;
}) {
  return (
    <div className="min-h-[100svh] px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-16 h-16 rounded-2xl bg-orange-500/15 flex items-center justify-center mx-auto mb-6"
        >
          <SearchX className="text-orange-400" size={30} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl font-semibold mb-3"
        >
          No chart detected
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="text-white/50 leading-relaxed mb-8"
        >
          This image doesn't show the candlestick structure Pattern Scanner looks for — no clear
          red/green price bars were found. Rather than guess, we're not generating an analysis for
          it. Try a screenshot of an actual trading chart.
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.26 }}>
          <GlassCard hover={false} className="p-3 mb-8">
            <div className="rounded-2xl overflow-hidden bg-black/40 aspect-video flex items-center justify-center">
              <img src={image} alt="Uploaded" className="max-w-full max-h-full object-contain opacity-40" />
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <GlowButton size="lg" icon={<Upload size={18} />} onClick={onRetry}>
            Upload a Different Image
          </GlowButton>
          <GlowButton size="lg" variant="secondary" icon={<Sparkles size={18} />} onClick={onTryDemo}>
            Try a Sample Chart Instead
          </GlowButton>
        </motion.div>
      </div>
    </div>
  );
}
