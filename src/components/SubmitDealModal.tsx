import React, { useState } from 'react';
import { CategoryId, Deal } from '../types';
import { CATEGORIES } from '../data/deals';
import { X, Sparkles } from 'lucide-react';

interface SubmitDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newDeal: Deal) => void;
}

export const SubmitDealModal: React.FC<SubmitDealModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [category, setCategory] = useState<CategoryId>('tech');
  const [valueText, setValueText] = useState('');
  const [referralUrl, setReferralUrl] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [stepsInput, setStepsInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !provider || !referralUrl || !valueText) return;

    const initials = provider.substring(0, 3).toUpperCase();
    const stepsArray = stepsInput
      ? stepsInput.split('\n').filter((s) => s.trim().length > 0)
      : ['Click referral link to sign up.', 'Complete eligible sign up requirements to unlock bonus.'];

    const newDeal: Deal = {
      id: `user-submitted-${Date.now()}`,
      title,
      provider,
      logoText: initials,
      logoBg: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
      category,
      shortDesc: shortDesc || 'Community submitted verified freebie offer.',
      fullDesc: shortDesc || 'Community submitted offer. Make sure to follow referral requirements.',
      valueText,
      referralUrl,
      promoCode: promoCode || undefined,
      upvotes: 1,
      claimsCount: 1,
      verifiedDate: 'Just now',
      badge: 'VERIFIED',
      steps: stepsArray,
      terms: 'Community submitted offer. Always review terms on the target website.'
    };

    onSubmit(newDeal);
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Submit a Referral Freebie</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Share your referral link with thousands of daily visitors</p>
          </div>
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
              onChange={(e) => setReferralUrl(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
            />
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
            Publish Verified Freebie
          </button>
        </form>
      </div>
    </div>
  );
};
