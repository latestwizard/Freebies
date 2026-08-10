import React from 'react';
import { Deal } from '../types';
import { useClipboard } from '../hooks/useClipboard';
import { trackEvent } from '../utils/analytics';
import { checkRateLimit } from '../utils/rateLimit';
import { isDealStale } from '../utils/expiration';
import { ExternalLink, ThumbsUp, Copy, Check, Bookmark, CheckCircle2, Eye, Clock, AlertTriangle, Share2 } from 'lucide-react';

interface DealCardProps {
  deal: Deal;
  onSelectDeal: (deal: Deal) => void;
  onUpvote: (id: string) => void;
  isUpvoted: boolean;
  onToggleBookmark: (id: string) => void;
  isBookmarked: boolean;
  onClaim: (id: string) => void;
  addToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

const DealCardComponent: React.FC<DealCardProps> = ({
  deal,
  onSelectDeal,
  onUpvote,
  isUpvoted,
  onToggleBookmark,
  isBookmarked,
  onClaim,
  addToast,
}) => {
  const { copied: copiedCode, copy: copyCode } = useClipboard();
  const isStale = isDealStale(deal, 45);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deal.promoCode) {
      copyCode(deal.promoCode);
      addToast(`Copied code: ${deal.promoCode}`, 'success');
      trackEvent('promo_code_copied', { dealId: deal.id, code: deal.promoCode });
    }
  };

  const handleClaimClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Anti-Spam Rate Limiting Check
    if (!checkRateLimit(`claim_${deal.id}`, 3, 5000)) {
      addToast('Please wait a moment before claiming again.', 'warning');
      return;
    }

    onClaim(deal.id);
    trackEvent('deal_claimed', { dealId: deal.id, provider: deal.provider, title: deal.title });
    addToast(`Opening ${deal.provider} referral link...`, 'info');
    const redirectUrl = `/go/${deal.id}`;
    window.open(redirectUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent('deal_shared', { dealId: deal.id, title: deal.title });
    const shareUrl = `${window.location.origin}/go/${deal.id}`;

    if (navigator.share) {
      navigator.share({
        title: deal.title,
        text: `Claim ${deal.title} on FreebieVerse!`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      addToast('Share link copied to clipboard!', 'success');
    }
  };

  const getBadgeStyle = (badge?: string, status?: string) => {
    if (status === 'pending') {
      return { bg: 'rgba(245, 158, 11, 0.15)', text: 'var(--warning-color)', border: '1px solid rgba(245, 158, 11, 0.3)' };
    }
    if (status === 'expired') {
      return { bg: 'rgba(239, 68, 68, 0.15)', text: 'var(--danger-color)', border: '1px solid rgba(239, 68, 68, 0.3)' };
    }
    if (isStale) {
      return { bg: 'rgba(245, 158, 11, 0.12)', text: '#D97706', border: '1px solid rgba(245, 158, 11, 0.25)' };
    }

    switch (badge) {
      case 'HOT':
        return { bg: 'linear-gradient(135deg, #EF4444, #F59E0B)', text: '#fff' };
      case 'VERIFIED':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: 'var(--success-color)', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'LIMITED':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)' };
      case 'FEATURED':
        return { bg: 'linear-gradient(135deg, #8B5CF6, #EC4899)', text: '#fff' };
      case 'BIRTHDAY':
        return { bg: 'linear-gradient(135deg, #EC4899, #F59E0B)', text: '#fff' };
      default:
        return { bg: 'rgba(139, 92, 246, 0.15)', text: 'var(--accent-primary)', border: '1px solid rgba(139, 92, 246, 0.3)' };
    }
  };

  const badgeStyle = getBadgeStyle(deal.badge, deal.status);

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem',
        position: 'relative',
        transition: 'all var(--transition-normal)',
        cursor: 'pointer',
        opacity: deal.status === 'expired' ? 0.75 : 1
      }}
      onClick={() => onSelectDeal(deal)}
    >
      <div>
        {/* Top Header: Logo, Provider, Badge & Bookmark/Share */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                background: deal.logoBg,
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                flexShrink: 0
              }}
            >
              {deal.logoText}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span>{deal.provider}</span>
                {deal.status === 'verified' && !isStale && <CheckCircle2 size={13} style={{ color: 'var(--success-color)' }} />}
                {deal.status === 'pending' && <Clock size={13} style={{ color: 'var(--warning-color)' }} />}
                {deal.status === 'expired' && <AlertTriangle size={13} style={{ color: 'var(--danger-color)' }} />}
                {isStale && deal.status === 'verified' && <Clock size={13} style={{ color: 'var(--warning-color)' }} />}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {deal.status === 'pending'
                  ? 'Pending Review'
                  : deal.status === 'expired'
                  ? 'Expired'
                  : isStale
                  ? 'Needs Re-verification'
                  : `Verified ${deal.verifiedDate}`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: badgeStyle.bg,
                color: badgeStyle.text,
                border: badgeStyle.border || 'none'
              }}
            >
              {deal.status === 'pending'
                ? 'PENDING'
                : deal.status === 'expired'
                ? 'EXPIRED'
                : isStale
                ? 'AGING'
                : deal.badge || 'VERIFIED'}
            </span>

            <button
              onClick={handleShare}
              aria-label={`Share ${deal.title}`}
              style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
              title="Share Offer"
            >
              <Share2 size={16} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(deal.id);
                addToast(isBookmarked ? 'Removed from saved offers' : 'Saved offer to bookmarks!', isBookmarked ? 'info' : 'success');
              }}
              aria-label={isBookmarked ? `Remove ${deal.title} from bookmarks` : `Save ${deal.title} to bookmarks`}
              style={{
                padding: '0.4rem',
                color: isBookmarked ? 'var(--accent-primary)' : 'var(--text-muted)',
                transition: 'all var(--transition-fast)'
              }}
              title={isBookmarked ? 'Remove Bookmark' : 'Save Offer'}
            >
              <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Title & Value Pill */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {deal.title}
        </h3>

        {/* Value Text Banner */}
        <div style={{ display: 'inline-block', marginBottom: '0.85rem' }}>
          <span
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: 'var(--success-color)',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}
          >
            🎁 {deal.valueText}
          </span>
        </div>

        {/* Description */}
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
          {deal.shortDesc}
        </p>

        {/* Promo Code Box (If available) */}
        {deal.promoCode && (
          <div
            onClick={handleCopyCode}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-input)',
              border: '1px dashed var(--border-hover)',
              marginBottom: '1.25rem',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Code: <strong style={{ color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>{deal.promoCode}</strong>
            </div>
            <button
              aria-label={`Copy promo code ${deal.promoCode}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                color: copiedCode ? 'var(--success-color)' : 'var(--accent-primary)',
                fontWeight: 600
              }}
            >
              {copiedCode ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Card Footer: Upvote, Claims & Primary Action CTA */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          {/* Upvote Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpvote(deal.id);
              addToast(isUpvoted ? 'Upvote removed' : 'Upvoted offer!', isUpvoted ? 'info' : 'success');
              trackEvent('deal_upvoted', { dealId: deal.id, action: isUpvoted ? 'remove' : 'add' });
            }}
            aria-label={`Upvote ${deal.title}. Current votes: ${deal.upvotes}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: isUpvoted ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-input)',
              border: `1px solid ${isUpvoted ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              color: isUpvoted ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              transition: 'all var(--transition-fast)'
            }}
          >
            <ThumbsUp size={14} fill={isUpvoted ? 'currentColor' : 'none'} />
            <span>{(deal.upvotes ?? 0).toLocaleString()}</span>
          </button>

          {/* Claims Count */}
          {deal.claimsCount !== undefined && deal.claimsCount !== null && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              🔥 {deal.claimsCount.toLocaleString()} claimed
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onSelectDeal(deal)}
            aria-label={`View claim steps for ${deal.title}`}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem'
            }}
          >
            <Eye size={15} />
            <span>Steps</span>
          </button>

          <button
            onClick={handleClaimClick}
            aria-label={`Claim freebie for ${deal.title}`}
            style={{
              flex: 2,
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)'
            }}
          >
            <span>Claim Freebie</span>
            <ExternalLink size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const DealCard = React.memo(DealCardComponent);
