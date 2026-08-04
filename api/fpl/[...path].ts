/**
 * Vercel-style serverless function (Node runtime) mirroring the /api/fpl/*
 * behaviour of server/devMiddleware.ts for production deployments. Any
 * platform that supports a Node HTTP handler in /api works the same way.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { fetchFplPath } from '../../server/fplProxy.ts';

interface VercelLikeRequest extends IncomingMessage {
  query?: Record<string, string | string[]>;
}

export default async function handler(req: VercelLikeRequest, res: ServerResponse) {
  try {
    const pathParam = req.query?.path;
    const path = Array.isArray(pathParam) ? pathParam.join('/') : pathParam ?? '';
    const { status, json } = await fetchFplPath(path);
    res.statusCode = status;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(json));
  } catch (err) {
    res.statusCode = 502;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: `FPL proxy failed: ${(err as Error).message}` }));
  }
}
