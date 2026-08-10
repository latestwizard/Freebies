import { describe, it, expect } from 'vitest';
import { getClaimUrl, getShareUrl } from '../dealUrls';
import { Deal } from '../../types';

const communityDeal: Deal = {
  id: 'user-submitted-1786400000000',
  title: 'Community Offer',
  provider: 'Local User',
  logoText: 'LOC',
  logoBg: '#333',
  category: 'tech',
  shortDesc: 'User deal',
  fullDesc: 'User deal full',
  valueText: '$10',
  referralUrl: 'https://example.com/user-ref',
  status: 'pending',
  verificationStatus: 'community-reported',
  source: 'community',
  createdAt: '2026-08-10',
  steps: [],
  terms: ''
};

const officialDeal: Deal = {
  id: 'digitalocean-credits',
  title: 'Official Credit',
  provider: 'DigitalOcean',
  logoText: 'DO',
  logoBg: '#0080FF',
  category: 'tech',
  shortDesc: 'Official credit',
  fullDesc: 'Official credit full',
  valueText: '$200',
  referralUrl: 'https://m.do.co/ref',
  status: 'verified',
  verificationStatus: 'staff-verified',
  source: 'official',
  createdAt: '2026-08-10',
  steps: [],
  terms: ''
};

describe('Deal URL Utilities', () => {
  it('returns direct referralUrl for community submitted deals', () => {
    expect(getClaimUrl(communityDeal)).toBe('https://example.com/user-ref');
    expect(getShareUrl(communityDeal)).toBe('https://example.com/user-ref');
  });

  it('returns /go/:id shortlink for official/scraped deals', () => {
    expect(getClaimUrl(officialDeal)).toBe('/go/digitalocean-credits');
    expect(getShareUrl(officialDeal)).toContain('/go/digitalocean-credits');
  });
});
