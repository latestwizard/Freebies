import { DEALS_MAP } from './dealsMap.js';

/**
 * Vercel Serverless Redirect Handler (/go/:id -> /api/go?id=:id)
 * Zero external module dependencies, zero filesystem operations.
 */
export default function handler(req, res) {
  try {
    const id = req.query?.id;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing deal ID' });
    }

    const referralUrl = DEALS_MAP[id];

    if (!referralUrl) {
      console.warn(`[Vercel Serverless Redirect] Deal not found for ID: "${id}"`);
      return res.redirect(302, '/?error=deal_not_found');
    }

    // Set no-cache header to ensure click events & redirects are fresh
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // Log serverless redirect execution
    console.log(`[Vercel Serverless Redirect] Deal ID "${id}" -> ${referralUrl}`);

    // HTTP 302 Redirect directly to target referral URL
    return res.redirect(302, referralUrl);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Vercel Serverless Exception in api/go]:', msg);
    return res.redirect(302, '/?error=server_error');
  }
}
