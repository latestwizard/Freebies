import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import { STATIC_DEALS } from '../src/data/staticDeals';
import { Deal } from '../src/types';

function loadAggregatedDeals(): Deal[] {
  try {
    const jsonPath = path.resolve(process.cwd(), 'src/data/aggregatedDeals.json');
    if (fs.existsSync(jsonPath)) {
      const content = fs.readFileSync(jsonPath, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[Vercel Serverless] Health endpoint failed to read aggregatedDeals.json:', err);
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
    const scrapedList = loadAggregatedDeals();
    const combinedDeals = [...STATIC_DEALS, ...scrapedList];

    const sourcesCount = {
      official: 0,
      doc: 0,
      fsf: 0,
      reddit: 0,
    };

    let newestScrapedDate = '';

    for (const deal of combinedDeals) {
      if (deal && deal.source && deal.source in sourcesCount) {
        sourcesCount[deal.source as keyof typeof sourcesCount]++;
      }
      if (deal && deal.source !== 'official' && deal.createdAt && (!newestScrapedDate || deal.createdAt > newestScrapedDate)) {
        newestScrapedDate = deal.createdAt;
      }
    }

    const isHealthy = combinedDeals.length >= 5;

    const responsePayload: HealthStatusResponse = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      totalDealsCount: combinedDeals.length,
      scrapedDealsCount: scrapedList.length,
      staticDealsCount: STATIC_DEALS.length,
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
