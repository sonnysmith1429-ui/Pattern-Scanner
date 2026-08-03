import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, Trophy, Gauge, Tag, ChevronDown, FileText, Shield } from 'lucide-react';
import type { ScanResult } from '../../lib/types';
import GlassCard from '../ui/GlassCard';
import Logo from '../ui/Logo';

const APP_VERSION = '1.0.0 (Prototype)';

const PRIVACY_POLICY = `Pattern Scanner is a prototype application. Any images you upload are processed locally in your browser to simulate an AI analysis and are stored only in this browser's local storage as part of your scan history. No images or personal data are transmitted to external servers in this prototype. Clearing your browser data or using the "Clear History" option will permanently remove this information.`;

const TERMS_OF_SERVICE = `Pattern Scanner is provided for demonstration and educational purposes only. It does not constitute financial, investment, or trading advice of any kind. All pattern recognition, technical indicators, confidence scores, and trade bias examples shown are simulated and illustrative. You should not make any financial decisions based on this prototype. Use of this application is at your own risk and is provided "as is" without warranties of any kind.`;

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <GlassCard delay={0.05} className="text-center">
      <div className="w-11 h-11 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <p className="text-lg sm:text-2xl font-semibold truncate" title={value}>
        {value}
      </p>
      <p className="text-xs text-white/40 mt-1">{label}</p>
    </GlassCard>
  );
}

function ExpandableSection({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <GlassCard hover={false} className="mb-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-blue-400">{icon}</div>
          <p className="text-sm font-medium">{title}</p>
        </div>
        <ChevronDown size={16} className={`text-white/30 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden text-sm text-white/50 leading-relaxed pt-4"
        >
          {content}
        </motion.p>
      )}
    </GlassCard>
  );
}

export default function Profile({ history }: { history: ScanResult[] }) {
  const stats = useMemo(() => {
    const scansCompleted = history.length;
    const avgConfidence = scansCompleted
      ? Math.round(history.reduce((s, h) => s + h.overallConfidence, 0) / scansCompleted)
      : 0;
    const counts = new Map<string, number>();
    history.forEach((h) => {
      const top = h.patterns[0]?.name;
      if (top) counts.set(top, (counts.get(top) ?? 0) + 1);
    });
    let favouritePattern = '—';
    let max = 0;
    counts.forEach((count, name) => {
      if (count > max) {
        max = count;
        favouritePattern = name;
      }
    });
    return { scansCompleted, avgConfidence, favouritePattern };
  }, [history]);

  return (
    <div className="px-4 sm:px-6 py-8 sm:py-12 max-w-2xl mx-auto">
      <div className="flex flex-col items-center text-center mb-10">
        <Logo size={64} showText={false} />
        <h1 className="text-2xl font-semibold mt-4">Your Profile</h1>
        <p className="text-white/40 text-sm mt-1">{APP_VERSION}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard icon={<ScanLine size={18} />} label="Scans Completed" value={String(stats.scansCompleted)} />
        <StatCard icon={<Trophy size={18} />} label="Favourite Pattern" value={stats.favouritePattern} />
        <StatCard icon={<Gauge size={18} />} label="Avg. Confidence" value={`${stats.avgConfidence}%`} />
      </div>

      <ExpandableSection icon={<Shield size={16} />} title="Privacy Policy" content={PRIVACY_POLICY} />
      <ExpandableSection icon={<FileText size={16} />} title="Terms of Service" content={TERMS_OF_SERVICE} />

      <div className="flex items-center justify-center gap-2 text-xs text-white/30 mt-8">
        <Tag size={12} />
        Pattern Scanner {APP_VERSION}
      </div>
    </div>
  );
}
