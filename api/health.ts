import type { VercelRequest, VercelResponse } from '@vercel/node';
import { INITIAL_DEALS } from '../src/data/deals';
import aggregatedDealsImport from '../src/data/aggregatedDeals.json';
import { Deal } from '../src/types';

function getArray<T>(imported: unknown): T[] {
  if (Array.isArray(imported)) return imported;
  if (imported && typeof imported === 'object' && 'default' in imported && Array.isArray((imported as { default: unknown }).default)) {
    return (imported as { default: T[] }).default;
  }
  return [];
}

interface HealthStatusResponse {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: string;
  totalDealsCount: number;
  scrapedDealsCount: number;
  staticDealsCount: number;
  sources: {
    official: number;
    doc: number;
    fsf: number;
    reddit: number;
  };
  lastScrapedAt?: string;
  uptimeSeconds: number;
}

const startTime = Date.now();

export default function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const staticDeals = getArray<Deal>(INITIAL_DEALS);
    const scrapedList = getArray<Deal>(aggregatedDealsImport);

    const sourcesCount = {
      official: 0,
      doc: 0,
      fsf: 0,
      reddit: 0,
    };

    let newestScrapedDate = '';

    for (const deal of staticDeals) {
      if (deal && deal.source && deal.source in sourcesCount) {
        sourcesCount[deal.source as keyof typeof sourcesCount]++;
      }
      if (deal && deal.source !== 'official' && deal.createdAt && (!newestScrapedDate || deal.createdAt > newestScrapedDate)) {
        newestScrapedDate = deal.createdAt;
      }
    }

    const isHealthy = staticDeals.length >= 5;

    const responsePayload: HealthStatusResponse = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      totalDealsCount: staticDeals.length,
      scrapedDealsCount: scrapedList.length,
      staticDealsCount: Math.max(0, staticDeals.length - scrapedList.length),
      sources: sourcesCount,
      lastScrapedAt: newestScrapedDate || undefined,
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    };

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/json');

    return res.status(isHealthy ? 200 : 503).json(responsePayload);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Vercel Serverless Exception in api/health]:', msg);
    return res.status(500).json({ error: 'Internal Server Error', details: msg });
  }
}
