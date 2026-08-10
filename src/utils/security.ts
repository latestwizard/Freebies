/**
 * Security utilities for user input sanitization and URL validation.
 */

/**
 * Sanitizes user input string by stripping actual HTML tags (<script>, <div>, etc.)
 * while preserving quotes, apostrophes, and isolated comparison operators ("Spend > $50 and < $100").
 * React JSX automatically escapes text nodes natively to prevent XSS.
 */
export const sanitizeText = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/<\/?[a-z][a-z0-9]*[^>]*>/gi, '') // Strip HTML tags cleanly
    .trim();
};

/**
 * Validates whether a URL is valid and uses an allowed web protocol (http or https).
 * Prevents javascript: or data: URI injection attacks.
 */
export const isValidUrl = (urlStr: string): boolean => {
  if (!urlStr) return false;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};
