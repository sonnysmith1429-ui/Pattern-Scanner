import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Pencil, Plus, Trash2, Crown, Star } from 'lucide-react';
import type { DetectedPick, DetectedSquad, Player, UserContext } from '../../types';
import GlassCard from '../ui/GlassCard';
import GlowButton from '../ui/GlowButton';
import Badge from '../ui/Badge';
import PlayerAvatar from '../ui/PlayerAvatar';
import PlayerPicker from './PlayerPicker';
import { formatPrice } from '../../lib/utils/format';
import { detectedSquadToSquad } from '../../lib/squad';
import type { Squad } from '../../types';

function confidenceTone(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 0.75) return 'success';
  if (score >= 0.5) return 'warning';
  return 'danger';
}

export default function ConfirmSquad({
  detected,
  players,
  context,
  onConfirm,
  onBack,
}: {
  detected: DetectedSquad;
  players: Player[];
  context: UserContext;
  onConfirm: (squad: Squad) => void;
  onBack: () => void;
}) {
  const [picks, setPicks] = useState<DetectedPick[]>(detected.picks);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const playerById = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  const confirmedCount = picks.filter((p) => p.matchedPlayerId != null).length;
  const hasCaptain = picks.some((p) => p.isCaptain && p.matchedPlayerId != null);

  function updatePick(slotId: string, patch: Partial<DetectedPick>) {
    setPicks((prev) => prev.map((p) => (p.slotId === slotId ? { ...p, ...patch } : p)));
  }

  function removePick(slotId: string) {
    setPicks((prev) => prev.filter((p) => p.slotId !== slotId));
  }

  function setPlayer(slotId: string, playerId: number) {
    updatePick(slotId, { matchedPlayerId: playerId, matchConfidence: 1 });
    setEditingSlot(null);
  }

  function setCaptain(slotId: string) {
    setPicks((prev) => prev.map((p) => ({ ...p, isCaptain: p.slotId === slotId })));
  }

  function setVice(slotId: string) {
    setPicks((prev) => prev.map((p) => ({ ...p, isViceCaptain: p.slotId === slotId })));
  }

  function addSlot() {
    const starters = picks.filter((p) => p.isStarter).length;
    const newSlot: DetectedPick = {
      slotId: `manual-${Date.now()}`,
      rawText: '',
      isStarter: starters < 11,
      isBench: starters >= 11,
      isCaptain: false,
      isViceCaptain: false,
      matchedPlayerId: null,
      matchConfidence: 0,
      alternatives: [],
    };
    setPicks((prev) => [...prev, newSlot]);
    setEditingSlot(newSlot.slotId);
  }

  function handleConfirm() {
    const squad = detectedSquadToSquad({ ...detected, picks }, context);
    onConfirm(squad);
  }

  const starters = picks.filter((p) => p.isStarter);
  const bench = picks.filter((p) => !p.isStarter);

  return (
    <div className="min-h-[100svh] px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-white/50 hover:text-white text-sm transition-colors cursor-pointer">
            ← Back
          </button>
          <span className="text-xs uppercase tracking-widest text-white/40">Step 2 of 3</span>
        </div>

        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-4xl font-semibold text-center mb-2">
          Confirm your squad
        </motion.h2>
        <p className="text-center text-white/50 mb-2">
          We found {confirmedCount}/{detected.playersExpected} players. Please confirm or correct any highlighted picks below.
        </p>
        {!hasCaptain && (
          <p className="text-center text-amber-400 text-sm mb-6 flex items-center justify-center gap-1.5">
            <AlertCircle size={14} /> No captain selected yet — tap the crown icon on a starter.
          </p>
        )}

        <GlassCard hover={false} className="mb-4">
          <h3 className="text-xs uppercase tracking-wide text-white/40 mb-3">Starting XI ({starters.length})</h3>
          <div className="space-y-2">
            {starters.map((pick) => (
              <PickRow
                key={pick.slotId}
                pick={pick}
                player={pick.matchedPlayerId != null ? playerById.get(pick.matchedPlayerId) : undefined}
                editing={editingSlot === pick.slotId}
                onEdit={() => setEditingSlot(editingSlot === pick.slotId ? null : pick.slotId)}
                onRemove={() => removePick(pick.slotId)}
                onToggleBench={() => updatePick(pick.slotId, { isStarter: false, isBench: true })}
                onSetCaptain={() => setCaptain(pick.slotId)}
                onSetVice={() => setVice(pick.slotId)}
                onSelectPlayer={(id) => setPlayer(pick.slotId, id)}
                players={players}
              />
            ))}
          </div>
        </GlassCard>

        <GlassCard hover={false} className="mb-6">
          <h3 className="text-xs uppercase tracking-wide text-white/40 mb-3">Bench ({bench.length})</h3>
          <div className="space-y-2">
            {bench.map((pick) => (
              <PickRow
                key={pick.slotId}
                pick={pick}
                player={pick.matchedPlayerId != null ? playerById.get(pick.matchedPlayerId) : undefined}
                editing={editingSlot === pick.slotId}
                onEdit={() => setEditingSlot(editingSlot === pick.slotId ? null : pick.slotId)}
                onRemove={() => removePick(pick.slotId)}
                onToggleBench={() => updatePick(pick.slotId, { isStarter: true, isBench: false })}
                onSetCaptain={() => setCaptain(pick.slotId)}
                onSetVice={() => setVice(pick.slotId)}
                onSelectPlayer={(id) => setPlayer(pick.slotId, id)}
                players={players}
                isBenchRow
              />
            ))}
            {picks.length < 15 && (
              <button
                onClick={addSlot}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/15 text-sm text-white/50 hover:text-white hover:border-white/25 transition-colors cursor-pointer"
              >
                <Plus size={15} /> Add missing player
              </button>
            )}
          </div>
        </GlassCard>

        <div className="flex justify-center">
          <GlowButton size="lg" icon={<Check size={18} />} onClick={handleConfirm} disabled={confirmedCount === 0}>
            Confirm &amp; Analyse Squad
          </GlowButton>
        </div>
      </div>
    </div>
  );
}

