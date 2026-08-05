import type { NewsArticle, NewsSentiment, NewsSignal } from './types';

// Requests go through this app's own /api/news serverless function (see
// api/news.js) rather than hitting Alpha Vantage directly from the browser —
// a same-origin call sidesteps any CORS restriction the provider might
// place on direct client-side requests, and only works once this is
// deployed somewhere with serverless functions (e.g. Vercel), not as a
// static-only page.
const NEWS_PROXY_URL = '/api/news';

function parseTimestamp(raw: string | undefined): string {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/.exec(raw ?? '');
  if (!match) return new Date().toISOString();
  const [, y, mo, d, h, mi, s] = match;
  const parsed = new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}Z`);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function coerceSentiment(label: unknown): NewsSentiment {
  const valid: NewsSentiment[] = ['Bullish', 'Somewhat-Bullish', 'Neutral', 'Somewhat-Bearish', 'Bearish'];
  return valid.includes(label as NewsSentiment) ? (label as NewsSentiment) : 'Neutral';
}

/**
 * Fetches recent news + sentiment for a ticker via the /api/news proxy.
 * Returns null on any failure — missing key, no ticker, the proxy route
 * not existing (static-only hosting), rate limiting, or an unexpected
 * response shape — so a scan never breaks because live news wasn't
 * reachable; it just proceeds without that signal.
 */
export async function fetchNewsSignal(ticker: string, apiKey: string): Promise<NewsSignal | null> {
  const symbol = ticker.trim().toUpperCase();
  const key = apiKey.trim();
  if (!symbol || !key) return null;

  try {
    const url = `${NEWS_PROXY_URL}?ticker=${encodeURIComponent(symbol)}&apiKey=${encodeURIComponent(key)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const feed = Array.isArray((data as { feed?: unknown[] })?.feed) ? (data as { feed: unknown[] }).feed : [];
    if (!feed.length) return null;

    const articles: NewsArticle[] = feed
      .map((raw) => {
        const item = raw as Record<string, unknown>;
        const tickerSentiments = Array.isArray(item.ticker_sentiment)
          ? (item.ticker_sentiment as Record<string, unknown>[])
          : [];
        const match = tickerSentiments.find((t) => t.ticker === symbol);
        const label = match?.ticker_sentiment_label ?? item.overall_sentiment_label;
        const rawScore = match?.ticker_sentiment_score ?? item.overall_sentiment_score;
        const score = typeof rawScore === 'string' ? parseFloat(rawScore) : Number(rawScore);

        return {
          title: typeof item.title === 'string' ? item.title : 'Untitled',
          source: typeof item.source === 'string' ? item.source : 'Unknown source',
          url: typeof item.url === 'string' ? item.url : '#',
          publishedAt: parseTimestamp(item.time_published as string | undefined),
          sentiment: coerceSentiment(label),
          sentimentScore: Number.isFinite(score) ? score : 0,
        };
      })
      // Don't trust the provider's ordering — always show newest first.
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 6);

    if (!articles.length) return null;

    const averageSentiment = articles.reduce((s, a) => s + a.sentimentScore, 0) / articles.length;

    return {
      ticker: symbol,
      articles,
      averageSentiment,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
