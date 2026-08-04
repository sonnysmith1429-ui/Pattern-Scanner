import type { AppSettings, SavedAnalysis, UserContext } from '../types';

const KEYS = {
  history: 'fpl_analyst_history_v1',
  settings: 'fpl_analyst_settings_v1',
  context: 'fpl_analyst_context_v1',
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadHistory(): SavedAnalysis[] {
  return safeParse<SavedAnalysis[]>(localStorage.getItem(KEYS.history), []);
}

export function saveHistory(history: SavedAnalysis[]) {
  try {
    localStorage.setItem(KEYS.history, JSON.stringify(history));
  } catch {
    // storage full — non-fatal, history just won't persist across reloads
  }
}

export const DEFAULT_SETTINGS: AppSettings = { theme: 'dark' };

export function loadSettings(): AppSettings {
  return safeParse<AppSettings>(localStorage.getItem(KEYS.settings), DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export const DEFAULT_CONTEXT: UserContext = { bank: null, freeTransfers: null, wildcardActive: false };

export function loadContext(): UserContext {
  return safeParse<UserContext>(localStorage.getItem(KEYS.context), DEFAULT_CONTEXT);
}

export function saveContext(context: UserContext) {
  localStorage.setItem(KEYS.context, JSON.stringify(context));
}
