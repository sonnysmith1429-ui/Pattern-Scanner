import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Pencil } from 'lucide-react';
import type { FplDataset } from '../../types';
import PlayerAvatar from '../ui/PlayerAvatar';
import GlassCard from '../ui/GlassCard';
import PlayerPicker from '../upload/PlayerPicker';
import { computePlayerAnalysis, buildPositionPopulations } from '../../lib/analytics';
import { formatPrice } from '../../lib/utils/format';

interface Row {
  label: string;
  a: string;
  b: string;
  aBetter: boolean | null;
}

export default function PlayerComparison({
  dataset,
  playerAId,
  playerBId,
  onChangePlayer,
  onBack,
}: {
  dataset: FplDataset;
  playerAId: number;
  playerBId: number;
  onChangePlayer: (slot: 'a' | 'b', playerId: number) => void;
  onBack: () => void;
}) {
  const [editing, setEditing] = useState<'a' | 'b' | null>(null);
  const playerA = dataset.players.find((p) => p.id === playerAId);
  const playerB = dataset.players.find((p) => p.id === playerBId);

  const populations = useMemo(() => buildPositionPopulations(dataset.players), [dataset.players]);
  const analysisA = playerA ? computePlayerAnalysis(playerA, dataset, populations) : undefined;
  const analysisB = playerB ? computePlayerAnalysis(playerB, dataset, populations) : undefined;

  if (!playerA || !playerB) return null;

  const rows: Row[] = [
    { label: 'Price', a: formatPrice(playerA.price), b: formatPrice(playerB.price), aBetter: playerA.price < playerB.price },
    { label: 'Total points', a: `${playerA.totalPoints}`, b: `${playerB.totalPoints}`, aBetter: playerA.totalPoints > playerB.totalPoints },
    { label: 'Form', a: playerA.form.toFixed(1), b: playerB.form.toFixed(1), aBetter: playerA.form > playerB.form },
    { label: 'xG', a: playerA.xG != null ? playerA.xG.toFixed(2) : 'N/A', b: playerB.xG != null ? playerB.xG.toFixed(2) : 'N/A', aBetter: (playerA.xG ?? 0) > (playerB.xG ?? 0) },
    { label: 'xA', a: playerA.xA != null ? playerA.xA.toFixed(2) : 'N/A', b: playerB.xA != null ? playerB.xA.toFixed(2) : 'N/A', aBetter: (playerA.xA ?? 0) > (playerB.xA ?? 0) },
    { label: 'Ownership', a: `${playerA.selectedByPercent.toFixed(1)}%`, b: `${playerB.selectedByPercent.toFixed(1)}%`, aBetter: null },
    {
      label: 'Fixture score (next 5)',
      a: `${analysisA?.fixtureScore ?? '-'}`,
      b: `${analysisB?.fixtureScore ?? '-'}`,
      aBetter: (analysisA?.fixtureScore ?? 0) > (analysisB?.fixtureScore ?? 0),
    },
    {
      label: 'Value (pts/£m)',
      a: analysisA ? analysisA.pointsPerMillion.toFixed(1) : '-',
      b: analysisB ? analysisB.pointsPerMillion.toFixed(1) : '-',
      aBetter: (analysisA?.pointsPerMillion ?? 0) > (analysisB?.pointsPerMillion ?? 0),
    },
    {
      label: 'Projected pts (5 GW)',
      a: analysisA ? analysisA.expectedPoints5gw.toFixed(1) : '-',
      b: analysisB ? analysisB.expectedPoints5gw.toFixed(1) : '-',
      aBetter: (analysisA?.expectedPoints5gw ?? 0) > (analysisB?.expectedPoints5gw ?? 0),
    },
    { label: 'Overall rating', a: `${analysisA?.overallScore ?? '-'}/100`, b: `${analysisB?.overallScore ?? '-'}/100`, aBetter: (analysisA?.overallScore ?? 0) > (analysisB?.overallScore ?? 0) },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-white/50 hover:text-white text-sm cursor-pointer">
          ← Back
        </button>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <ArrowLeftRight size={18} /> Compare Players
        </h1>
        <span />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {([
          { slot: 'a' as const, player: playerA },
          { slot: 'b' as const, player: playerB },
        ] as const).map(({ slot, player }) => (
          <GlassCard key={slot} hover={false} className="text-center relative">
            <button onClick={() => setEditing(editing === slot ? null : slot)} className="absolute top-3 right-3 text-white/30 hover:text-white cursor-pointer" title="Change player">
              <Pencil size={14} />
            </button>
            <PlayerAvatar code={player.code} name={player.displayName} size={56} className="mx-auto" />
            <p className="font-medium mt-2">{player.displayName}</p>
            <p className="text-xs text-white/40">
              {player.team} · {player.position}
            </p>
            {editing === slot && (
              <PlayerPicker
                players={dataset.players}
                preferredPosition={player.position}
                onSelect={(id) => {
                  onChangePlayer(slot, id);
                  setEditing(null);
                }}
                onClose={() => setEditing(null)}
              />
            )}
          </GlassCard>
        ))}
      </div>

      <GlassCard hover={false}>
        <div className="divide-y divide-white/6">
          {rows.map((row, i) => (
            <motion.div key={row.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="grid grid-cols-3 items-center py-3 text-sm">
              <span className={`text-right pr-4 tabular-nums ${row.aBetter === true ? 'text-emerald-400 font-medium' : 'text-white/70'}`}>{row.a}</span>
              <span className="text-center text-xs text-white/40">{row.label}</span>
              <span className={`text-left pl-4 tabular-nums ${row.aBetter === false ? 'text-emerald-400 font-medium' : 'text-white/70'}`}>{row.b}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
