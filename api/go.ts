import type { VercelRequest, VercelResponse } from '@vercel/node';
import { INITIAL_DEALS } from '../src/data/deals';
import aggregatedDealsImport from '../src/data/aggregatedDeals.json';
import { Deal } from '../src/types';

/**
 * Safely extracts an array from ESM/CJS default exports or direct JSON arrays.
 */
function getArray<T>(imported: unknown): T[] {
  if (Array.isArray(imported)) return imported;
  if (imported && typeof imported === 'object' && 'default' in imported && Array.isArray((imported as { default: unknown }).default)) {
    return (imported as { default: T[] }).default;
  }
  return [];
}

/**
 * Indexes deals into a Map by deal ID for O(1) redirect lookups.
 */
function getDealsMap(): Map<string, Deal> {
  const map = new Map<string, Deal>();

  const initialList = getArray<Deal>(INITIAL_DEALS);
  const aggregatedList = getArray<Deal>(aggregatedDealsImport);

  const combined = [...initialList, ...aggregatedList];

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
