import { describe, it, expect, vi } from 'vitest';
import {
  generateStableId,
  decodeEntities,
  isGenuineFreebie,
  validateDealSchema,
  deduplicateDeals,
  normalizeIsoDate,
  fetchWithRetry,
} from '../fetchAllFreebies';
import { Deal } from '../../src/types';

describe('TypeScript Multi-Source Freebie Scraper Suite', () => {
  describe('generateStableId', () => {
    it('generates a deterministic SHA-256 stable ID from canonical URL', () => {
      const url = 'https://www.doctorofcredit.com/targeted-amex-offer-caesars-entertainment/';
      const id1 = generateStableId('doc', url);
      const id2 = generateStableId('doc', url);

      expect(id1).toBe(id2);
      expect(id1).toMatch(/^doc-[a-f0-9]{12}$/);
    });

    it('produces different IDs for distinct canonical URLs', () => {
      const urlA = 'https://example.com/offer-a';
      const urlB = 'https://example.com/offer-b';

      const idA = generateStableId('fsf', urlA);
      const idB = generateStableId('fsf', urlB);

      expect(idA).not.toBe(idB);
    });
  });

  describe('decodeEntities', () => {
    it('decodes common HTML named and numeric entities cleanly', () => {
      const input = 'Bath &#038; Body Works &#8217;26 Special &amp; Savings';
      const decoded = decodeEntities(input);

      expect(decoded).toBe("Bath & Body Works '26 Special & Savings");
    });

    it('strips CDATA block wrappers correctly', () => {
      const input = '<![CDATA[Free $100 VPS Credit]]>';
      const decoded = decodeEntities(input);

      expect(decoded).toBe('Free $100 VPS Credit');
    });

    it('handles quotes, smart quotes, and whitespace correctly', () => {
      const input = '&quot;Super&#8220; Deal&#8221; &#039;Test&#039; &nbsp;';
      const decoded = decodeEntities(input);

      expect(decoded).toBe('"Super" Deal" \'Test\'');
    });
  });

  describe('normalizeIsoDate', () => {
    it('normalizes raw date strings into standard YYYY-MM-DD format', () => {
      expect(normalizeIsoDate('Sun, 09 Aug 2026 12:00:00 GMT')).toBe('2026-08-09');
      expect(normalizeIsoDate('2026-08-10T15:30:00.000Z')).toBe('2026-08-10');
    });

    it('falls back gracefully to today for empty or invalid dates', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(normalizeIsoDate('')).toBe(today);
      expect(normalizeIsoDate('invalid-date-string')).toBe(today);
    });
  });

  describe('isGenuineFreebie Filter', () => {
    it('accepts genuine 100% freebies, physical samples, and free perks', () => {
      expect(isGenuineFreebie('1 Million FREE Dunkin Refreshers on August 10th')).toBe(true);
      expect(isGenuineFreebie('Free CeraVe Skincare Sample Pack')).toBe(true);
      expect(isGenuineFreebie('$200 Free Cloud Credits')).toBe(true);
    });

    it('rejects paid product shopping discounts with non-zero price tags', () => {
      expect(isGenuineFreebie('Starbucks Frappuccino 12-Pack for $17 Shipped at Amazon')).toBe(false);
      expect(isGenuineFreebie('Old Navy Women’s Dresses From $5.60')).toBe(false);
      expect(isGenuineFreebie('SiriusXM for $1', 'https://example.com/3-months-of-siriusxm-for-1-')).toBe(false);
    });
  });

  describe('validateDealSchema', () => {
    it('returns true for complete, valid Deal objects', () => {
      const validDeal: Deal = {
        id: 'test-123',
        title: 'Free Sample Kit',
        provider: 'Test Brand',
        logoText: 'TST',
        logoBg: 'blue',
        category: 'samples',
        shortDesc: 'Short desc',
        fullDesc: 'Full desc',
        valueText: '100% Free',
        referralUrl: 'https://example.com/claim',
        status: 'verified',
        verificationStatus: 'source-listed',
        source: 'official',
        createdAt: '2026-08-10',
        badge: 'HOT',
        featured: true,
        steps: ['Step 1'],
        terms: 'Terms apply'
      };

      expect(validateDealSchema(validDeal)).toBe(true);
    });

    it('returns false for incomplete or invalid objects missing essential fields', () => {
      expect(validateDealSchema({ id: '', title: 'Test' })).toBe(false);
      expect(validateDealSchema({ id: '123', title: '', referralUrl: 'https://example.com' })).toBe(false);
      expect(validateDealSchema({ id: '123', title: 'Test', referralUrl: 'javascript:alert(1)' })).toBe(false);
    });
  });

  describe('deduplicateDeals', () => {
    it('removes duplicate deals matching identical canonical URLs or titles', () => {
      const deals: Deal[] = [
        {
          id: '1',
          title: 'Free CeraVe Sample Pack',
          provider: 'Brand A',
          logoText: 'A',
          logoBg: 'blue',
          category: 'samples',
          shortDesc: 'Short',
          fullDesc: 'Full',
          valueText: 'Free',
          referralUrl: 'https://example.com/cerave',
          status: 'verified',
          verificationStatus: 'source-listed',
          source: 'doc',
          createdAt: '2026-08-10',
          badge: 'HOT',
          featured: false,
          steps: [],
          terms: ''
        },
        {
          id: '2',
          title: 'Free CeraVe Sample Pack', // Duplicate title
          provider: 'Brand B',
          logoText: 'B',
          logoBg: 'blue',
          category: 'samples',
          shortDesc: 'Short',
          fullDesc: 'Full',
          valueText: 'Free',
          referralUrl: 'https://example.com/cerave-alt',
          status: 'verified',
          verificationStatus: 'source-listed',
          source: 'reddit',
          createdAt: '2026-08-10',
          badge: 'REDDIT',
          featured: false,
          steps: [],
          terms: ''
        },
        {
          id: '3',
          title: 'Free Purina Pet Food Sample',
          provider: 'Brand C',
          logoText: 'C',
          logoBg: 'blue',
          category: 'samples',
          shortDesc: 'Short',
          fullDesc: 'Full',
          valueText: 'Free',
          referralUrl: 'https://example.com/purina',
          status: 'verified',
          verificationStatus: 'source-listed',
          source: 'fsf',
          createdAt: '2026-08-10',
          badge: 'FSF',
          featured: false,
          steps: [],
          terms: ''
        }
      ];

      const deduped = deduplicateDeals(deals);
      expect(deduped).toHaveLength(2);
      expect(deduped[0].id).toBe('1');
      expect(deduped[1].id).toBe('3');
    });
  });

  describe('fetchWithRetry', () => {
    it('retries failed network requests up to maxRetries before throwing', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
        Promise.resolve(new Response(null, { status: 500, statusText: 'Internal Server Error' }))
      );

      await expect(fetchWithRetry('https://example.com/fail', 2, 50)).rejects.toThrow('HTTP 500');
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      fetchSpy.mockRestore();
    });

    it('returns response text immediately on successful fetch', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
        Promise.resolve(new Response('<xml>Success</xml>', { status: 200 }))
      );

      const res = await fetchWithRetry('https://example.com/success', 2, 100);
      expect(res).toBe('<xml>Success</xml>');
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      fetchSpy.mockRestore();
    });
  });
});
