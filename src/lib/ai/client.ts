import type { AIAnalysisRequest, AIAnalysisResponse } from '../../types';
import { mockAiProvider } from './providers/mockProvider';

/**
 * Browser-side entry point for the AI layer. Always goes through the
 * server route (never calls Anthropic/OpenAI directly — that would require
 * shipping a secret key to the browser). If the endpoint is unreachable for
 * any reason, falls back to the same deterministic mock provider the server
 * itself uses when no API key is configured, so the AI panel never breaks.
 */
export async function getAiAnalysis(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const res = await fetch('/api/analyse', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`AI endpoint responded ${res.status}`);
    return (await res.json()) as AIAnalysisResponse;
  } catch {
    return mockAiProvider.generate(request);
  }
}
