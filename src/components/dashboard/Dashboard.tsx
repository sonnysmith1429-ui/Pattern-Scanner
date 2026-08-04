import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { AIAnalysisResponse, DataFreshness, FplDataset, Squad, TeamAnalysis } from '../../types';
import ScoreHero from './ScoreHero';
import CategoryBreakdown from './CategoryBreakdown';
import WeaknessSection from './WeaknessSection';
import CaptainCard from './CaptainCard';
import BenchCard from './BenchCard';
import StructureCard from './StructureCard';
import AISummaryCard from './AISummaryCard';
import GlowButton from '../ui/GlowButton';
import Disclaimer from '../ui/Disclaimer';

export default function Dashboard({
  dataset,
  squad,
  teamAnalysis,
  freshness,
  onRefresh,
  refreshing,
  aiResponse,
  aiLoading,
  onRescan,
  isFavourite,
  onToggleFavourite,
  onNavigate,
}: {
  dataset: FplDataset;
  squad: Squad;
  teamAnalysis: TeamAnalysis;
  freshness: DataFreshness;
  onRefresh: () => void;
  refreshing: boolean;
  aiResponse: AIAnalysisResponse | null;
  aiLoading: boolean;
  onRescan: () => void;
  isFavourite: boolean;
  onToggleFavourite: () => void;
  onNavigate: (tab: 'squad' | 'transfers' | 'players' | 'fixtures') => void;
}) {
  const playerById = new Map(dataset.players.map((p) => [p.id, p]));
  void squad;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <ScoreHero
        teamAnalysis={teamAnalysis}
        freshness={freshness}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onRescan={onRescan}
        isFavourite={isFavourite}
        onToggleFavourite={onToggleFavourite}
      />

      <section>
        <h2 className="text-sm uppercase tracking-widest text-white/40 mb-4">Score breakdown</h2>
        <CategoryBreakdown teamAnalysis={teamAnalysis} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm uppercase tracking-widest text-white/40">Your biggest weaknesses</h2>
          <button onClick={() => onNavigate('transfers')} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer">
            All transfers <ArrowRight size={13} />
          </button>
        </div>
        <WeaknessSection weaknesses={teamAnalysis.weaknesses} playerById={playerById} onViewTransfer={() => onNavigate('transfers')} />
      </section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass rounded-[24px] p-6 sm:p-8 text-center bg-gradient-to-br from-blue-500/10 to-emerald-500/10"
      >
        <Sparkles className="mx-auto text-blue-400 mb-3" size={28} />
        <h3 className="text-xl font-semibold mb-2">Fix My Team</h3>
        <p className="text-white/55 max-w-lg mx-auto mb-5 text-sm">
          Run the optimiser to find the best combination of transfers for your free transfers and budget.
        </p>
        <GlowButton size="lg" onClick={() => onNavigate('transfers')}>
          ✨ Fix My Team
        </GlowButton>
      </motion.section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CaptainCard captain={teamAnalysis.captain} playerById={playerById} />
        <BenchCard bench={teamAnalysis.bench} />
        <StructureCard structure={teamAnalysis.structure} />
      </section>

      <section>
        <AISummaryCard response={aiResponse} loading={aiLoading} />
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            { key: 'squad', label: 'View Squad' },
            { key: 'transfers', label: 'Transfers' },
            { key: 'players', label: 'Players' },
            { key: 'fixtures', label: 'Fixtures' },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className="glass rounded-2xl px-4 py-4 text-sm font-medium hover:border-white/20 transition-colors cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </section>

      <Disclaimer />
    </div>
  );
}
