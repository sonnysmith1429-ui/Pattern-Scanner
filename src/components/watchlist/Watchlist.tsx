import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Bookmark, CalendarClock } from 'lucide-react';
import type { WatchlistItem } from '../../lib/types';
import GlassCard from '../ui/GlassCard';
import GlowButton from '../ui/GlowButton';

export default function Watchlist({
  items,
  onAdd,
  onUpdate,
  onDelete,
}: {
  items: WatchlistItem[];
  onAdd: (item: Omit<WatchlistItem, 'id'>) => void;
  onUpdate: (id: string, patch: Partial<WatchlistItem>) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [asset, setAsset] = useState('');
  const [notes, setNotes] = useState('');

  function submit() {
    if (!asset.trim()) return;
    onAdd({ asset: asset.trim(), notes: notes.trim(), lastScanDate: null, observations: '' });
    setAsset('');
    setNotes('');
    setShowForm(false);
  }

  return (
    <div className="px-4 sm:px-6 py-8 sm:py-12 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Watchlist</h1>
          <p className="text-white/40 text-sm mt-1">Track assets and keep personal notes</p>
        </div>
        <GlowButton size="sm" icon={<Plus size={15} />} onClick={() => setShowForm((s) => !s)}>
          Add Asset
        </GlowButton>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <GlassCard hover={false}>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <input
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  placeholder="Asset name (e.g. BTC/USD)"
                  className="glass rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400/50 placeholder:text-white/30"
                />
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes"
                  className="glass rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400/50 placeholder:text-white/30"
                />
              </div>
              <div className="flex justify-end gap-2">
                <GlowButton size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </GlowButton>
                <GlowButton size="sm" onClick={submit}>
                  Save
                </GlowButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {items.length === 0 ? (
        <GlassCard className="text-center py-16" hover={false}>
          <Bookmark className="mx-auto text-white/20 mb-4" size={40} />
          <p className="text-white/50">Your watchlist is empty. Add an asset to keep notes on it.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div key={item.id} layout exit={{ opacity: 0, x: -20 }}>
                <GlassCard hover={false} className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Bookmark size={14} className="text-blue-400 shrink-0" />
                      <p className="font-medium">{item.asset}</p>
                    </div>
                    <textarea
                      value={item.observations}
                      onChange={(e) => onUpdate(item.id, { observations: e.target.value })}
                      placeholder="Personal observations…"
                      rows={1}
                      className="w-full bg-transparent text-sm text-white/60 outline-none resize-none placeholder:text-white/25"
                    />
                    {item.notes && <p className="text-xs text-white/35 mt-1">{item.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-white/40">
                      <CalendarClock size={13} />
                      {item.lastScanDate
                        ? new Date(item.lastScanDate).toLocaleDateString()
                        : 'No scans yet'}
                    </div>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 rounded-lg hover:bg-red-500/15 transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} className="text-white/40 hover:text-red-400" />
                    </button>
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
