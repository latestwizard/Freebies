import React from 'react';
import { Flame, Gift, DollarSign, Award } from 'lucide-react';

interface HeroSectionProps {
  onSelectTag: (tag: string) => void;
  totalDeals: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectTag, totalDeals }) => {
  const popularTags = ['Cloud Credits', 'Free Samples', '$300 Cash Bonus', 'Audiobooks', 'Vercel', 'Notion AI'];

  return (
    <section style={{ padding: '3.5rem 0 2rem 0', textAlign: 'center', position: 'relative' }}>
      <div className="container">
        {/* Badge Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--accent-primary)',
            marginBottom: '1.25rem'
          }}
        >
          <Flame size={15} style={{ color: '#EC4899' }} />
          <span>Curated & Tested Daily for Maximum Savings</span>
        </div>

        {/* Hero Title */}
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>
          Discover Verified Freebies & <br className="hide-mobile" />
          <span className="gradient-text">Exclusive Referral Sign-Up Perks</span>
        </h1>

        {/* Subtitle */}
        <p style={{ maxWidth: '680px', margin: '0 auto 2.25rem auto', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Unlock thousands of dollars in free software hosting credits, cash bonuses, sample boxes, and free streaming trials. Every offer is 100% verified.
        </p>

        {/* Stat Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div style={{ padding: '0.9rem 1.6rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success-color)' }}>
              <DollarSign size={20} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>$15,400+</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Available Perks Value</div>
            </div>
          </div>

          <div style={{ padding: '0.9rem 1.6rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-primary)' }}>
              <Gift size={20} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{totalDeals}+ Verified</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Active Freebies</div>
            </div>
          </div>

          <div style={{ padding: '0.9rem 1.6rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning-color)' }}>
              <Award size={20} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>18,900+</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Community Claims</div>
            </div>
          </div>
        </div>

        {/* Quick Tag Pills */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.5rem' }}>Popular tags:</span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onSelectTag(tag)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: 500,
                transition: 'all var(--transition-fast)'
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
