// Vercel serverless function: proxies the Alpha Vantage news-sentiment
// request server-side. Browsers calling alphavantage.co directly may be
// blocked by CORS; a server-to-server call has no such restriction, and
// routing through this same-origin endpoint avoids that entirely.
export default async function handler(req, res) {
  const { ticker, apiKey } = req.query;

  if (typeof ticker !== 'string' || typeof apiKey !== 'string' || !ticker.trim() || !apiKey.trim()) {
    res.status(400).json({ error: 'Missing ticker or apiKey' });
    return;
  }

  try {
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${encodeURIComponent(
      ticker.trim().toUpperCase(),
    )}&limit=8&apikey=${encodeURIComponent(apiKey.trim())}`;

    const upstream = await fetch(url);
    const data = await upstream.json();

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json(data);
  } catch {
    res.status(502).json({ error: 'Failed to reach news provider' });
  }
}
