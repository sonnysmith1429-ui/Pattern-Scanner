import { motion } from 'framer-motion';
import { Upload, Sparkles, LineChart, ShieldCheck, Gauge } from 'lucide-react';
import CandlestickBackground from './CandlestickBackground';
import Logo from '../ui/Logo';
import GlowButton from '../ui/GlowButton';
import GlassCard from '../ui/GlassCard';

export default function Landing({
  onUpload,
  onDemo,
}: {
  onUpload: () => void;
  onDemo: () => void;
}) {
  return (
    <div className="relative min-h-[100svh] flex flex-col">
      <CandlestickBackground />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Logo size={64} showText={false} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-8 text-5xl sm:text-7xl font-semibold tracking-tight text-gradient"
        >
          Pattern Scanner
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28 }}
          className="mt-3 text-lg sm:text-xl text-white/60 font-medium"
        >
          AI Technical Analysis
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-6 max-w-xl text-white/50 leading-relaxed"
        >
          Upload a screenshot of any candlestick chart and get an instant, educational
          technical breakdown — market structure, recognised patterns, and estimated indicators,
          explained in plain language.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.52 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <GlowButton size="lg" icon={<Upload size={18} />} onClick={onUpload}>
            Upload Chart
          </GlowButton>
          <GlowButton size="lg" variant="secondary" icon={<Sparkles size={18} />} onClick={onDemo}>
            View Demo Analysis
          </GlowButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl"
        >
          {[
            {
              icon: <LineChart className="text-blue-400" size={22} />,
              title: 'Pattern Recognition',
              desc: '25+ chart & candlestick patterns detected automatically.',
            },
            {
              icon: <Gauge className="text-emerald-400" size={22} />,
              title: 'Market Structure',
              desc: 'Trend, support/resistance and momentum, estimated instantly.',
            },
            {
              icon: <ShieldCheck className="text-orange-400" size={22} />,
              title: 'Educational Only',
              desc: 'Clear, illustrative examples — never investment advice.',
            },
          ].map((f, i) => (
            <GlassCard key={f.title} delay={0.75 + i * 0.08} className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="font-medium">{f.title}</h3>
              </div>
              <p className="text-sm text-white/50">{f.desc}</p>
            </GlassCard>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
