export type Trend =
  | 'Strong Uptrend'
  | 'Moderate Uptrend'
  | 'Sideways'
  | 'Weak Downtrend'
  | 'Strong Downtrend';

export type Bias = 'Bullish' | 'Bearish' | 'Neutral';

export interface RecognisedPattern {
  name: string;
  confidence: number;
}

export interface Indicators {
  rsi: number;
  macd: 'Bullish Crossover' | 'Bearish Crossover' | 'Flat';
  movingAverages: 'Above 50/200 MA' | 'Below 50/200 MA' | 'Mixed';
  ema: number;
  vwap: number;
  volume: 'Above Average' | 'Average' | 'Below Average';
  trendStrength: number;
  momentum: number;
  volatility: number;
  support: number;
  resistance: number;
  riskLevel: number;
}

export interface TradeBias {
  bias: Bias;
  confidence: number;
  entry: number;
  takeProfit: number;
  stopLoss: number;
  supportZone: number;
  resistanceZone: number;
}

export interface Annotation {
  type: 'trendline' | 'support' | 'resistance' | 'pattern' | 'breakout' | 'arrow' | 'highlight';
  label: string;
  points: { x: number; y: number }[];
}

export interface ScanResult {
  id: string;
  createdAt: string;
  image: string;
  trend: Trend;
  trendConfidence: number;
  patterns: RecognisedPattern[];
  indicators: Indicators;
  tradeBias: TradeBias;
  overallConfidence: number;
  explanation: string;
  annotations: Annotation[];
  favourite: boolean;
}

export interface WatchlistItem {
  id: string;
  asset: string;
  notes: string;
  lastScanDate: string | null;
  observations: string;
}

export interface AppSettings {
  scanMode: 'fast' | 'accuracy';
  theme: 'dark' | 'light';
  notifications: boolean;
}
