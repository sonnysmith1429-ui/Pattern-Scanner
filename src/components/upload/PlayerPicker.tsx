import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import type { Player, Position } from '../../types';
import PlayerAvatar from '../ui/PlayerAvatar';
import { formatPrice } from '../../lib/utils/format';

export default function PlayerPicker({
  players,
  onSelect,
  onClose,
  preferredPosition,
}: {
  players: Player[];
  onSelect: (playerId: number) => void;
  onClose: () => void;
  preferredPosition?: Position;
}) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q
      ? players.filter((p) => `${p.firstName} ${p.secondName} ${p.team}`.toLowerCase().includes(q))
      : preferredPosition
        ? players.filter((p) => p.position === preferredPosition)
        : players;
    return [...pool].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 8);
  }, [players, query, preferredPosition]);

  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-3 mt-2 relative z-20">
      <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
        <Search size={14} className="text-white/40" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search player name…"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/25"
        />
        <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer" aria-label="Close search">
          <X size={14} />
        </button>
      </div>
      <div className="mt-2 max-h-64 overflow-y-auto space-y-1">
        {results.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 text-left cursor-pointer transition-colors"
          >
            <PlayerAvatar code={p.code} name={p.displayName} size={28} />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{p.displayName}</p>
              <p className="text-xs text-white/40">
                {p.team} · {p.position}
              </p>
            </div>
            <span className="text-xs text-white/50 tabular-nums">{formatPrice(p.price)}</span>
          </button>
        ))}
        {!results.length && <p className="text-xs text-white/35 px-2 py-3 text-center">No players found.</p>}
      </div>
    </motion.div>
  );
}
