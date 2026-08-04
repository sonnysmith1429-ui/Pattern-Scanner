import type { AIAnalysisResponse, FplDataset, Squad, TeamAnalysis, TransferRecommendation } from '../../types';
import type { FixMyTeamResult } from '../../lib/recommendations';
import TransferCard from './TransferCard';
import FixMyTeamPanel from './FixMyTeamPanel';
import Disclaimer from '../ui/Disclaimer';

export default function TransfersPage({
  dataset,
  squad,
  teamAnalysis,
  aiResponse,
  onMakeTransfer,
  onApplyFixMyTeam,
  onOpenPlayer,
  onCompare,
}: {
  dataset: FplDataset;
  squad: Squad;
  teamAnalysis: TeamAnalysis;
  aiResponse: AIAnalysisResponse | null;
  onMakeTransfer: (rec: TransferRecommendation) => void;
  onApplyFixMyTeam: (result: FixMyTeamResult) => void;
  onOpenPlayer: (playerId: number) => void;
  onCompare: (outId: number, inId: number) => void;
}) {
  void squad;
  const playerById = new Map(dataset.players.map((p) => [p.id, p]));
  const analysisById = new Map(teamAnalysis.playerAnalyses.map((a) => [a.playerId, a]));

  const verdictFor = (rec: TransferRecommendation) => {
    const outName = playerById.get(rec.outPlayerId)?.displayName;
    const inName = playerById.get(rec.inPlayerId)?.displayName;
    return aiResponse?.recommendations.find((r) => r.outName === outName && r.inName === inName)?.verdict;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold">Transfers</h1>
        <p className="text-white/50 mt-1 text-sm">Ranked, data-driven replacement suggestions for your squad's weakest picks.</p>
      </div>

      <FixMyTeamPanel dataset={dataset} squad={squad} teamAnalysis={teamAnalysis} onApply={onApplyFixMyTeam} />

      <div>
        <h2 className="text-sm uppercase tracking-widest text-white/40 mb-4">All recommendations</h2>
        {!teamAnalysis.recommendations.length && (
          <div className="glass rounded-2xl p-8 text-center text-white/50 text-sm">No improving transfers found for your current squad and budget.</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teamAnalysis.recommendations.map((rec, i) => {
            const outPlayer = playerById.get(rec.outPlayerId);
            const inPlayer = playerById.get(rec.inPlayerId);
            if (!outPlayer || !inPlayer) return null;
            return (
              <TransferCard
                key={rec.id}
                rec={rec}
                outPlayer={outPlayer}
                inPlayer={inPlayer}
                outAnalysis={analysisById.get(rec.outPlayerId)}
                inAnalysis={analysisById.get(rec.inPlayerId)}
                aiVerdict={verdictFor(rec)}
                onMakeTransfer={() => onMakeTransfer(rec)}
                onCompare={() => onCompare(rec.outPlayerId, rec.inPlayerId)}
                onSeeStats={() => onOpenPlayer(rec.inPlayerId)}
                delay={i * 0.06}
              />
            );
          })}
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}
