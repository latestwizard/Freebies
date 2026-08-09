import { describe, it, expect } from 'vitest';
import { sanitizeText, isValidUrl } from '../security';

describe('Security Utility', () => {
  describe('sanitizeText', () => {
    it('should strip script tags and HTML elements', () => {
      const input = '<script>alert("xss")</script>';
      const clean = sanitizeText(input);
      expect(clean).not.toContain('<script>');
      expect(clean).toBe('alert("xss")');
    });

    it('should preserve quotes and apostrophes for natural React JSX rendering', () => {
      const input = `Trader Joe's "$100" Bonus`;
      const clean = sanitizeText(input);
      expect(clean).toBe(`Trader Joe's "$100" Bonus`);
      expect(clean).not.toContain('&#x27;');
      expect(clean).not.toContain('&quot;');
    });

    it('should return empty string for empty input', () => {
      expect(sanitizeText('')).toBe('');
    });
  });

  describe('isValidUrl', () => {
    it('should accept valid HTTPS URLs', () => {
      expect(isValidUrl('https://example.com/ref?code=123')).toBe(true);
    });

    it('should accept valid HTTP URLs', () => {
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('should reject dangerous javascript: URLs', () => {
      expect(isValidUrl('javascript:alert(document.cookie)')).toBe(false);
    });

    it('should reject data: URLs', () => {
      expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    it('should reject malformed strings', () => {
      expect(isValidUrl('not-a-valid-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });
});
