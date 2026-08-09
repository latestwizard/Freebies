import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../rateLimit';

describe('Rate Limit Utility', () => {
  it('should allow requests within limit', () => {
    const key = 'test_action_' + Date.now();
    expect(checkRateLimit(key, 3, 5000)).toBe(true);
    expect(checkRateLimit(key, 3, 5000)).toBe(true);
    expect(checkRateLimit(key, 3, 5000)).toBe(true);
  });

  it('should throttle requests exceeding max limit', () => {
    const key = 'test_spam_' + Date.now();
    expect(checkRateLimit(key, 2, 5000)).toBe(true);
    expect(checkRateLimit(key, 2, 5000)).toBe(true);
    expect(checkRateLimit(key, 2, 5000)).toBe(false); // Throttled
  });
});
