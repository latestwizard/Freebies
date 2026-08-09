/**
 * Defensive storage utilities for safe LocalStorage reading and parsing.
 */

/**
 * Safely retrieves and parses JSON data from LocalStorage.
 * Prevents application crashes if LocalStorage contains malformed or corrupted JSON.
 */
export function safeLoadLocalStorage<T>(
  key: string,
  fallback: T,
  validator?: (data: any) => boolean
): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);

    if (validator && !validator(parsed)) {
      console.warn(`LocalStorage key "${key}" failed validation check. Falling back to default.`);
      return fallback;
    }

    return parsed as T;
  } catch (error) {
    console.error(`Error reading LocalStorage key "${key}":`, error);
    return fallback;
  }
}

/**
 * Safely sets an item in LocalStorage with error logging.
 */
export function safeSetLocalStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to LocalStorage key "${key}":`, error);
    return false;
  }
}
