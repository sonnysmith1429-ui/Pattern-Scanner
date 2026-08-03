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
  return safeParse<ScanResult[]>(localStorage.getItem(KEYS.history), []);
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
};

export function loadSettings(): AppSettings {
  return safeParse<AppSettings>(localStorage.getItem(KEYS.settings), DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}
