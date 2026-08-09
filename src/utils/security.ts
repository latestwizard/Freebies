/**
 * Security utilities for user input sanitization and URL validation.
 */

/**
 * Sanitizes user input string by stripping HTML tags and trimming whitespace.
 * Preserves quotes and apostrophes because React JSX automatically escapes text nodes natively.
 */
export const sanitizeText = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
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
