/**
 * Vercel-style serverless function (Node runtime) mirroring the
 * /api/analyse behaviour of server/devMiddleware.ts for production
 * deployments. Reads ANTHROPIC_API_KEY / OPENAI_API_KEY from the server
 * environment only — never sent to the browser.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { runAnalysis } from '../server/ai/index.ts';
import type { AIAnalysisRequest } from '../src/types/index.ts';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  try {
    const raw = await readBody(req);
    const payload = JSON.parse(raw) as AIAnalysisRequest;
    const result = await runAnalysis(payload);
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(result));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: `AI analysis failed: ${(err as Error).message}` }));
  }
}
