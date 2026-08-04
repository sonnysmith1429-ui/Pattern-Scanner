import { motion } from 'framer-motion';
import { Upload, Sparkles, TrendingUp, Target, ShieldCheck, ArrowRightLeft, Gauge, Users } from 'lucide-react';
import StatsBackground from './StatsBackground';
import Logo from '../ui/Logo';
import GlowButton from '../ui/GlowButton';
import GlassCard from '../ui/GlassCard';
import CircularGauge from '../ui/CircularGauge';
import BarGauge from '../ui/BarGauge';

const HOW_IT_WORKS = [
  { icon: <Upload size={20} className="text-blue-400" />, title: 'Upload your team', desc: 'Drop in a screenshot of your FPL squad, or enter your manager ID.' },
  { icon: <Gauge size={20} className="text-sky-400" />, title: 'We analyse the data', desc: 'Live FPL stats are pulled and run through a transparent scoring model.' },
  { icon: <Target size={20} className="text-amber-400" />, title: 'Find your weaknesses', desc: 'Underperforming positions and risky picks are surfaced with reasons.' },
  { icon: <ArrowRightLeft size={20} className="text-emerald-400" />, title: 'Get transfer recommendations', desc: 'Ranked, budget-aware replacements with projected point gains.' },
];

const WHAT_WE_ANALYSE = ['Form', 'Fixtures', 'Value', 'xG', 'xA', 'Minutes', 'Ownership', 'Squad balance', 'Availability'];

export default function Landing({ onUpload, onDemo }: { onUpload: () => void; onDemo: () => void }) {
  return (
    <div className="relative min-h-[100svh] flex flex-col">
      <StatsBackground />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Logo size={64} showText={false} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-8 text-5xl sm:text-7xl font-semibold tracking-tight text-gradient leading-[1.05]"
        >
          Your FPL team.
          <br />
          Analysed by AI.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32 }}
          className="mt-6 max-w-xl text-white/55 leading-relaxed"
        >
          Upload your squad. See what's holding you back. Get data-backed transfer recommendations
          — built on live Fantasy Premier League data, not guesswork.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.44 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <GlowButton size="lg" icon={<Upload size={18} />} onClick={onUpload}>
            Analyse My Team
          </GlowButton>
          <GlowButton size="lg" variant="secondary" icon={<Sparkles size={18} />} onClick={onDemo}>
            Try Demo
          </GlowButton>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.58 }}
          className="mt-16 w-full max-w-3xl"
        >
          <GlassCard className="text-left" hover={false}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase tracking-wide text-white/40">Squad preview</span>
              <span className="text-xs text-white/30">Illustrative example</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-8 mt-4">
              <CircularGauge value={78} size={140} strokeWidth={11} />
              <div className="flex-1 w-full space-y-3">
                <BarGauge label="Player quality" value={82} delay={0.1} />
                <BarGauge label="Fixtures" value={64} delay={0.2} />
                <BarGauge label="Squad balance" value={57} delay={0.3} />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mt-24 w-full max-w-5xl"
        >
          <h2 className="text-sm uppercase tracking-widest text-white/40 mb-6">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((step, i) => (
              <GlassCard key={step.title} delay={i * 0.06} className="text-left">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">{step.icon}</div>
                <h3 className="font-medium text-sm">{step.title}</h3>
                <p className="text-xs text-white/45 mt-1.5 leading-relaxed">{step.desc}</p>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* What we analyse */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mt-16 w-full max-w-4xl"
        >
          <h2 className="text-sm uppercase tracking-widest text-white/40 mb-5">What we analyse</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {WHAT_WE_ANALYSE.map((item) => (
              <span key={item} className="glass rounded-full px-4 py-1.5 text-sm text-white/70">
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl"
        >
          {[
            { icon: <TrendingUp className="text-blue-400" size={22} />, title: 'Live FPL data', desc: 'Pulled from the official Fantasy Premier League API, normalised and traceable.' },
            { icon: <Users className="text-emerald-400" size={22} />, title: 'Position-aware scoring', desc: 'Goalkeepers, defenders, midfielders and forwards scored on different metrics.' },
            { icon: <ShieldCheck className="text-amber-400" size={22} />, title: 'Transparent, not magic', desc: 'Every score and recommendation traces back to a documented formula.' },
          ].map((f, i) => (
            <GlassCard key={f.title} delay={i * 0.08} className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">{f.icon}</div>
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
