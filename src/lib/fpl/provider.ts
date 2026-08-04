/**
 * FPLDataProvider — the single abstraction the rest of the app talks to.
 *
 *   Official FPL API (via same-origin /api/fpl proxy, server-side to dodge CORS)
 *     -> normalise.ts
 *     -> FplDataset
 *     -> analytics engine / UI
 *
 * If the live endpoints are unreachable, this falls back to the deterministic
 * mock dataset (lib/fpl/mockData.ts) so the app never breaks — the returned
 * `freshness.source` tells the UI whether to show a DEMO/CACHED badge.
 */
import type { FplDataset, PlayerGameweekHistory, Fixture } from '../../types';
import { normaliseBootstrap, normaliseFixture, normaliseElementSummary } from './normalise';
import type { RawBootstrap, RawFixture, RawElementSummary, RawManagerPicksResponse } from './rawTypes';
import { getMockBundle } from './mockData';

const CACHE_KEY = 'fpl_analyst_dataset_cache_v1';
const CACHE_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10000;

interface CacheEnvelope {
  dataset: FplDataset;
  cachedAt: number;
}

let memoryCache: CacheEnvelope | null = null;

function readLocalCache(): CacheEnvelope | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEnvelope;
  } catch {
    return null;
  }
}

function writeLocalCache(env: CacheEnvelope) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(env));
  } catch {
    // storage full/unavailable — non-fatal, in-memory cache still works
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`${url} responded ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchLiveDataset(): Promise<FplDataset> {
  const [bootstrap, fixturesRaw] = await Promise.all([
    fetchJson<RawBootstrap>('/api/fpl/bootstrap-static'),
    fetchJson<RawFixture[]>('/api/fpl/fixtures'),
  ]);
  const { players, teams, events } = normaliseBootstrap(bootstrap);
  const fixtures: Fixture[] = fixturesRaw.map(normaliseFixture);
  return {
    players,
    teams,
    events,
    fixtures,
    freshness: { source: 'live', fetchedAt: new Date().toISOString() },
  };
}

export async function getDataset(opts: { forceRefresh?: boolean } = {}): Promise<FplDataset> {
  const now = Date.now();

  if (!opts.forceRefresh) {
    if (memoryCache && now - memoryCache.cachedAt < CACHE_TTL_MS) {
      return memoryCache.dataset;
    }
    const local = readLocalCache();
    if (local && now - local.cachedAt < CACHE_TTL_MS) {
      memoryCache = local;
      return local.dataset;
    }
  }

  try {
    const dataset = await fetchLiveDataset();
    const env = { dataset, cachedAt: now };
    memoryCache = env;
    writeLocalCache(env);
    return dataset;
  } catch (err) {
    const stale = memoryCache ?? readLocalCache();
    if (stale) {
      return {
        ...stale.dataset,
        freshness: {
          source: 'cache',
          fetchedAt: stale.dataset.freshness.fetchedAt,
          note: `Live refresh failed (${(err as Error).message}); showing last cached data`,
        },
      };
    }
    const mock = getMockBundle().dataset;
    return {
      ...mock,
      freshness: {
        source: 'mock',
        fetchedAt: new Date().toISOString(),
        note: `Live FPL API unavailable (${(err as Error).message}); showing demo data`,
      },
    };
  }
}

export async function getElementHistory(
  playerId: number,
): Promise<{ history: PlayerGameweekHistory[]; source: 'live' | 'mock' }> {
  try {
    const raw = await fetchJson<RawElementSummary>(`/api/fpl/element-summary/${playerId}`);
    const { history } = normaliseElementSummary(raw);
    return { history, source: 'live' };
  } catch {
    const mock = getMockBundle().playerHistory.get(playerId) ?? [];
    return { history: mock, source: 'mock' };
  }
}

export interface ManagerPicksResult {
  picks: { playerId: number; isStarter: boolean; isCaptain: boolean; isViceCaptain: boolean; benchOrder: number | null }[];
  bank: number;
}

export async function getManagerPicks(managerId: number, gameweek: number): Promise<ManagerPicksResult> {
  const raw = await fetchJson<RawManagerPicksResponse>(`/api/fpl/entry/${managerId}/event/${gameweek}/picks`);
  return {
    picks: raw.picks.map((p) => ({
      playerId: p.element,
      isStarter: p.position <= 11,
      isCaptain: p.is_captain,
      isViceCaptain: p.is_vice_captain,
      benchOrder: p.position > 11 ? p.position - 11 : null,
    })),
    bank: raw.entry_history.bank / 10,
  };
}

export function clearDatasetCache() {
  memoryCache = null;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}
