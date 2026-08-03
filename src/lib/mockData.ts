import type {
  Annotation,
  Bias,
  Indicators,
  RecognisedPattern,
  ScanResult,
  Trend,
  TradeBias,
} from './types';

export const PATTERN_LIBRARY = [
  'Ascending Triangle',
  'Descending Triangle',
  'Bull Flag',
  'Bear Flag',
  'Cup and Handle',
  'Double Top',
  'Double Bottom',
  'Head and Shoulders',
  'Inverse Head and Shoulders',
  'Falling Wedge',
  'Rising Wedge',
  'Rectangle',
  'Pennant',
  'Channel',
  'Support Bounce',
  'Resistance Rejection',
  'Engulfing Candle',
  'Hammer',
  'Shooting Star',
  'Morning Star',
  'Evening Star',
  'Inside Bar',
  'Outside Bar',
  'Doji',
  'Spinning Top',
] as const;

const TRENDS: Trend[] = [
  'Strong Uptrend',
  'Moderate Uptrend',
  'Sideways',
  'Weak Downtrend',
  'Strong Downtrend',
];

const BULLISH_PATTERNS = new Set([
  'Ascending Triangle',
  'Bull Flag',
  'Cup and Handle',
  'Double Bottom',
  'Inverse Head and Shoulders',
  'Falling Wedge',
  'Support Bounce',
  'Morning Star',
  'Hammer',
]);

const BEARISH_PATTERNS = new Set([
  'Descending Triangle',
  'Bear Flag',
  'Double Top',
  'Head and Shoulders',
  'Rising Wedge',
  'Resistance Rejection',
  'Evening Star',
  'Shooting Star',
]);

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.round(rand(min, max));
}

function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(randInt(0, copy.length - 1), 1)[0]);
  }
  return out;
}

function generatePatterns(): RecognisedPattern[] {
  const count = randInt(2, 4);
  return pickN(PATTERN_LIBRARY, count)
    .map((name) => ({ name, confidence: randInt(58, 96) }))
    .sort((a, b) => b.confidence - a.confidence);
}

function generateIndicators(trend: Trend): Indicators {
  const bullishTilt = trend.includes('Uptrend') ? 1 : trend.includes('Downtrend') ? -1 : 0;
  return {
    rsi: Math.round(50 + bullishTilt * rand(8, 22) + rand(-6, 6)),
    macd: bullishTilt > 0 ? 'Bullish Crossover' : bullishTilt < 0 ? 'Bearish Crossover' : 'Flat',
    movingAverages:
      bullishTilt > 0 ? 'Above 50/200 MA' : bullishTilt < 0 ? 'Below 50/200 MA' : 'Mixed',
    ema: Math.round(rand(100, 400) * 100) / 100,
    vwap: Math.round(rand(100, 400) * 100) / 100,
    volume: pick(['Above Average', 'Average', 'Below Average']),
    trendStrength: Math.max(5, Math.min(95, Math.round(55 + bullishTilt * rand(10, 25) + rand(-8, 8)))),
    momentum: Math.max(5, Math.min(95, Math.round(50 + bullishTilt * rand(10, 25) + rand(-8, 8)))),
    volatility: randInt(20, 85),
    support: Math.round(rand(80, 380) * 100) / 100,
    resistance: Math.round(rand(120, 420) * 100) / 100,
    riskLevel: randInt(20, 80),
  };
}

function biasFromPatterns(patterns: RecognisedPattern[], trend: Trend): Bias {
  let score = 0;
  for (const p of patterns) {
    if (BULLISH_PATTERNS.has(p.name)) score += p.confidence;
    if (BEARISH_PATTERNS.has(p.name)) score -= p.confidence;
  }
  if (trend.includes('Uptrend')) score += 30;
  if (trend.includes('Downtrend')) score -= 30;
  if (score > 20) return 'Bullish';
  if (score < -20) return 'Bearish';
  return 'Neutral';
}

function generateTradeBias(bias: Bias, indicators: Indicators): TradeBias {
  const base = (indicators.support + indicators.resistance) / 2;
  const spread = Math.abs(indicators.resistance - indicators.support) || 20;
  let entry = base;
  let takeProfit = base;
  let stopLoss = base;

  if (bias === 'Bullish') {
    entry = indicators.support + spread * 0.15;
    takeProfit = indicators.resistance + spread * 0.35;
    stopLoss = indicators.support - spread * 0.2;
  } else if (bias === 'Bearish') {
    entry = indicators.resistance - spread * 0.15;
    takeProfit = indicators.support - spread * 0.35;
    stopLoss = indicators.resistance + spread * 0.2;
  } else {
    entry = base;
    takeProfit = base + spread * 0.25;
    stopLoss = base - spread * 0.25;
  }

  return {
    bias,
    confidence: randInt(55, 92),
    entry: Math.round(entry * 100) / 100,
    takeProfit: Math.round(takeProfit * 100) / 100,
    stopLoss: Math.round(stopLoss * 100) / 100,
    supportZone: indicators.support,
    resistanceZone: indicators.resistance,
  };
}

