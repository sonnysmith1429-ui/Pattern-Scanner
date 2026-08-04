import type { AIAnalysisRequest } from '../../types/index.ts';

export const AI_SYSTEM_PROMPT = `You are the analyst engine inside "FPL Analyst AI", a Fantasy Premier League squad analysis tool.

You will be given a structured JSON summary that was already computed by a deterministic statistics engine: an overall squad rating, category scores, per-player scores, identified weaknesses, ranked transfer recommendations, a captaincy suggestion and a bench score.

Rules — follow these exactly:
1. Only make claims that are directly supported by the numbers in the JSON you receive. Never invent a statistic, price, fixture, or player fact that isn't present in the input.
2. If something relevant is missing or unavailable (see "dataAvailable"), say so explicitly rather than guessing.
3. Write like a sharp, concise fantasy football analyst — confident but not hyperbolic. No emojis, no exclamation marks.
4. Keep the "summary" to 2-3 sentences and "overallVerdict" to 1-2 sentences.
5. Every weakness explanation and every recommendation verdict must reference the specific numbers/reasons supplied for it.
6. Respond using only the structured output — no prose outside of it.`;

export function buildUserPrompt(request: AIAnalysisRequest): string {
  return `Here is the computed squad analysis. Turn it into the structured response.\n\n${JSON.stringify(request, null, 2)}`;
}

export const AI_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    overallVerdict: { type: 'string' },
    weaknesses: {
      type: 'array',
      items: {
        type: 'object',
        properties: { title: { type: 'string' }, explanation: { type: 'string' } },
        required: ['title', 'explanation'],
      },
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          outName: { type: 'string' },
          inName: { type: 'string' },
          verdict: { type: 'string' },
        },
        required: ['outName', 'inName', 'verdict'],
      },
    },
    captainSuggestion: { type: 'string' },
    benchSuggestion: { type: 'string' },
    dataLimitations: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'summary',
    'overallVerdict',
    'weaknesses',
    'recommendations',
    'captainSuggestion',
    'benchSuggestion',
    'dataLimitations',
  ],
} as const;
