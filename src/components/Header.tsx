import React, { useState } from 'react';
import { Sparkles, Search, Sun, Moon, PlusCircle, Bookmark, Info, X } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onOpenSubmitModal: () => void;
  savedCount: number;
  showSavedOnly: boolean;
  setShowSavedOnly: (show: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  theme,
  toggleTheme,
  onOpenSubmitModal,
  savedCount,
  showSavedOnly,
  setShowSavedOnly,
}) => {
  const [showFtcBanner, setShowFtcBanner] = useState(true);

  return (
    <header className="header-sticky" style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-glass)' }}>
      {/* FTC Disclosure Banner */}
      {showFtcBanner && (
        <div style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))', padding: '0.4rem 1rem', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <Info size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
          <span><strong>FTC Disclosure:</strong> Verified offers are independently reviewed. Clicking referral links awards us an account credit or bonus at no extra cost to you.</span>
          <button onClick={() => setShowFtcBanner(false)} aria-label="Dismiss FTC Disclosure" style={{ marginLeft: 'auto', opacity: 0.7, color: 'var(--text-primary)' }}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.5rem', gap: '0.75rem' }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setShowSavedOnly(false)}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.1 }} className="gradient-text">
              FreebieVerse
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>Verified Perks & Referral Hub</span>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ flex: 1, minWidth: '240px', maxWidth: '420px', position: 'relative' }}>
          <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search freebies, cloud credits, gift cards..."
            aria-label="Search freebies and referral offers"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.6rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              outline: 'none',
              transition: 'all var(--transition-fast)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Saved / Bookmarks Filter Toggle */}
          <button
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            aria-label="View saved bookmarks"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: showSavedOnly ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-input)',
              border: `1px solid ${showSavedOnly ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              color: showSavedOnly ? 'var(--accent-primary)' : 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all var(--transition-fast)'
            }}
            title="View Bookmarked Offers"
          >
            <Bookmark size={16} fill={showSavedOnly ? 'currentColor' : 'none'} />
            <span className="hide-mobile">Saved</span>
            {savedCount > 0 && (
              <span style={{ background: 'var(--accent-primary)', color: '#fff', fontSize: '0.75rem', padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-full)' }}>
                {savedCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)'
            }}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} style={{ color: '#FBBF24' }} /> : <Moon size={18} style={{ color: '#8B5CF6' }} />}
          </button>

          {/* Submit Deal CTA */}
          <button
            onClick={onOpenSubmitModal}
            aria-label="Submit a referral link for review"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-gradient)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <PlusCircle size={16} />
            <span>Submit Link</span>
          </button>
        </div>
      </div>
    </header>
  );
};