function generateAnnotations(patterns: RecognisedPattern[], bias: Bias): Annotation[] {
  const top = patterns[0]?.name ?? 'Channel';
  const rising = bias === 'Bullish';

  const annotations: Annotation[] = [
    {
      type: 'trendline',
      label: rising ? 'Ascending trendline' : 'Descending trendline',
      points: rising
        ? [{ x: 6, y: 78 }, { x: 92, y: 32 }]
        : [{ x: 6, y: 28 }, { x: 92, y: 74 }],
    },
    {
      type: 'support',
      label: 'Support level',
      points: [{ x: 4, y: 82 }, { x: 96, y: 82 }],
    },
    {
      type: 'resistance',
      label: 'Resistance level',
      points: [{ x: 4, y: 22 }, { x: 96, y: 22 }],
    },
    {
      type: 'pattern',
      label: top,
      points: [
        { x: 22, y: 55 },
        { x: 40, y: 40 },
        { x: 58, y: 50 },
        { x: 76, y: 34 },
      ],
    },
    {
      type: 'breakout',
      label: 'Potential breakout zone',
      points: [{ x: 68, y: 18 }, { x: 94, y: 18 }, { x: 94, y: 30 }, { x: 68, y: 30 }],
    },
    {
      type: 'highlight',
      label: 'Key reversal candle',
      points: [{ x: 46, y: 47 }],
    },
    {
      type: 'arrow',
      label: rising ? 'Projected direction' : 'Projected direction',
      points: rising ? [{ x: 80, y: 40 }, { x: 92, y: 20 }] : [{ x: 80, y: 40 }, { x: 92, y: 66 }],
    },
  ];

  return annotations;
}

