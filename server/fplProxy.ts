/**
 * Server-side proxy to the official FPL API. Exists so the browser never
 * calls fantasy.premierleague.com directly (it has no CORS headers for
 * browser requests), and so we have one place to add caching/retries if the
 * upstream API changes shape.
 */
const FPL_BASE_URL = 'https://fantasy.premierleague.com/api';

export interface ProxyResult {
  status: number;
  json: unknown;
}

export async function fetchFplPath(pathAndQuery: string): Promise<ProxyResult> {
  const clean = pathAndQuery.replace(/^\/+/, '').replace(/\/+$/, '');
  const url = `${FPL_BASE_URL}/${clean}/`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'FPL-Analyst-AI-Prototype/1.0' },
    });
    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { error: 'Upstream returned non-JSON response' };
    }
    return { status: res.status, json };
  } finally {
    clearTimeout(timeout);
  }
}
