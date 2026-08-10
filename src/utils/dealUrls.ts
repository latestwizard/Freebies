import { Deal } from '../types';

/**
 * Returns the appropriate claim redirect URL for a deal.
 * Community submissions (localStorage-only) open their direct referral URL.
 * Bundled official/scraped deals route through the Vercel serverless /go/:id redirect endpoint.
 */
export const getClaimUrl = (deal: Deal): string => {
  if (deal.source === 'community' || deal.id.startsWith('user-submitted-')) {
    return deal.referralUrl;
  }
  return `/go/${deal.id}`;
};

/**
 * Returns the shareable link for an offer.
 * Community submissions share their direct referral URL.
 * Official/scraped deals share the platform /go/:id shortlink to retain traffic & click analytics.
 */
export const getShareUrl = (deal: Deal): string => {
  if (deal.source === 'community' || deal.id.startsWith('user-submitted-')) {
    return deal.referralUrl;
  }
  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
  return `${origin}/go/${deal.id}`;
};
