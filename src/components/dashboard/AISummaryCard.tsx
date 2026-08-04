import { Sparkles, Info } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';
import type { AIAnalysisResponse } from '../../types';

const PROVIDER_LABEL: Record<AIAnalysisResponse['provider'], string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  mock: 'Built-in analyst (no AI key configured)',
};

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-white/8 rounded w-3/4" />
      <div className="h-4 bg-white/8 rounded w-full" />
      <div className="h-4 bg-white/8 rounded w-5/6" />
    </div>
  );
}

export default function AISummaryCard({ response, loading }: { response: AIAnalysisResponse | null; loading: boolean }) {
  return (
    <GlassCard hover={false}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center gap-2">
          <Sparkles size={16} className="text-blue-400" /> AI Analysis
        </h3>
        {response && <Badge tone="accent">{PROVIDER_LABEL[response.provider]}</Badge>}
      </div>

      {loading && <Skeleton />}

      {!loading && response && (
        <div className="space-y-4">
          <p className="text-sm text-white/75 leading-relaxed">{response.summary}</p>
          <p className="text-sm text-white/60 leading-relaxed border-l-2 border-blue-400/40 pl-3">{response.overallVerdict}</p>

          {response.weaknesses.length > 0 && (
            <div className="space-y-2">
              {response.weaknesses.map((w) => (
                <div key={w.title} className="text-sm">
                  <p className="font-medium text-white/80">{w.title}</p>
                  <p className="text-white/50 text-xs leading-relaxed mt-0.5">{w.explanation}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-white/8">
            <div>
              <p className="text-xs text-white/40 mb-1">Captain</p>
              <p className="text-sm text-white/70">{response.captainSuggestion}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Bench</p>
              <p className="text-sm text-white/70">{response.benchSuggestion}</p>
            </div>
          </div>

          {response.dataLimitations.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-white/40 bg-white/5 rounded-xl p-3">
              <Info size={13} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                {response.dataLimitations.map((d) => (
                  <p key={d}>{d}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
