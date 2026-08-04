/**
 * Server-only. Never import this from client code — it reads a secret API
 * key from process.env and must not end up in the browser bundle.
 */
import type { AIAnalysisRequest, AIProvider } from '../../src/types/index.ts';
import { AI_SYSTEM_PROMPT, buildUserPrompt } from '../../src/lib/ai/prompt.ts';
import { validateAiResponse } from '../../src/lib/ai/validate.ts';
import { mockAiProvider } from '../../src/lib/ai/providers/mockProvider.ts';

const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export const openaiProvider: AIProvider = {
  name: 'openai',
  async generate(request: AIAnalysisRequest) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return mockAiProvider.generate(request);

    try {
      const res = await fetch(`${OPENAI_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: `${AI_SYSTEM_PROMPT}\n\nRespond with a single JSON object with keys: summary, overallVerdict, weaknesses (array of {title, explanation}), recommendations (array of {outName, inName, verdict}), captainSuggestion, benchSuggestion, dataLimitations (array of strings).` },
            { role: 'user', content: buildUserPrompt(request) },
          ],
        }),
      });

      if (!res.ok) throw new Error(`OpenAI API responded ${res.status}`);
      const data = (await res.json()) as { choices: { message: { content: string } }[] };
      const text = data.choices?.[0]?.message?.content;
      const parsed = validateAiResponse(text ? JSON.parse(text) : null, 'openai');
      return parsed ?? mockAiProvider.generate(request);
    } catch {
      return mockAiProvider.generate(request);
    }
  },
};
