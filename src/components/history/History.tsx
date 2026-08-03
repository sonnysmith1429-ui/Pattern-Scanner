import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Trash2, Inbox, ArrowUpDown } from 'lucide-react';
import type { ScanResult } from '../../lib/types';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

type SortKey = 'newest' | 'oldest' | 'confidence';

export default function History({
  history,
  onSelect,
  onToggleFavourite,
  onDelete,
}: {
  history: ScanResult[];
  onSelect: (id: string) => void;
  onToggleFavourite: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [favouritesOnly, setFavouritesOnly] = useState(false);

  const filtered = useMemo(() => {
    let items = history.filter((h) => {
      const q = query.toLowerCase();
      const matches =
        !q ||
        h.trend.toLowerCase().includes(q) ||
        h.patterns.some((p) => p.name.toLowerCase().includes(q));
      return matches && (!favouritesOnly || h.favourite);
    });
    items = [...items].sort((a, b) => {
      if (sort === 'newest') return b.createdAt.localeCompare(a.createdAt);
      if (sort === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      return b.overallConfidence - a.overallConfidence;
    });
    return items;
  }, [history, query, sort, favouritesOnly]);

  return (
    <div className="px-4 sm:px-6 py-8 sm:py-12 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">History</h1>
          <p className="text-white/40 text-sm mt-1">
            {history.length} scan{history.length === 1 ? '' : 's'} saved on this device
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by pattern or trend…"
            className="w-full glass rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-400/50 transition-colors placeholder:text-white/30"
          />
        </div>
        <button
          onClick={() => setFavouritesOnly((f) => !f)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
            favouritesOnly ? 'bg-orange-500/20 text-orange-400' : 'glass text-white/60 hover:text-white'
          }`}
        >
          <Star size={14} className={favouritesOnly ? 'fill-orange-400' : ''} />
          Favourites
        </button>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="appearance-none glass rounded-xl pl-9 pr-8 py-2.5 text-sm outline-none cursor-pointer text-white/70"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="confidence">Highest confidence</option>
          </select>
          <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="text-center py-16" hover={false}>
          <Inbox className="mx-auto text-white/20 mb-4" size={40} />
          <p className="text-white/50">No scans found yet. Upload a chart to get started.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((h, i) => (
              <motion.div
                key={h.id}
                layout
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="p-0 overflow-hidden cursor-pointer group" delay={i * 0.05}>
                  <div onClick={() => onSelect(h.id)} className="relative aspect-video bg-black/40">
                    <img src={h.image} alt="Chart" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <Badge tone="accent" className="absolute top-3 left-3">
                      {h.trend}
                    </Badge>
                    <span className="absolute bottom-3 right-3 text-xs font-semibold text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                      {h.overallConfidence}%
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate pr-2">{h.patterns[0]?.name ?? 'No pattern'}</p>
                    </div>
                    <p className="text-xs text-white/40">
                      {new Date(h.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavourite(h.id);
                        }}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        title="Favourite"
                      >
                        <Star size={15} className={h.favourite ? 'fill-orange-400 text-orange-400' : 'text-white/40'} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(h.id);
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/15 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={15} className="text-white/40 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
