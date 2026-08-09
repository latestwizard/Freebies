import { describe, it, expect } from 'vitest';
import { isDealStale } from '../expiration';
import { Deal } from '../../types';

const sampleDeal: Deal = {
  id: 'test-deal',
  title: 'Test Deal',
  provider: 'Test',
  logoText: 'T',
  logoBg: '#000',
  category: 'tech',
  shortDesc: 'Short desc',
  fullDesc: 'Full desc',
  valueText: '$100',
  referralUrl: 'https://example.com',
  upvotes: 10,
  claimsCount: 50,
  verifiedDate: '2026-01-01',
  status: 'verified',
  verifiedAt: '2026-01-01',
  createdAt: '2026-01-01',
  steps: ['Step 1'],
  terms: 'Terms'
};

describe('Expiration Utility', () => {
  it('should identify stale deals older than threshold', () => {
    const oldDeal = { ...sampleDeal, verifiedAt: '2020-01-01' };
    expect(isDealStale(oldDeal, 45)).toBe(true);
  });

  it('should not mark recently verified deals as stale', () => {
    const freshDeal = { ...sampleDeal, verifiedAt: new Date().toISOString().split('T')[0] };
    expect(isDealStale(freshDeal, 45)).toBe(false);
  });

  it('should mark status expired deals as stale', () => {
    const expiredDeal = { ...sampleDeal, status: 'expired' as const };
    expect(isDealStale(expiredDeal, 45)).toBe(true);
  });
});
