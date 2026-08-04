import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Users, TrendingUp, CalendarDays, CircleDollarSign, Layers, ShieldCheck } from 'lucide-react';
import type { CategoryScores, TeamAnalysis } from '../../types';
import { CATEGORY_WEIGHTS } from '../../lib/analytics/weights';
import { scoreTier, TIER_COLORS, TIER_HEX } from '../../lib/fpl/constants';

const CATEGORY_META: Record<keyof CategoryScores, { label: string; icon: React.ReactNode }> = {
  playerQuality: { label: 'Player Quality', icon: <Users size={16} /> },
  form: { label: 'Form', icon: <TrendingUp size={16} /> },
  fixtures: { label: 'Fixtures', icon: <CalendarDays size={16} /> },
  value: { label: 'Value', icon: <CircleDollarSign size={16} /> },
  squadBalance: { label: 'Squad Balance', icon: <Layers size={16} /> },
  availability: { label: 'Availability', icon: <ShieldCheck size={16} /> },
};

function explanationFor(key: keyof CategoryScores, score: number, teamAnalysis: TeamAnalysis): string {
  switch (key) {
    case 'playerQuality': {
      const weakest = [...teamAnalysis.playerAnalyses].sort((a, b) => a.overallScore - b.overallScore)[0];
      return `Reflects attacking and defensive output across your squad, weighted by position. ${
        weakest ? `Your weakest contributor rates ${weakest.overallScore}/100 for their position.` : ''
      }`;
    }
    case 'form':
      return `Based on recent points-per-game relative to other players in the same position. ${
        score < 45 ? 'A number of picks are currently cooling off.' : score >= 75 ? 'Most of your squad is in good recent form.' : 'A mixed picture across the squad.'
      }`;
    case 'fixtures':
      return `A blend of each player's next 3, 5 and 8 fixture difficulty ratings (near-term weighted heavier). ${
        score >= 70 ? 'Fixtures are favourable overall.' : score < 40 ? 'A tough run of fixtures lies ahead for several players.' : 'A mixed fixture swing overall.'
      }`;
    case 'value':
      return `Total points earned per £1m spent, compared against similarly priced players in the same position. ${
        score < 40 ? 'Several picks are underperforming their price tag.' : 'Reasonable returns for the money spent overall.'
      }`;
    case 'squadBalance': {
      const top = teamAnalysis.structure.clubConcentration[0];
      return `Checks club concentration, premium player count, positional spend and bench spend (${score}/100). ${
        top && top.count >= 3 ? `${top.count} players currently come from ${top.teamName}.` : 'No single club is over-represented.'
      }`;
    }
    case 'availability':
      return `Weighted by injury/suspension status and how consistently each starter has played this season. ${
        score < 50 ? 'At least one starter carries real availability risk right now.' : 'Availability risk across the squad is low.'
      }`;
  }
  return '';
}

export default function CategoryBreakdown({ teamAnalysis }: { teamAnalysis: TeamAnalysis }) {
  const [expanded, setExpanded] = useState<keyof CategoryScores | null>(null);
  const entries = Object.entries(teamAnalysis.categoryScores) as [keyof CategoryScores, number][];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {entries.map(([key, score], i) => {
        const meta = CATEGORY_META[key];
        const tier = scoreTier(score);
        const isOpen = expanded === key;
        return (
          <motion.button
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            onClick={() => setExpanded(isOpen ? null : key)}
            className="glass rounded-2xl p-4 text-left cursor-pointer hover:border-white/20 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-white/70">
                {meta.icon}
                {meta.label}
              </span>
              <ChevronDown size={14} className={`text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            <div className="flex items-end justify-between mt-3">
              <span className={`text-2xl font-semibold tabular-nums ${TIER_COLORS[tier].text}`}>{score}</span>
              <span className="text-[11px] text-white/30">{Math.round(CATEGORY_WEIGHTS[key] * 100)}% weight</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/8 mt-2 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${score}%`, background: TIER_HEX[tier] }} />
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="text-xs text-white/50 leading-relaxed overflow-hidden mt-3"
                >
                  {explanationFor(key, score, teamAnalysis)}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
