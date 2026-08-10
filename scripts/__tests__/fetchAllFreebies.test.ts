import { describe, it, expect } from 'vitest';
import { generateStableId, decodeEntities, isGenuineFreebie } from '../fetchAllFreebies.js';

describe('Multi-Source Freebie Scraper Utility Suite', () => {
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
});
