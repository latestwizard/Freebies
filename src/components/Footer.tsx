import React from 'react';
import { CategoryId } from '../types';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (catId: CategoryId) => void;
  onOpenSubmitModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenSubmitModal }) => {
  return (
    <footer style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-glass)', backdropFilter: 'blur(16px)', padding: '3.5rem 0 2rem 0', marginTop: '4rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Sparkles size={18} />
              </div>
              <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                FreebieVerse
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              The internet's premiere directory for verified freebies, cloud hosting credits, signup cash bonuses, and product sample boxes.
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={15} style={{ color: 'var(--success-color)' }} />
              <span>All referral links verified active for 2026</span>
            </div>
          </div>

          {/* Categories Col */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Browse Categories
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <li><button onClick={() => onSelectCategory('tech')} aria-label="View Tech & SaaS Credits" style={{ color: 'inherit' }}>Tech & SaaS Credits</button></li>
              <li><button onClick={() => onSelectCategory('finance')} aria-label="View Finance & Cash Sign-Up Bonuses" style={{ color: 'inherit' }}>Finance & Cash Signup Bonuses</button></li>
              <li><button onClick={() => onSelectCategory('samples')} aria-label="View Free Physical Samples" style={{ color: 'inherit' }}>Free Physical Samples</button></li>
              <li><button onClick={() => onSelectCategory('food')} aria-label="View Food & Dining Perks" style={{ color: 'inherit' }}>Food & Dining Perks</button></li>
              <li><button onClick={() => onSelectCategory('entertainment')} aria-label="View Free Audiobooks & Streaming" style={{ color: 'inherit' }}>Free Audiobooks & Streaming</button></li>
            </ul>
          </div>

          {/* Community & Legal Col */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Community & Referral Policy
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <li><button onClick={onOpenSubmitModal} aria-label="Submit Your Referral Link" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Submit Your Referral Link</button></li>
              <li><span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>FTC Affiliate Disclosure: This website contains affiliate and referral links. Clicking a link may award us an account credit or referral bonus at no additional cost to you.</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <div>
            © {new Date().getFullYear()} FreebieVerse. Built with React & Vite. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Crafted with</span>
            <Heart size={14} style={{ color: '#EC4899', fill: 'currentColor' }} />
            <span>for freebie seekers everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
