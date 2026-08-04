export function withMinDuration<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.all([promise, new Promise((r) => setTimeout(r, ms))]).then(([result]) => result);
}

export function formatPrice(price: number): string {
  return `£${price.toFixed(1)}m`;
}

export function formatSigned(value: number, decimals = 1): string {
  const rounded = value.toFixed(decimals);
  return value > 0 ? `+${rounded}` : rounded;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function clampPct(value: number): number {
  return Math.max(0, Math.min(100, value));
}
