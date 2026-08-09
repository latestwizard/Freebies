import React, { useState, useEffect } from 'react';
import { CategoryId, Deal } from '../types';
import { CATEGORIES } from '../data/deals';
import { sanitizeText, isValidUrl } from '../utils/security';
import { trackEvent } from '../utils/analytics';
import { X, Sparkles, AlertCircle, Clock } from 'lucide-react';

interface SubmitDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newDeal: Deal) => void;
  addToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const SubmitDealModal: React.FC<SubmitDealModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  addToast,
}) => {
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [category, setCategory] = useState<CategoryId>('tech');
  const [valueText, setValueText] = useState('');
  const [referralUrl, setReferralUrl] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [stepsInput, setStepsInput] = useState('');
  const [urlError, setUrlError] = useState('');

  // Lock background scroll when modal is active & listen to Escape key
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError('');

    // Strict URL Protocol Validation (http or https only)
    if (!isValidUrl(referralUrl)) {
      setUrlError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    // Sanitize user inputs to prevent XSS
    const cleanTitle = sanitizeText(title);
    const cleanProvider = sanitizeText(provider);
    const cleanValueText = sanitizeText(valueText);
    const cleanPromoCode = sanitizeText(promoCode);
    const cleanShortDesc = sanitizeText(shortDesc);
    const cleanStepsInput = sanitizeText(stepsInput);

    if (!cleanTitle || !cleanProvider || !cleanValueText) return;

    const initials = cleanProvider.substring(0, 3).toUpperCase();
    const stepsArray = cleanStepsInput
      ? cleanStepsInput.split('\n').filter((s) => s.trim().length > 0)
      : ['Click referral link to sign up.', 'Complete eligible sign up requirements to unlock bonus.'];

    // Submissions initialize as 'pending' status — NEVER auto-assigned 'verified'
    const newDeal: Deal = {
      id: `user-submitted-${Date.now()}`,
      title: cleanTitle,
      provider: cleanProvider,
      logoText: initials,
      logoBg: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
      category,
      shortDesc: cleanShortDesc || 'Community submitted offer pending staff verification.',
      fullDesc: cleanShortDesc || 'Community submitted offer. Make sure to follow referral requirements.',
      valueText: cleanValueText,
      referralUrl,
      promoCode: cleanPromoCode || undefined,
      upvotes: 1,
      claimsCount: 1,
      verifiedDate: 'Pending Review',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      badge: undefined,
      steps: stepsArray,
      terms: 'Community submitted referral. Verification pending.'
    };

    onSubmit(newDeal);
    addToast('Offer submitted for community review!', 'success');
    trackEvent('deal_submitted', { title: cleanTitle, provider: cleanProvider, category });
    onClose();

    // Reset form
    setTitle('');
    setProvider('');
    setValueText('');
    setReferralUrl('');
    setPromoCode('');
    setShortDesc('');
    setStepsInput('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-deal-title"
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
          maxWidth: '580px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          background: 'var(--bg-main)',
          border: '1px solid var(--border-hover)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h2 id="submit-deal-title" style={{ fontSize: '1.3rem', fontWeight: 800 }}>Submit a Referral Freebie</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Community submissions undergo review before receiving verified badges</p>
          </div>
        </div>

        {/* Notice Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--warning-color)', fontSize: '0.78rem', marginBottom: '1.25rem' }}>
          <Clock size={14} style={{ flexShrink: 0 }} />
          <span>Offers are listed as <strong>Community (Pending Review)</strong> until verified by our moderators.</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Offer Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. $100 Free VPS Hosting Credit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Provider Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Linode / DigitalOcean"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              >
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Value Badge *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. $100 Free Credit / 100% Free"
                value={valueText}
                onChange={(e) => setValueText(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Promo Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. SAVE100"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Your Referral Link (URL) *
            </label>
            <input
              type="url"
              required
              placeholder="https://example.com/register?ref=yourcode"
              value={referralUrl}
              onChange={(e) => {
                setReferralUrl(e.target.value);
                if (urlError) setUrlError('');
              }}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: `1px solid ${urlError ? 'var(--danger-color)' : 'var(--border-color)'}`, color: 'var(--text-primary)', outline: 'none' }}
            />
            {urlError && (
              <div style={{ color: 'var(--danger-color)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem' }}>
                <AlertCircle size={13} />
                <span>{urlError}</span>
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Short Summary
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of what the user gets..."
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', resize: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Steps to Claim (1 per line)
            </label>
            <textarea
              rows={3}
              placeholder="Step 1: Click referral link&#10;Step 2: Sign up with email&#10;Step 3: Receive bonus"
              value={stepsInput}
              onChange={(e) => setStepsInput(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.95rem',
              marginTop: '0.5rem',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)'
            }}
          >
            Submit for Review
          </button>
        </form>
      </div>
    </div>
  );
};
