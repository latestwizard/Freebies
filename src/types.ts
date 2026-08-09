export type CategoryId = 'all' | 'tech' | 'finance' | 'samples' | 'food' | 'entertainment';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
}

export type DealBadge = 'HOT' | 'VERIFIED' | 'LIMITED' | 'FEATURED' | 'EXCLUSIVITY';

export interface Deal {
  id: string;
  title: string;
  provider: string;
  logoText: string;
  logoBg: string;
  category: CategoryId;
  shortDesc: string;
  fullDesc: string;
  valueText: string;
  referralUrl: string;
  promoCode?: string;
  upvotes: number;
  claimsCount: number;
  verifiedDate: string;
  badge?: DealBadge;
  steps: string[];
  terms: string;
  featured?: boolean;
}
