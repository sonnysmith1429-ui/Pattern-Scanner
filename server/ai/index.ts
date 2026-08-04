import type { AIAnalysisRequest, AIAnalysisResponse } from '../../src/types/index.ts';
import { mockAiProvider } from '../../src/lib/ai/providers/mockProvider.ts';
import { anthropicProvider } from './anthropicProvider.ts';
import { openaiProvider } from './openaiProvider.ts';

/**
 * Picks a provider based on which API key is configured server-side.
 * Anthropic takes priority if both are set. Neither set -> deterministic
 * mock provider, so the AI explanation feature always works out of the box.
 */
export async function runAnalysis(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  if (process.env.ANTHROPIC_API_KEY) return anthropicProvider.generate(request);
  if (process.env.OPENAI_API_KEY) return openaiProvider.generate(request);
  return mockAiProvider.generate(request);
}
