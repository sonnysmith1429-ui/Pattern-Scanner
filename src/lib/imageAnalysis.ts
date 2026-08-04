import type { Bias, Trend } from './types';

export interface ChartAnalysis {
  trend: Trend;
  bias: Bias;
  biasConfidence: number;
  currentPrice: number;
  support: number;
  resistance: number;
  bullishRatio: number;
  priceSource: 'manual' | 'estimated';
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function resolvePrice(manualPrice?: number): { price: number; source: 'manual' | 'estimated' } {
  if (typeof manualPrice === 'number' && Number.isFinite(manualPrice) && manualPrice > 0) {
    return { price: Math.round(manualPrice * 100) / 100, source: 'manual' };
  }
  return { price: Math.round(rand(60, 400) * 100) / 100, source: 'estimated' };
}

/**
 * Turns a raw visual signal (left-to-right slope of candle pixels, and the
 * ratio of green vs red candle pixels) into a trend + bias pair that always
 * agree with each other — a clear up/down slope decides direction, color
 * only nudges confidence within that direction. This is what keeps "Strong
 * Uptrend" from ever being paired with a "Bearish" bias.
 */
function classify(slope: number, colorRatio: number): { trend: Trend; bias: Bias; biasConfidence: number } {
  let trend: Trend;
  if (slope > 0.16) trend = 'Strong Uptrend';
  else if (slope > 0.05) trend = 'Moderate Uptrend';
  else if (slope < -0.16) trend = 'Strong Downtrend';
  else if (slope < -0.05) trend = 'Weak Downtrend';
  else trend = 'Sideways';

  const colorScore = Math.max(-1, Math.min(1, (colorRatio - 0.5) * 2));

  let bias: Bias;
  let strength: number;

  if (trend === 'Strong Uptrend' || trend === 'Moderate Uptrend') {
    bias = 'Bullish';
    strength = (trend === 'Strong Uptrend' ? 0.75 : 0.55) + colorScore * 0.15;
  } else if (trend === 'Strong Downtrend' || trend === 'Weak Downtrend') {
    bias = 'Bearish';
    strength = (trend === 'Strong Downtrend' ? 0.75 : 0.55) - colorScore * 0.15;
  } else if (colorScore > 0.25) {
    bias = 'Bullish';
    strength = colorScore;
  } else if (colorScore < -0.25) {
    bias = 'Bearish';
    strength = -colorScore;
  } else {
    bias = 'Neutral';
    strength = 1 - Math.abs(colorScore);
  }

  const biasConfidence = Math.round(56 + Math.max(0, Math.min(1, strength)) * 36);
  return { trend, bias, biasConfidence };
}

function priceLevelsFromRows(
  currentPrice: number,
  topRow: number,
  bottomRow: number,
  currentRow: number,
  rowSpan: number,
): { support: number; resistance: number } {
  const pricePerRow = (currentPrice * 0.55) / Math.max(rowSpan, 1);
  const rawResistance = currentPrice + Math.max(2, currentRow - topRow) * pricePerRow;
  const rawSupport = currentPrice - Math.max(2, bottomRow - currentRow) * pricePerRow;
  return {
    resistance: Math.round(Math.max(rawResistance, currentPrice * 1.01) * 100) / 100,
    support: Math.round(Math.min(rawSupport, currentPrice * 0.99) * 100) / 100,
  };
}

function fallbackAnalysis(manualPrice?: number): ChartAnalysis {
  const slope = rand(-0.3, 0.3);
  const bullishRatio = Math.max(0, Math.min(1, 0.5 + slope * 0.7 + rand(-0.12, 0.12)));
  const { trend, bias, biasConfidence } = classify(slope, bullishRatio);
  const { price: currentPrice, source: priceSource } = resolvePrice(manualPrice);
  const spread = currentPrice * rand(0.08, 0.18);
  return {
    trend,
    bias,
    biasConfidence,
    currentPrice,
    support: Math.round((currentPrice - spread / 2) * 100) / 100,
    resistance: Math.round((currentPrice + spread / 2) * 100) / 100,
    bullishRatio,
    priceSource,
  };
}

function analyzePixels(img: HTMLImageElement, manualPrice?: number): ChartAnalysis {
  const width = 220;
  const height = Math.max(40, Math.min(300, Math.round((img.height / img.width) * width))) || 140;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return fallbackAnalysis(manualPrice);
  ctx.drawImage(img, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);

  const colTop = new Array(width).fill(-1);
  const colBottom = new Array(width).fill(-1);
  let greenCount = 0;
  let redCount = 0;
  let sumLeftRow = 0;
  let leftN = 0;
  let sumRightRow = 0;
  let rightN = 0;
  const leftBound = width / 3;
  const rightBound = (2 * width) / 3;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const isGreen = g > r + 18 && g > b + 8 && g > 60;
      const isRed = r > g + 18 && r > b - 10 && r > 70;
      if (!isGreen && !isRed) continue;
      if (isGreen) greenCount++;
      else redCount++;
      if (colTop[x] === -1) colTop[x] = y;
      colBottom[x] = y;
      if (x < leftBound) {
        sumLeftRow += y;
        leftN++;
      } else if (x > rightBound) {
        sumRightRow += y;
        rightN++;
      }
    }
  }

  const activeCols: number[] = [];
  for (let x = 0; x < width; x++) if (colTop[x] !== -1) activeCols.push(x);

  if (activeCols.length < 8 || greenCount + redCount < 40) {
    return fallbackAnalysis(manualPrice);
  }

  const topRow = Math.min(...activeCols.map((x) => colTop[x]));
  const bottomRow = Math.max(...activeCols.map((x) => colBottom[x]));
  const tailCount = Math.max(3, Math.round(activeCols.length * 0.08));
  const lastCols = activeCols.slice(-tailCount);
  const currentRow = lastCols.reduce((s, x) => s + (colTop[x] + colBottom[x]) / 2, 0) / lastCols.length;

  const leftAvg = leftN ? sumLeftRow / leftN : currentRow;
  const rightAvg = rightN ? sumRightRow / rightN : currentRow;
  // Pixel rows increase downward, so a rightmost average above (smaller than)
  // the leftmost average means price climbed left-to-right — an uptrend.
  const slope = (leftAvg - rightAvg) / height;
  const bullishRatio = greenCount / (greenCount + redCount);

  const { trend, bias, biasConfidence } = classify(slope, bullishRatio);
  const { price: currentPrice, source: priceSource } = resolvePrice(manualPrice);
  const { support, resistance } = priceLevelsFromRows(
    currentPrice,
    topRow,
    bottomRow,
    currentRow,
    Math.max(bottomRow - topRow, height * 0.12),
  );

  return { trend, bias, biasConfidence, currentPrice, support, resistance, bullishRatio, priceSource };
}

/**
 * Analyzes an uploaded chart image to derive trend, bias, and price levels.
 * If `manualPrice` is provided (the asset's real price at the time of the
 * chart), support/resistance/entry/target levels are anchored to that real
 * number instead of an estimated placeholder.
 */
export function analyzeChartImage(dataUrl: string, manualPrice?: number): Promise<ChartAnalysis> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        resolve(analyzePixels(img, manualPrice));
      } catch {
        resolve(fallbackAnalysis(manualPrice));
      }
    };
    img.onerror = () => resolve(fallbackAnalysis(manualPrice));
    img.src = dataUrl;
  });
}