function PickRow({
  pick,
  player,
  editing,
  onEdit,
  onRemove,
  onToggleBench,
  onSetCaptain,
  onSetVice,
  onSelectPlayer,
  players,
  isBenchRow,
}: {
  pick: DetectedPick;
  player: Player | undefined;
  editing: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onToggleBench: () => void;
  onSetCaptain: () => void;
  onSetVice: () => void;
  onSelectPlayer: (id: number) => void;
  players: Player[];
  isBenchRow?: boolean;
}) {
  return (
    <div>
      <div className={`flex items-center gap-3 px-2 py-2 rounded-xl ${!player ? 'bg-rose-500/8 border border-rose-500/20' : 'hover:bg-white/5'}`}>
        {player ? (
          <PlayerAvatar code={player.code} name={player.displayName} size={34} />
        ) : (
          <div className="w-[34px] h-[34px] rounded-full bg-rose-500/15 flex items-center justify-center text-rose-400">
            <AlertCircle size={16} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">
            {player ? player.displayName : pick.rawText ? `Unmatched: "${pick.rawText}"` : 'No player selected'}
          </p>
          <p className="text-xs text-white/40 truncate">
            {player ? `${player.team} · ${player.position} · ${formatPrice(player.price)}` : 'Tap edit to search for the correct player'}
          </p>
        </div>
        {pick.matchConfidence > 0 && pick.matchConfidence < 1 && (
          <Badge tone={confidenceTone(pick.matchConfidence)}>{Math.round(pick.matchConfidence * 100)}%</Badge>
        )}
        <button
          onClick={onSetCaptain}
          title="Set as captain"
          className={`p-1.5 rounded-lg cursor-pointer transition-colors ${pick.isCaptain ? 'text-amber-400 bg-amber-400/10' : 'text-white/25 hover:text-white/60'}`}
        >
          <Crown size={15} />
        </button>
        <button
          onClick={onSetVice}
          title="Set as vice-captain"
          className={`p-1.5 rounded-lg cursor-pointer transition-colors ${pick.isViceCaptain ? 'text-sky-400 bg-sky-400/10' : 'text-white/25 hover:text-white/60'}`}
        >
          <Star size={15} />
        </button>
        <button onClick={onToggleBench} title={isBenchRow ? 'Move to starting XI' : 'Move to bench'} className="text-xs text-white/40 hover:text-white cursor-pointer px-1.5">
          {isBenchRow ? 'Start' : 'Bench'}
        </button>
        <button onClick={onEdit} title="Edit player" className="p-1.5 rounded-lg text-white/40 hover:text-white cursor-pointer">
          <Pencil size={14} />
        </button>
        <button onClick={onRemove} title="Remove" className="p-1.5 rounded-lg text-white/25 hover:text-rose-400 cursor-pointer">
          <Trash2 size={14} />
        </button>
      </div>
      {editing && (
        <PlayerPicker players={players} preferredPosition={player?.position} onSelect={onSelectPlayer} onClose={onEdit} />
      )}
      {!editing && pick.alternatives.length > 0 && !player && (
        <div className="flex flex-wrap gap-1.5 px-2 pb-2">
          {pick.alternatives.slice(0, 3).map((alt) => {
            const altPlayer = players.find((p) => p.id === alt.playerId);
            if (!altPlayer) return null;
            return (
              <button
                key={alt.playerId}
                onClick={() => onSelectPlayer(alt.playerId)}
                className="text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white cursor-pointer"
              >
                {altPlayer.displayName}?
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
