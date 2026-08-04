import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, TrendingUp, Percent, Clock, Target, AlertTriangle } from 'lucide-react';
import type { FplDataset, Player, PlayerAnalysis, PlayerGameweekHistory } from '../../types';
import PlayerAvatar from '../ui/PlayerAvatar';
import Badge from '../ui/Badge';
import FormTrendChart from '../charts/FormTrendChart';
import { formatPrice } from '../../lib/utils/format';
import { fixtureDifficultyColor } from '../../lib/fpl/fixtures';
import { getElementHistory } from '../../lib/fpl/provider';
import { AVAILABILITY_LABELS } from '../../lib/fpl/constants';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/5 rounded-xl px-3 py-2.5">
      <p className="text-[11px] text-white/40">{label}</p>
      <p className="text-sm font-medium tabular-nums mt-0.5">{value}</p>
    </div>
  );
}

export default function PlayerDrawer({
  player,
  analysis,
  dataset,
  onClose,
}: {
  player: Player | null;
  analysis: PlayerAnalysis | undefined;
  dataset: FplDataset;
  onClose: () => void;
}) {
  const [history, setHistory] = useState<PlayerGameweekHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!player) return;
    let cancelled = false;
    setLoadingHistory(true);
    getElementHistory(player.id).then((res) => {
      if (!cancelled) {
        setHistory(res.history);
        setLoadingHistory(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [player]);

  return (
    <AnimatePresence>
      {player && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[90]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#111116] border-l border-white/10 z-[91] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={`${player.displayName} details`}
          >
            <div className="p-5 sm:p-6">
              <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer mb-4" aria-label="Close">
                <X size={20} />
              </button>

              <div className="flex items-center gap-4">
                <PlayerAvatar code={player.code} name={player.displayName} size={64} />
                <div>
                  <h2 className="text-xl font-semibold">{player.displayName}</h2>
                  <p className="text-sm text-white/50">
                    {player.teamName} · {player.position} · {formatPrice(player.price)}
                  </p>
                </div>
              </div>

              {player.status !== 'a' && (
                <div className="mt-4 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>
                    {AVAILABILITY_LABELS[player.status] ?? 'Availability concern'}
                    {player.news ? ` — ${player.news}` : ''}
                  </span>
                </div>
              )}

              {analysis && (
                <div className="mt-5 flex items-center gap-3">
                  <Badge tone="accent" icon={<Target size={12} />}>
                    Rating {analysis.overallScore}/100
                  </Badge>
                  <Badge tone="success" icon={<TrendingUp size={12} />}>
                    {analysis.expectedPoints5gw.toFixed(1)} proj. pts (5 GW)
                  </Badge>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5">
                <Stat label="Total points" value={player.totalPoints} />
                <Stat label="Form" value={player.form.toFixed(1)} />
                <Stat label="Ownership" value={`${player.selectedByPercent.toFixed(1)}%`} />
                <Stat label="Minutes" value={player.minutes} />
                <Stat label="Goals" value={player.goals} />
                <Stat label="Assists" value={player.assists} />
                <Stat label="xG" value={player.xG != null ? player.xG.toFixed(2) : 'N/A'} />
                <Stat label="xA" value={player.xA != null ? player.xA.toFixed(2) : 'N/A'} />
                <Stat label="Bonus" value={player.bonus} />
              </div>

              <div className="mt-6">
                <h3 className="text-xs uppercase tracking-wide text-white/40 mb-2 flex items-center gap-1.5">
                  <TrendingUp size={13} /> Recent form
                </h3>
                {loadingHistory ? (
                  <div className="h-[140px] flex items-center justify-center text-xs text-white/30">Loading…</div>
                ) : (
                  <FormTrendChart history={history} />
                )}
              </div>

              {analysis && analysis.upcomingFixtures.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs uppercase tracking-wide text-white/40 mb-2 flex items-center gap-1.5">
                    <Clock size={13} /> Upcoming fixtures
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.upcomingFixtures.slice(0, 8).map((f) => (
                      <div key={f.fixtureId} className="flex flex-col items-center gap-1">
                        <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-medium text-black/80 ${fixtureDifficultyColor(f.difficulty)}`}>
                          {f.opponent}
                        </span>
                        <span className="text-[9px] text-white/30">{f.isHome ? 'H' : 'A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis && analysis.notes.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs uppercase tracking-wide text-white/40 mb-2 flex items-center gap-1.5">
                    <Percent size={13} /> Analysis notes
                  </h3>
                  <ul className="space-y-1.5">
                    {analysis.notes.map((n) => (
                      <li key={n} className="text-xs text-white/55 leading-relaxed">
                        • {n}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {dataset.freshness.source !== 'live' && (
                <p className="text-[11px] text-white/25 mt-6">Stats shown are from {dataset.freshness.source === 'mock' ? 'demo' : 'cached'} data.</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
