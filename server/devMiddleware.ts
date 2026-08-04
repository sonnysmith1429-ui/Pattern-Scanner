import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { fetchFplPath } from './fplProxy.ts';
import { runAnalysis } from './ai/index.ts';
import type { AIAnalysisRequest } from '../src/types/index.ts';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
}

/**
 * Dev-only equivalent of the /api/fpl/* and /api/analyse Vercel serverless
 * functions in /api — lets `npm run dev` serve a fully working backend
 * without a separate Node server or the Vercel CLI. Production deployments
 * (Vercel or similar) use the /api directory instead; both call the same
 * shared fetchFplPath / runAnalysis functions.
 */
export function fplBackendPlugin(): Plugin {
  return {
    name: 'fpl-analyst-backend',
    configureServer(server) {
      server.middlewares.use('/api/fpl', async (req, res) => {
        try {
          const path = (req.url ?? '/').split('?')[0];
          const { status, json } = await fetchFplPath(path);
          sendJson(res, status, json);
        } catch (err) {
          sendJson(res, 502, { error: `FPL proxy failed: ${(err as Error).message}` });
        }
      });

      server.middlewares.use('/api/analyse', async (req, res) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'Method not allowed' });
          return;
        }
        try {
          const raw = await readBody(req);
          const payload = JSON.parse(raw) as AIAnalysisRequest;
          const result = await runAnalysis(payload);
          sendJson(res, 200, result);
        } catch (err) {
          sendJson(res, 500, { error: `AI analysis failed: ${(err as Error).message}` });
        }
      });
    },
  };
}
