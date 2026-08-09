import type { VercelRequest, VercelResponse } from '@vercel/node';
import { INITIAL_DEALS } from '../src/data/deals';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing deal ID' });
  }

  const deal = INITIAL_DEALS.find(d => d.id === id);

  if (!deal) {
    return res.redirect(302, '/?error=deal_not_found');
  }

  // Set no-cache header to ensure click events are registered
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  // Log serverless redirect execution
  console.log(`[Vercel Serverless Redirect] Deal: ${deal.title} (${deal.id}) -> ${deal.referralUrl}`);

  // HTTP 302 Redirect directly to target referral URL
  return res.redirect(302, deal.referralUrl);
}