function article(word: string): string {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

function explanationFor(
  trend: Trend,
  patterns: RecognisedPattern[],
  bias: TradeBias,
): string {
  const top = patterns[0];
  const second = patterns[1];
  const trendPhrase = trend.toLowerCase();

  const templates: Record<string, string> = {
    'Ascending Triangle': `it appears to display characteristics of an ascending triangle after a ${trendPhrase}. Price is repeatedly testing a horizontal resistance level while higher lows suggest increasing buying pressure. Historically, this type of formation has often preceded breakout attempts, although outcomes vary and confirmation is important.`,
    'Descending Triangle': `it appears to show a descending triangle within a ${trendPhrase}. Lower highs are compressing against a horizontal support floor, which technically can indicate building selling pressure. A decisive close beyond either boundary is typically watched for confirmation.`,
    'Bull Flag': `price action resembles a bull flag forming after a sharp advance during a ${trendPhrase}. The tight, downward-sloping consolidation is a pattern some traders associate with pauses before continuation, though continuation is never guaranteed.`,
    'Bear Flag': `the structure resembles a bear flag following a sharp decline within a ${trendPhrase}. The narrow upward drift is often viewed as a corrective pause rather than a reversal, but confirmation below the flag's support is typically required.`,
    'Cup and Handle': `a rounded "cup" recovery followed by a shallow "handle" consolidation is visible during this ${trendPhrase}. This structure is frequently studied as a base-building formation, though volume and breakout confirmation matter.`,
    'Double Top': `two comparable peaks separated by a moderate pullback suggest a potential double top forming after a ${trendPhrase}. This is commonly discussed as a possible exhaustion signal, though a break of the intervening low would typically be needed for confirmation.`,
    'Double Bottom': `two comparable troughs separated by a moderate rally suggest a potential double bottom within a ${trendPhrase}. This is often studied as a possible base formation, with the middle peak acting as a key confirmation level.`,
    'Head and Shoulders': `a three-peak structure with a higher middle peak is visible, consistent with a head and shoulders formation during a ${trendPhrase}. This is widely discussed as a possible topping pattern, contingent on a break of the neckline.`,
    'Inverse Head and Shoulders': `an inverse head and shoulders structure appears to be forming after a ${trendPhrase}, with a lower middle trough flanked by two higher troughs. This is often studied as a possible bottoming formation pending neckline confirmation.`,
    'Falling Wedge': `a falling wedge is visible, with converging trendlines sloping downward during a ${trendPhrase}. This contracting structure is sometimes associated with slowing downside momentum, though a clear break of the upper boundary is typically watched.`,
    'Rising Wedge': `a rising wedge appears within this ${trendPhrase}, where converging trendlines slope upward on decreasing momentum. This is sometimes studied as a caution signal, with a break of the lower boundary often watched for confirmation.`,
    Rectangle: `price appears to be consolidating in a rectangular range during this ${trendPhrase}, oscillating between a fairly consistent support and resistance band.`,
    Pennant: `a small symmetrical pennant has formed following a strong directional move within this ${trendPhrase}, a structure often studied as a brief pause in an existing trend.`,
    Channel: `price is moving within a well-defined channel during this ${trendPhrase}, respecting both the upper and lower boundaries repeatedly.`,
    'Support Bounce': `price recently tested a horizontal support level and reacted upward, within the context of a ${trendPhrase}.`,
    'Resistance Rejection': `price recently tested a horizontal resistance level and was rejected, within the context of a ${trendPhrase}.`,
    'Engulfing Candle': `a notable engulfing candle is visible, where the most recent candle's range fully covers the prior one, occurring during a ${trendPhrase}.`,
    Hammer: `a hammer-shaped candle with a long lower wick appears near recent lows during this ${trendPhrase}, a formation sometimes associated with buying interest at lower levels.`,
    'Shooting Star': `a shooting star candle with a long upper wick appears near recent highs during this ${trendPhrase}, a formation sometimes associated with selling interest at higher levels.`,
    'Morning Star': `a three-candle morning star sequence is visible, often studied as a potential bottoming signal within this ${trendPhrase}.`,
    'Evening Star': `a three-candle evening star sequence is visible, often studied as a potential topping signal within this ${trendPhrase}.`,
    'Inside Bar': `an inside bar has formed, with the latest candle's range contained fully within the prior candle, suggesting a temporary contraction in volatility during this ${trendPhrase}.`,
    'Outside Bar': `an outside bar has formed, with the latest candle's range exceeding the prior candle on both sides, suggesting an expansion in volatility during this ${trendPhrase}.`,
    Doji: `a doji candle is visible, with open and close prices nearly identical, often studied as a sign of indecision during this ${trendPhrase}.`,
    'Spinning Top': `a spinning top candle with a small body and long wicks on both sides suggests indecision during this ${trendPhrase}.`,
  };

  const primary = top ? templates[top.name] : `price structure suggests a ${trendPhrase} with mixed signals across recent candles.`;
  const secondary = second
    ? ` Secondary characteristics consistent with ${article(second.name)} ${second.name.toLowerCase()} were also noted, adding to the overall picture.`
    : '';
  const biasNote =
    bias.bias === 'Neutral'
      ? ' Overall signals are mixed, so this setup leans neutral rather than clearly directional.'
      : ` This combination of signals leans ${bias.bias.toLowerCase()} from a purely technical standpoint.`;

  return `Looking at the uploaded chart, ${primary}${secondary}${biasNote} This analysis is provided for educational purposes only and should not be treated as financial advice.`;
}

export function generateScanResult(image: string): ScanResult {
  const trend = pick(TRENDS);
  const patterns = generatePatterns();
  const indicators = generateIndicators(trend);
  const bias = biasFromPatterns(patterns, trend);
  const tradeBias = generateTradeBias(bias, indicators);
  const overallConfidence = Math.round(
    (patterns.reduce((s, p) => s + p.confidence, 0) / patterns.length) * 0.55 +
      tradeBias.confidence * 0.45,
  );

  return {
    id: `scan_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    createdAt: new Date().toISOString(),
    image,
    trend,
    trendConfidence: randInt(60, 95),
    patterns,
    indicators,
    tradeBias,
    overallConfidence: Math.max(30, Math.min(97, overallConfidence)),
    explanation: explanationFor(trend, patterns, tradeBias),
    annotations: generateAnnotations(patterns, bias),
    favourite: false,
  };
}

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

export function generateCandles(count: number, startPrice = 200): Candle[] {
  const candles: Candle[] = [];
  let price = startPrice;
  let trendBias = rand(-1, 1);
  for (let i = 0; i < count; i++) {
    if (i % 12 === 0) trendBias = rand(-1, 1);
    const open = price;
    const change = rand(-6, 6) + trendBias * 2.4;
    const close = Math.max(5, open + change);
    const high = Math.max(open, close) + rand(0.5, 4);
    const low = Math.min(open, close) - rand(0.5, 4);
    candles.push({ open, high, low, close });
    price = close;
  }
  return candles;
}

export function candlesToDataUrl(candles: Candle[], width = 900, height = 560): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, '#111219');
  bg.addColorStop(1, '#0b0b0f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let gy = 0; gy < height; gy += height / 8) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(width, gy);
    ctx.stroke();
  }

  const min = Math.min(...candles.map((c) => c.low));
  const max = Math.max(...candles.map((c) => c.high));
  const pad = (max - min) * 0.1 || 5;
  const scaleY = (v: number) =>
    height - 40 - ((v - (min - pad)) / (max - min + pad * 2)) * (height - 80);

  const slot = width / candles.length;
  const bodyWidth = Math.max(2, slot * 0.55);

  candles.forEach((c, i) => {
    const x = i * slot + slot / 2;
    const isUp = c.close >= c.open;
    ctx.strokeStyle = isUp ? '#10b981' : '#ef4444';
    ctx.fillStyle = isUp ? '#10b981' : '#ef4444';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(x, scaleY(c.high));
    ctx.lineTo(x, scaleY(c.low));
    ctx.stroke();

    const yOpen = scaleY(c.open);
    const yClose = scaleY(c.close);
    const top = Math.min(yOpen, yClose);
    const h = Math.max(2, Math.abs(yOpen - yClose));
    ctx.fillRect(x - bodyWidth / 2, top, bodyWidth, h);
  });

  return canvas.toDataURL('image/png');
}

export function demoChartImage(): string {
  return candlesToDataUrl(generateCandles(46));
}
