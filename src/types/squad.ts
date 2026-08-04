/** The user's squad, however it was obtained (OCR extraction or demo data). */
export interface SquadPick {
  playerId: number;
  isStarter: boolean;
  isCaptain: boolean;
  isViceCaptain: boolean;
  benchOrder: number | null;
}

export interface UserContext {
  bank: number | null;
  freeTransfers: number | null;
  wildcardActive: boolean;
}

export interface Squad {
  picks: SquadPick[];
  context: UserContext;
}

/** One detected slot from the uploaded screenshot, before/during confirmation. */
export interface DetectedPick {
  slotId: string;
  rawText: string;
  isStarter: boolean;
  isBench: boolean;
  isCaptain: boolean;
  isViceCaptain: boolean;
  matchedPlayerId: number | null;
  matchConfidence: number;
  alternatives: { playerId: number; score: number }[];
}

export interface DetectedSquad {
  picks: DetectedPick[];
  overallConfidence: number;
  playersFound: number;
  playersExpected: number;
  source: 'ocr' | 'demo' | 'manager-id';
}

export interface AppSettings {
  theme: 'dark' | 'light';
}

