import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import { STATIC_DEALS } from '../src/data/staticDeals';
import { Deal } from '../src/types';

/**
 * Safely loads scraped aggregated deals from disk via fs.readFileSync (Node.js ESM safe)
 */
function loadAggregatedDeals(): Deal[] {
  try {
    const jsonPath = path.resolve(process.cwd(), 'src/data/aggregatedDeals.json');
    if (fs.existsSync(jsonPath)) {
      const content = fs.readFileSync(jsonPath, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[Vercel Serverless] Failed to read aggregatedDeals.json from disk:', err);
  }
  return [];
}

/**
 * Indexes static and scraped deals into a Map by deal ID for O(1) redirect lookups.
 */
function getDealsMap(): Map<string, Deal> {
  const map = new Map<string, Deal>();
  const aggregated = loadAggregatedDeals();
  const combined = [...STATIC_DEALS, ...aggregated];

  for (const deal of combined) {
    if (deal && typeof deal === 'object' && typeof deal.id === 'string' && deal.id) {
      if (!map.has(deal.id)) {
        map.set(deal.id, deal);
      }
    }
  }

  return map;
}

let cachedDealsMap: Map<string, Deal> | null = null;

function loadMap(): Map<string, Deal> {
  if (!cachedDealsMap) {
    cachedDealsMap = getDealsMap();
  }
  return cachedDealsMap;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing deal ID' });
    }

    const dealsMap = loadMap();
    const deal = dealsMap.get(id);

    if (!deal || !deal.referralUrl) {
      console.warn(`[Vercel Serverless Redirect] Deal not found for ID: "${id}"`);
      return res.redirect(302, '/?error=deal_not_found');
    }

    // Set no-cache header to ensure click events & redirects are fresh
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // Log serverless redirect execution
    console.log(`[Vercel Serverless Redirect] Deal: ${deal.title} (${deal.id}) -> ${deal.referralUrl}`);

    // HTTP 302 Redirect directly to target referral URL
    return res.redirect(302, deal.referralUrl);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Vercel Serverless Exception in api/go]:', msg);
    return res.redirect(302, '/?error=server_error');
  }
}
