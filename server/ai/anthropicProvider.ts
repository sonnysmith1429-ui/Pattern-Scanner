/**
 * Server-only. Never import this from client code — it reads a secret API
 * key from process.env and must not end up in the browser bundle.
 */
import type { AIAnalysisRequest, AIProvider } from '../../src/types/index.ts';
import { AI_SYSTEM_PROMPT, AI_RESPONSE_SCHEMA, buildUserPrompt } from '../../src/lib/ai/prompt.ts';
import { validateAiResponse } from '../../src/lib/ai/validate.ts';
import { mockAiProvider } from '../../src/lib/ai/providers/mockProvider.ts';

const ANTHROPIC_BASE_URL = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
const MODEL = process.env.AI_MODEL || 'claude-sonnet-5';

export const anthropicProvider: AIProvider = {
  name: 'anthropic',
  async generate(request: AIAnalysisRequest) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return mockAiProvider.generate(request);

    try {
      const res = await fetch(`${ANTHROPIC_BASE_URL}/v1/messages`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1500,
          system: AI_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: buildUserPrompt(request) }],
          tools: [
            {
              name: 'emit_analysis',
              description: 'Emit the structured squad analysis response.',
              input_schema: AI_RESPONSE_SCHEMA,
            },
          ],
          tool_choice: { type: 'tool', name: 'emit_analysis' },
        }),
      });

      if (!res.ok) throw new Error(`Anthropic API responded ${res.status}`);
      const data = (await res.json()) as {
        content: { type: string; input?: unknown }[];
      };
      const toolUse = data.content.find((c) => c.type === 'tool_use');
      const parsed = validateAiResponse(toolUse?.input, 'anthropic');
      return parsed ?? mockAiProvider.generate(request);
    } catch {
      return mockAiProvider.generate(request);
    }
  },
};
