/**
 * Client-side Anti-Spam & Double-Click Throttling Utility.
 * 
 * SCOPING NOTE: This is an in-memory UX guard designed to prevent accidental double-clicks 
 * and rapid button spam in the client browser. It does not replace server-side rate limiting 
 * or API gateway referral fraud protection.
 */

const rateLimitStore: Record<string, number[]> = {};

/**
 * Checks whether an action is allowed under in-memory UX rate limit constraints.
 * @param key Unique identifier for the rate limited action (e.g. 'claim_digitalocean-credits')
 * @param maxRequests Maximum allowed requests in the time window
 * @param windowMs Time window in milliseconds (e.g. 5000ms)
 * @returns true if action is allowed; false if throttled
 */
export const checkRateLimit = (
  key: string,
  maxRequests = 3,
  windowMs = 5000
): boolean => {
  const now = Date.now();
  const timestamps = rateLimitStore[key] || [];

  // Filter out timestamps outside current time window
  const validTimestamps = timestamps.filter(ts => now - ts < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return false; // Throttled
  }

  validTimestamps.push(now);
  rateLimitStore[key] = validTimestamps;
  return true; // Allowed
};
