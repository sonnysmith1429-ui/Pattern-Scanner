import { motion } from 'framer-motion';
import { AlertTriangle, Crown, Star } from 'lucide-react';
import type { Player, PlayerAnalysis } from '../../types';
import PlayerAvatar from '../ui/PlayerAvatar';
import { formatPrice } from '../../lib/utils/format';
import { scoreTier, TIER_HEX } from '../../lib/fpl/constants';

export default function PitchPlayerCard({
  player,
  analysis,
  isCaptain,
  isViceCaptain,
  onClick,
  delay = 0,
}: {
  player: Player;
  analysis: PlayerAnalysis | undefined;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  onClick: () => void;
  delay?: number;
}) {
  const score = analysis?.overallScore ?? 50;
  const weak = score < 48;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      onClick={onClick}
      className="relative flex flex-col items-center gap-1 w-[76px] sm:w-[92px] cursor-pointer group"
    >
      <div className="relative">
        <PlayerAvatar code={player.code} name={player.displayName} size={44} className="ring-2 ring-black/30 group-hover:ring-white/30 transition-all" />
        {(isCaptain || isViceCaptain) && (
          <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isCaptain ? 'bg-amber-400 text-black' : 'bg-sky-400 text-black'}`}>
            {isCaptain ? <Crown size={11} /> : <Star size={11} />}
          </div>
        )}
        {weak && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
            <AlertTriangle size={9} className="text-white" />
          </div>
        )}
        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full border border-black/40" style={{ background: TIER_HEX[scoreTier(score)] }} />
      </div>
      <div className="glass rounded-lg px-1.5 py-1 w-full text-center">
        <p className="text-[11px] font-medium truncate leading-tight">{player.displayName}</p>
        <p className="text-[10px] text-white/40 leading-tight">{formatPrice(player.price)}</p>
      </div>
    </motion.button>
  );
}
