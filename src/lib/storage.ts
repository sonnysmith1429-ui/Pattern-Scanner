import type { AppSettings, ScanResult, WatchlistItem } from './types';

const KEYS = {
  history: 'ps_history',
  watchlist: 'ps_watchlist',
  settings: 'ps_settings',
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadHistory(): ScanResult[] {
  const raw = safeParse<Partial<ScanResult>[]>(localStorage.getItem(KEYS.history), []);
  // Scans saved by an earlier version of the app (before currentPrice/
  // priceSource/news existed) won't have those fields — normalize so
  // opening an old scan doesn't crash the dashboard.
  return raw.map((r) => ({
    ...r,
    currentPrice: r.currentPrice ?? 0,
    priceSource: r.priceSource ?? 'estimated',
    news: r.news ?? null,
  })) as ScanResult[];
}

export function saveHistory(history: ScanResult[]) {
  localStorage.setItem(KEYS.history, JSON.stringify(history));
}

export function loadWatchlist(): WatchlistItem[] {
  return safeParse<WatchlistItem[]>(localStorage.getItem(KEYS.watchlist), []);
}

export function saveWatchlist(items: WatchlistItem[]) {
  localStorage.setItem(KEYS.watchlist, JSON.stringify(items));
}

export const DEFAULT_SETTINGS: AppSettings = {
  scanMode: 'accuracy',
  theme: 'dark',
  notifications: true,
  newsApiKey: '',
};

export function loadSettings(): AppSettings {
  // Merge with defaults so settings saved before a new field was added
  // (e.g. newsApiKey) don't come back as undefined.
  return { ...DEFAULT_SETTINGS, ...safeParse<Partial<AppSettings>>(localStorage.getItem(KEYS.settings), {}) };
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}
