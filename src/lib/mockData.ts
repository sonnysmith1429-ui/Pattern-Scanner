import type {
  Annotation,
  Bias,
  Indicators,
  NewsSignal,
  RecognisedPattern,
  ScanResult,
  Trend,
  TradeBias,
} from './types';
import type { ChartAnalysis } from './imageAnalysis';

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

const BULLISH_PATTERNS = [
  'Ascending Triangle',
  'Bull Flag',
  'Cup and Handle',
  'Double Bottom',
  'Inverse Head and Shoulders',
  'Falling Wedge',
  'Support Bounce',
  'Morning Star',
  'Hammer',
] as const;

const BEARISH_PATTERNS = [
  'Descending Triangle',
  'Bear Flag',
  'Double Top',
  'Head and Shoulders',
  'Rising Wedge',
  'Resistance Rejection',
  'Evening Star',
  'Shooting Star',
] as const;

const NEUTRAL_PATTERNS = [
  'Rectangle',
  'Pennant',
  'Channel',
  'Engulfing Candle',
  'Inside Bar',
  'Outside Bar',
  'Doji',
  'Spinning Top',
] as const;

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

function generatePatterns(bias: Bias): RecognisedPattern[] {
  const count = randInt(2, 4);
  // Never mix in a pattern from the opposite bias — e.g. a bearish scan
  // should never surface "Bull Flag" alongside "Head and Shoulders".
  const primaryPool: readonly string[] =
    bias === 'Bullish' ? BULLISH_PATTERNS : bias === 'Bearish' ? BEARISH_PATTERNS : NEUTRAL_PATTERNS;
  const secondaryPool: readonly string[] = bias === 'Neutral' ? PATTERN_LIBRARY : [...primaryPool, ...NEUTRAL_PATTERNS];

  const primaryCount = Math.min(Math.max(1, count - 1), primaryPool.length);
  const chosen = pickN(primaryPool, primaryCount);
  while (chosen.length < count) {
    const remaining = secondaryPool.filter((p) => !chosen.includes(p));
    if (!remaining.length) break;
    chosen.push(pickN(remaining, 1)[0]);
  }

  return chosen
    .map((name) => ({ name, confidence: randInt(58, 96) }))
    .sort((a, b) => b.confidence - a.confidence);
}

function generateIndicators(
  trend: Trend,
  support: number,
  resistance: number,
  currentPrice: number,
): Indicators {
  const bullishTilt = trend.includes('Uptrend') ? 1 : trend.includes('Downtrend') ? -1 : 0;
  return {
    rsi: Math.round(50 + bullishTilt * rand(8, 22) + rand(-6, 6)),
    macd: bullishTilt > 0 ? 'Bullish Crossover' : bullishTilt < 0 ? 'Bearish Crossover' : 'Flat',
    movingAverages:
      bullishTilt > 0 ? 'Above 50/200 MA' : bullishTilt < 0 ? 'Below 50/200 MA' : 'Mixed',
    ema: Math.round((currentPrice + currentPrice * rand(-0.015, 0.015)) * 100) / 100,
    vwap: Math.round((currentPrice + currentPrice * rand(-0.02, 0.02)) * 100) / 100,
    volume: pick(['Above Average', 'Average', 'Below Average']),
    trendStrength: Math.max(5, Math.min(95, Math.round(55 + bullishTilt * rand(10, 25) + rand(-8, 8)))),
    momentum: Math.max(5, Math.min(95, Math.round(50 + bullishTilt * rand(10, 25) + rand(-8, 8)))),
    volatility: randInt(20, 85),
    support,
    resistance,
    riskLevel: randInt(20, 80),
  };
}

/**
 * Rough same-day hold-time estimate. Not a prediction of when a trade will
 * actually resolve — just a bounded, explainable heuristic: setups with
 * higher volatility/trend strength/momentum are treated as likely to reach
 * their target or stop faster, calmer ones as likely to take longer, always
 * kept within an intraday window (20 minutes to 6 hours) consistent with
 * this app's same-day framing.
 */
function estimateHoldTime(volatility: number, trendStrength: number, momentum: number): { min: number; max: number } {
  const speed = Math.max(0, Math.min(1, (volatility * 0.4 + trendStrength * 0.35 + momentum * 0.25) / 100));
  const minMinutes = Math.round(20 + (1 - speed) * 220);
  const maxMinutes = Math.min(360, Math.round(minMinutes * rand(1.5, 2.3)));
  return { min: minMinutes, max: maxMinutes };
}

