/**
 * Security utilities for user input sanitization and URL validation.
 */

/**
 * Sanitizes raw string input by stripping HTML tags and dangerous scripts.
 */
export const sanitizeText = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
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
