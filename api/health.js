import { DEALS_MAP } from './dealsMap.js';

const startTime = Date.now();

export default function handler(_req, res) {
  try {
    const totalCount = Object.keys(DEALS_MAP).length;
    const responsePayload = {
      status: totalCount >= 5 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      totalDealsCount: totalCount,
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    };

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/json');

    return res.status(totalCount >= 5 ? 200 : 503).json(responsePayload);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Vercel Serverless Exception in api/health]:', msg);
    return res.status(500).json({ error: 'Internal Server Error', details: msg });
  }
}
