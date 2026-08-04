import { Radio, Database, RefreshCw } from 'lucide-react';
import Badge from './Badge';
import type { DataFreshness } from '../../types';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 minute ago';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.round(mins / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}

export default function DataFreshnessBadge({
  freshness,
  onRefresh,
  refreshing,
}: {
  freshness: DataFreshness;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const label =
    freshness.source === 'live'
      ? `Live data · updated ${timeAgo(freshness.fetchedAt)}`
      : freshness.source === 'cache'
        ? `Cached data · from ${timeAgo(freshness.fetchedAt)}`
        : 'DEMO DATA — not live';

  const tone = freshness.source === 'live' ? 'success' : freshness.source === 'cache' ? 'warning' : 'accent';
  const icon = freshness.source === 'live' ? <Radio size={12} /> : <Database size={12} />;

  return (
    <div className="flex items-center gap-2 flex-wrap" title={freshness.note}>
      <Badge tone={tone} icon={icon}>
        {label}
      </Badge>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          Refresh data
        </button>
      )}
    </div>
  );
}
