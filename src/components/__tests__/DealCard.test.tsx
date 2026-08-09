import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DealCard } from '../DealCard';
import { Deal } from '../../types';

const mockDeal: Deal = {
  id: 'test-deal-card',
  title: 'Free $100 Cloud Credits',
  provider: 'TestProvider',
  logoText: 'TP',
  logoBg: '#123',
  category: 'tech',
  shortDesc: 'Get free cloud credit for 60 days.',
  fullDesc: 'Full overview details.',
  valueText: '$100 Free Credit',
  referralUrl: 'https://example.com/ref',
  promoCode: 'TESTCODE',
  upvotes: 42,
  claimsCount: 150,
  verifiedDate: 'Today',
  status: 'verified',
  verifiedAt: new Date().toISOString().split('T')[0],
  createdAt: '2026-08-01',
  badge: 'HOT',
  steps: ['Step 1'],
  terms: 'Terms apply'
};

describe('DealCard Component', () => {
  it('renders deal title, provider, and value text correctly', () => {
    const onSelect = vi.fn();
    const onUpvote = vi.fn();
    const onBookmark = vi.fn();
    const onClaim = vi.fn();
    const addToast = vi.fn();

    render(
      <DealCard
        deal={mockDeal}
        onSelectDeal={onSelect}
        onUpvote={onUpvote}
        isUpvoted={false}
        onToggleBookmark={onBookmark}
        isBookmarked={false}
        onClaim={onClaim}
        addToast={addToast}
      />
    );

    expect(screen.getByText('Free $100 Cloud Credits')).toBeInTheDocument();
    expect(screen.getByText('TestProvider')).toBeInTheDocument();
    expect(screen.getByText(/🎁 \$100 Free Credit/i)).toBeInTheDocument();
  });

  it('triggers onClaim and opens referral window when Claim button is clicked', () => {
    const onSelect = vi.fn();
    const onUpvote = vi.fn();
    const onBookmark = vi.fn();
    const onClaim = vi.fn();
    const addToast = vi.fn();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <DealCard
        deal={mockDeal}
        onSelectDeal={onSelect}
        onUpvote={onUpvote}
        isUpvoted={false}
        onToggleBookmark={onBookmark}
        isBookmarked={false}
        onClaim={onClaim}
        addToast={addToast}
      />
    );

    const claimBtn = screen.getByRole('button', { name: /Claim freebie for Free \$100 Cloud Credits/i });
    fireEvent.click(claimBtn);

    expect(onClaim).toHaveBeenCalledWith('test-deal-card');
    expect(openSpy).toHaveBeenCalledWith('https://example.com/ref', '_blank', 'noopener,noreferrer');

    openSpy.mockRestore();
  });
});
