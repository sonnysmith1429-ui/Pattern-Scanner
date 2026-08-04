import type { AIAnalysisResponse, AIProviderName } from '../../types/index.ts';

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

/** Defensive parse — a malformed AI response must never crash the dashboard, it should fall back to the mock provider. */
export function validateAiResponse(raw: unknown, provider: AIProviderName): AIAnalysisResponse | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  if (!isString(r.summary) || !isString(r.overallVerdict)) return null;
  if (!Array.isArray(r.weaknesses) || !Array.isArray(r.recommendations) || !Array.isArray(r.dataLimitations)) {
    return null;
  }
  if (!isString(r.captainSuggestion) || !isString(r.benchSuggestion)) return null;

  const weaknesses = r.weaknesses.filter(
    (w): w is { title: string; explanation: string } =>
      !!w && typeof w === 'object' && isString((w as Record<string, unknown>).title) && isString((w as Record<string, unknown>).explanation),
  );
  const recommendations = r.recommendations.filter(
    (rec): rec is { outName: string; inName: string; verdict: string } =>
      !!rec &&
      typeof rec === 'object' &&
      isString((rec as Record<string, unknown>).outName) &&
      isString((rec as Record<string, unknown>).inName) &&
      isString((rec as Record<string, unknown>).verdict),
  );

  return {
    summary: r.summary,
    overallVerdict: r.overallVerdict,
    weaknesses,
    recommendations,
    captainSuggestion: r.captainSuggestion,
    benchSuggestion: r.benchSuggestion,
    dataLimitations: r.dataLimitations.filter(isString),
    provider,
  };
}
