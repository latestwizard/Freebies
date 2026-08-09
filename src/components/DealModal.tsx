import React, { useState } from 'react';
import { Deal } from '../types';
import { X, ExternalLink, ThumbsUp, Bookmark, Copy, Check, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DealModalProps {
  deal: Deal | null;
  onClose: () => void;
  onUpvote: (id: string) => void;
  isUpvoted: boolean;
  onToggleBookmark: (id: string) => void;
  isBookmarked: boolean;
  onClaim: (id: string) => void;
}

export const DealModal: React.FC<DealModalProps> = ({
  deal,
  onClose,
  onUpvote,
  isUpvoted,
  onToggleBookmark,
  isBookmarked,
  onClaim,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [reported, setReported] = useState(false);

  if (!deal) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(deal.referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!deal.promoCode) return;
    navigator.clipboard.writeText(deal.promoCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleClaim = () => {
    onClaim(deal.id);
    window.open(deal.referralUrl, '_blank', 'noopener,noreferrer');
  };

  const handleReportExpired = () => {
    setReported(true);
    setTimeout(() => setReported(false), 3000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          background: 'var(--bg-main)',
          border: '1px solid var(--border-hover)',
          boxShadow: 'var(--shadow-md)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-color)'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              background: deal.logoBg,
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}
          >
            {deal.logoText}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span>{deal.provider}</span>
              <CheckCircle2 size={14} style={{ color: 'var(--success-color)' }} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {deal.title}
            </h2>
          </div>
        </div>

        {/* Value Text Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 800, color: 'var(--success-color)', fontSize: '1.05rem' }}>
            🎁 Claim Value: {deal.valueText}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {deal.claimsCount.toLocaleString()} community claims
          </div>
        </div>

        {/* Full Overview Description */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Offer Overview
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            {deal.fullDesc}
          </p>
        </div>

        {/* Step-by-Step Instructions */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} style={{ color: 'var(--accent-primary)' }} />
            <span>How to Claim (Step-by-Step)</span>
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {deal.steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-gradient)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Code & Direct Referral Copy Row */}
        <div style={{ display: 'grid', gridTemplateColumns: deal.promoCode ? '1fr 1fr' : '1fr', gap: '0.75rem', marginBottom: '1.75rem' }}>
          {deal.promoCode && (
            <button
              onClick={handleCopyCode}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px dashed var(--accent-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Promo Code</div>
                <div style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{deal.promoCode}</div>
              </div>
              <div style={{ color: copiedCode ? 'var(--success-color)' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}>
                {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </div>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Referral Link</div>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Copy Direct URL</div>
            </div>
            <div style={{ color: copiedLink ? 'var(--success-color)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}>
              {copiedLink ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
            </div>
          </button>
        </div>

        {/* FTC Disclosure & Terms */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          <strong>Note:</strong> {deal.terms}
        </div>

        {/* Primary CTA & Modal Bottom Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={handleClaim}
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 18px rgba(139, 92, 246, 0.4)'
            }}
          >
            <span>Open Verified Referral & Claim Now</span>
            <ExternalLink size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => onUpvote(deal.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: isUpvoted ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-input)',
                  border: `1px solid ${isUpvoted ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  color: isUpvoted ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <ThumbsUp size={14} fill={isUpvoted ? 'currentColor' : 'none'} />
                <span>Upvote ({deal.upvotes})</span>
              </button>

              <button
                onClick={() => onToggleBookmark(deal.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: isBookmarked ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-input)',
                  border: `1px solid ${isBookmarked ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  color: isBookmarked ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
                <span>{isBookmarked ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            <button
              onClick={handleReportExpired}
              style={{
                fontSize: '0.78rem',
                color: reported ? 'var(--warning-color)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <AlertTriangle size={14} />
              <span>{reported ? 'Flagged as Expired' : 'Report Expired'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
