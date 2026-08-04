import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpDown, GitCompare } from 'lucide-react';
import type { FplDataset, Player, Position } from '../../types';
import PlayerAvatar from '../ui/PlayerAvatar';
import GlowButton from '../ui/GlowButton';
import { formatPrice } from '../../lib/utils/format';
import { POSITIONS } from '../../lib/fpl/constants';

type SortKey = 'totalPoints' | 'price' | 'form' | 'selectedByPercent';

const SORT_LABELS: Record<SortKey, string> = {
  totalPoints: 'Points',
  price: 'Price',
  form: 'Form',
  selectedByPercent: 'Ownership',
};

export default function PlayersPage({
  dataset,
  onOpenPlayer,
  onCompare,
}: {
  dataset: FplDataset;
  onOpenPlayer: (playerId: number) => void;
  onCompare: (aId: number, bId: number) => void;
}) {
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState<Position | 'ALL'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('totalPoints');
  const [selected, setSelected] = useState<number[]>([]);

  const players = useMemo(() => {
    const q = query.trim().toLowerCase();
    let pool = dataset.players;
    if (position !== 'ALL') pool = pool.filter((p) => p.position === position);
    if (q) pool = pool.filter((p) => `${p.firstName} ${p.secondName} ${p.team}`.toLowerCase().includes(q));
    return [...pool].sort((a, b) => b[sortKey] - a[sortKey]).slice(0, 60);
  }, [dataset.players, query, position, sortKey]);

  function toggleSelect(id: number) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold">Players</h1>
        <p className="text-white/50 mt-1 text-sm">Browse the full FPL player database. Select two players to compare.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 flex-1">
          <Search size={15} className="text-white/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search players or clubs…" className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/25" />
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 overflow-x-auto">
          {(['ALL', ...POSITIONS] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPosition(p)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                position === p ? 'bg-blue-500 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-white/40 flex items-center gap-1">
          <ArrowUpDown size={12} /> Sort by
        </span>
        {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setSortKey(key)}
            className={`text-xs px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
              sortKey === key ? 'bg-white/15 text-white' : 'bg-white/5 text-white/50 hover:text-white'
            }`}
          >
            {SORT_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl divide-y divide-white/6 overflow-hidden">
        {players.map((p) => (
          <PlayerRow key={p.id} player={p} selected={selected.includes(p.id)} onToggleSelect={() => toggleSelect(p.id)} onClick={() => onOpenPlayer(p.id)} />
        ))}
        {!players.length && <p className="text-center text-white/40 text-sm py-10">No players match your filters.</p>}
      </div>

      <AnimatePresence>
        {selected.length === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-40">
            <GlowButton size="lg" icon={<GitCompare size={16} />} onClick={() => onCompare(selected[0], selected[1])}>
              Compare Selected
            </GlowButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PlayerRow({
  player,
  selected,
  onToggleSelect,
  onClick,
}: {
  player: Player;
  selected: boolean;
  onToggleSelect: () => void;
  onClick: () => void;
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${selected ? 'bg-blue-500/10' : ''}`}>
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggleSelect}
        onClick={(e) => e.stopPropagation()}
        className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
        aria-label={`Select ${player.displayName} to compare`}
      />
      <button onClick={onClick} className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer">
        <PlayerAvatar code={player.code} name={player.displayName} size={34} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{player.displayName}</p>
          <p className="text-xs text-white/40">
            {player.team} · {player.position}
          </p>
        </div>
      </button>
      <div className="hidden sm:flex items-center gap-6 text-sm tabular-nums shrink-0">
        <span className="text-white/60 w-14 text-right">{formatPrice(player.price)}</span>
        <span className="text-white/60 w-10 text-right">{player.form.toFixed(1)}</span>
        <span className="w-12 text-right font-medium">{player.totalPoints} pts</span>
      </div>
    </div>
  );
}
