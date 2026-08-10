export type CategoryId = 'all' | 'tech' | 'finance' | 'samples' | 'food' | 'entertainment' | 'birthday';

export type CategoryIcon = 'Sparkles' | 'Code' | 'Coins' | 'Gift' | 'Utensils' | 'Tv' | 'Cake';

export interface Category {
  id: CategoryId;
  name: string;
  icon: CategoryIcon;
  description: string;
}

export type DealBadge = 'HOT' | 'VERIFIED' | 'LIMITED' | 'FEATURED' | 'EXCLUSIVITY' | 'BIRTHDAY' | 'REDDIT' | 'DOC' | 'FSF';

export type DealStatus = 'pending' | 'verified' | 'expired' | 'rejected';

export type ProvenanceSource = 'official' | 'reddit' | 'doc' | 'fsf' | 'community';

export type VerificationStatus = 'staff-verified' | 'source-listed' | 'community-reported';

export interface Deal {
  id: string; // Deterministic hash ID based on canonical URL or source GUID
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
  upvotes?: number;
  claimsCount?: number;
  verifiedDate?: string;
  status: DealStatus;
  verificationStatus: VerificationStatus;
  source: ProvenanceSource;
  sourceUrl?: string;
  verifiedAt?: string;
  createdAt: string;
  badge?: DealBadge;
  steps: string[];
  terms: string;
  featured?: boolean;
}
