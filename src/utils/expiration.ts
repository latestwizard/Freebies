import { Deal } from '../types';

/**
 * Deal Expiration & Staleness Utilities.
 */

/**
 * Returns the number of days elapsed since the deal was last verified by staff.
 */
export const getDaysSinceVerification = (deal: Deal): number | null => {
  if (!deal.verifiedAt) return null;
  try {
    const verifiedDate = new Date(deal.verifiedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - verifiedDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
};

/**
 * Determines whether a deal's verification is stale (e.g. older than 45 days).
 */
export const isDealStale = (deal: Deal, maxAgeDays = 45): boolean => {
  if (deal.status === 'expired') return true;
  const days = getDaysSinceVerification(deal);
  if (days === null) return false;
  return days > maxAgeDays;
};
