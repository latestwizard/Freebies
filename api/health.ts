import type { VercelRequest, VercelResponse } from '@vercel/node';
import { INITIAL_DEALS } from '../src/data/deals';
import aggregatedDeals from '../src/data/aggregatedDeals.json';
import { Deal } from '../src/types';

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

export default function handler(req: VercelRequest, res: VercelResponse) {
  const scrapedList = (aggregatedDeals as Deal[]) || [];
  const staticCount = INITIAL_DEALS.length - scrapedList.length;

  const sourcesCount = {
    official: 0,
    doc: 0,
    fsf: 0,
    reddit: 0,
  };

  let newestScrapedDate = '';

  for (const deal of INITIAL_DEALS) {
    if (deal.source && deal.source in sourcesCount) {
      sourcesCount[deal.source as keyof typeof sourcesCount]++;
    }
    if (deal.source !== 'official' && deal.createdAt && (!newestScrapedDate || deal.createdAt > newestScrapedDate)) {
      newestScrapedDate = deal.createdAt;
    }
  }

  const isHealthy = scrapedList.length > 0 && INITIAL_DEALS.length >= 10;

  const responsePayload: HealthStatusResponse = {
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    totalDealsCount: INITIAL_DEALS.length,
    scrapedDealsCount: scrapedList.length,
    staticDealsCount: Math.max(0, staticCount),
    sources: sourcesCount,
    lastScrapedAt: newestScrapedDate || undefined,
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
  };

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/json');

  return res.status(isHealthy ? 200 : 503).json(responsePayload);
}
