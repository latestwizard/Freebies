export type CategoryId = 'all' | 'tech' | 'finance' | 'samples' | 'food' | 'entertainment';

export type CategoryIcon = 'Sparkles' | 'Code' | 'Coins' | 'Gift' | 'Utensils' | 'Tv';

export interface Category {
  id: CategoryId;
  name: string;
  icon: CategoryIcon;
  description: string;
}

export type DealBadge = 'HOT' | 'VERIFIED' | 'LIMITED' | 'FEATURED' | 'EXCLUSIVITY';

export type DealStatus = 'pending' | 'verified' | 'expired' | 'rejected';

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
  status: DealStatus;
  verifiedAt?: string;
  createdAt: string;
  badge?: DealBadge;
  steps: string[];
  terms: string;
  featured?: boolean;
}
