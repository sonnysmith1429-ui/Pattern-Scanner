import { Newspaper, AlertTriangle, ExternalLink } from 'lucide-react';
import type { Bias, NewsSentiment, NewsSignal } from '../../lib/types';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

const SENTIMENT_TONE: Record<NewsSentiment, 'success' | 'danger' | 'neutral'> = {
  Bullish: 'success',
  'Somewhat-Bullish': 'success',
  Neutral: 'neutral',
  'Somewhat-Bearish': 'danger',
  Bearish: 'danger',
};

function newsDirection(news: NewsSignal): Bias {
  if (news.averageSentiment > 0.15) return 'Bullish';
  if (news.averageSentiment < -0.15) return 'Bearish';
  return 'Neutral';
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.round(diffMs / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function NewsCard({ news, bias }: { news: NewsSignal; bias: Bias }) {
  const direction = newsDirection(news);
  const conflicts = direction !== 'Neutral' && direction !== bias;

  return (
    <GlassCard delay={0.15} className="col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper size={16} className="text-blue-400" />
          <h3 className="text-sm font-medium text-white/50">News Sentiment · {news.ticker}</h3>
        </div>
        <Badge tone={SENTIMENT_TONE[direction]}>{direction}</Badge>
      </div>

      {conflicts && (
        <div className="flex items-start gap-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 px-4 py-3 text-xs text-orange-200/80 mb-4">
          <AlertTriangle size={15} className="shrink-0 mt-0.5 text-orange-400" />
          <p>
            News sentiment leans {direction.toLowerCase()} while the chart's technical bias is{' '}
            {bias.toLowerCase()} — a real conflict worth weighing before acting on either signal alone.
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {news.articles.map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-start justify-between gap-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] px-4 py-3 transition-colors group"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-blue-300 transition-colors">
                {article.title}
              </p>
              <p className="text-xs text-white/35 mt-0.5">
                {article.source} · {timeAgo(article.publishedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge tone={SENTIMENT_TONE[article.sentiment]} className="whitespace-nowrap">
                {article.sentiment}
              </Badge>
              <ExternalLink size={13} className="text-white/25 group-hover:text-white/50 transition-colors" />
            </div>
          </a>
        ))}
      </div>

      <p className="text-[11px] text-white/30 mt-4 leading-relaxed">
        News can move price faster than any chart pattern. This is additional context, not a
        standalone signal — always worth reading the articles yourself before treating it as
        confirmation.
      </p>
    </GlassCard>
  );
}