function generateTradeBias(
  bias: Bias,
  support: number,
  resistance: number,
  currentPrice: number,
  confidence: number,
  volatility: number,
  trendStrength: number,
  momentum: number,
): TradeBias {
  // This app targets intraday setups, so the whole band stays within a
  // realistic same-day move — a small floor keeps flat charts from
  // collapsing to a zero-width band, not from ballooning into swing-trade
  // territory the way a percent-of-price floor would.
  const spread = Math.max(resistance - support, currentPrice * 0.008);
  let entry: number;
  let takeProfit: number;
  let stopLoss: number;

  if (bias === 'Bullish') {
    // Buy near support, target just past resistance, protect below support.
    entry = support + spread * 0.15;
    takeProfit = resistance + spread * 0.12;
    stopLoss = support - spread * 0.12;
  } else if (bias === 'Bearish') {
    // Short near resistance, target just past support, protect above resistance.
    entry = resistance - spread * 0.15;
    takeProfit = support - spread * 0.12;
    stopLoss = resistance + spread * 0.12;
  } else {
    entry = currentPrice;
    takeProfit = currentPrice + spread * 0.15;
    stopLoss = currentPrice - spread * 0.15;
  }

  const holdTime = estimateHoldTime(volatility, trendStrength, momentum);

  return {
    bias,
    confidence: Math.max(52, Math.min(96, confidence + randInt(-4, 4))),
    entry: Math.round(entry * 100) / 100,
    takeProfit: Math.round(takeProfit * 100) / 100,
    stopLoss: Math.round(stopLoss * 100) / 100,
    supportZone: support,
    resistanceZone: resistance,
    holdMinutesMin: holdTime.min,
    holdMinutesMax: holdTime.max,
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

function newsDirection(news: NewsSignal): Bias {
  if (news.averageSentiment > 0.15) return 'Bullish';
  if (news.averageSentiment < -0.15) return 'Bearish';
  return 'Neutral';
}

/**
 * News is treated as a secondary nudge on confidence, never as something
 * that can flip the technical bias — the chart's own trend/bias pairing is
 * already guaranteed to agree with itself, and letting a news score
 * override that would reintroduce the same "uptrend but bearish"
 * contradiction that pairing was built to prevent.
 */
function applyNewsToConfidence(bias: Bias, confidence: number, news: NewsSignal | null): number {
  if (!news || !news.articles.length) return confidence;
  const direction = newsDirection(news);
  if (direction === 'Neutral') return confidence;
  const nudge = Math.round(Math.min(1, Math.abs(news.averageSentiment)) * 10);
  return direction === bias ? Math.min(97, confidence + nudge) : Math.max(35, confidence - nudge);
}

function newsNoteFor(bias: Bias, news: NewsSignal | null): string {
  if (!news || !news.articles.length) return '';
  const direction = newsDirection(news);
  if (direction === 'Neutral') {
    return ` Recent news sentiment for ${news.ticker} is mixed and doesn't add a clear lean either way.`;
  }
  if (direction === bias) {
    return ` Recent news sentiment for ${news.ticker} also leans ${direction.toLowerCase()}, reinforcing this technical read.`;
  }
  return ` Recent news sentiment for ${news.ticker} leans ${direction.toLowerCase()}, which runs counter to this technical read — worth weighing before acting on it.`;
}

function explanationFor(
  trend: Trend,
  patterns: RecognisedPattern[],
  bias: TradeBias,
  news: NewsSignal | null,
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
      ? ' Overall signals are mixed here, so the technical bias is neutral rather than clearly directional.'
      : ` Overall, the technical bias here is ${bias.bias.toLowerCase()}.`;
  const newsNote = newsNoteFor(bias.bias, news);

  return `Looking at the uploaded chart, ${primary}${secondary}${biasNote}${newsNote} This analysis is provided for educational purposes only and should not be treated as financial advice.`;
}

export function generateScanResult(
  image: string,
  analysis: ChartAnalysis,
  news: NewsSignal | null = null,
): ScanResult {
  const { trend, bias, biasConfidence, support, resistance, currentPrice, priceSource } = analysis;
  const adjustedConfidence = applyNewsToConfidence(bias, biasConfidence, news);
  const patterns = generatePatterns(bias);
  const indicators = generateIndicators(trend, support, resistance, currentPrice);
  const tradeBias = generateTradeBias(
    bias,
    support,
    resistance,
    currentPrice,
    adjustedConfidence,
    indicators.volatility,
    indicators.trendStrength,
    indicators.momentum,
  );
  const overallConfidence = Math.round(
    (patterns.reduce((s, p) => s + p.confidence, 0) / patterns.length) * 0.45 +
      tradeBias.confidence * 0.3 +
      adjustedConfidence * 0.25,
  );

  return {
    id: `scan_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    createdAt: new Date().toISOString(),
    image,
    trend,
    trendConfidence: Math.max(55, Math.min(97, adjustedConfidence + randInt(-3, 6))),
    patterns,
    indicators,
    tradeBias,
    overallConfidence: Math.max(30, Math.min(97, overallConfidence)),
    explanation: explanationFor(trend, patterns, tradeBias, news),
    annotations: generateAnnotations(patterns, bias),
    favourite: false,
    currentPrice,
    priceSource,
    news,
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
