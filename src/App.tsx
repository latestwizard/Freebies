import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CategoryId, Deal } from './types';
import { INITIAL_DEALS, CATEGORIES } from './data/deals';
import { safeLoadLocalStorage, safeSetLocalStorage } from './utils/storage';
import { trackEvent } from './utils/analytics';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryFilter } from './components/CategoryFilter';
import { DealCard } from './components/DealCard';
import { DealModal } from './components/DealModal';
import { SubmitDealModal } from './components/SubmitDealModal';
import { ToastContainer, ToastMessage } from './components/ToastContainer';
import { Footer } from './components/Footer';
import { RefreshCw, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return safeLoadLocalStorage<'dark' | 'light'>('freebieverse_theme', 'dark', (val) => val === 'dark' || val === 'light');
  });

  // Deals state (combines INITIAL_DEALS with user-submitted deals stored safely in LocalStorage)
  const [deals, setDeals] = useState<Deal[]>(() => {
    const customDeals = safeLoadLocalStorage<Deal[]>('freebieverse_custom_deals', [], Array.isArray);
    return [...customDeals, ...INITIAL_DEALS];
  });

  // Upvoted & Bookmarked states (safely loaded)
  const [upvotedIds, setUpvotedIds] = useState<string[]>(() => {
    return safeLoadLocalStorage<string[]>('freebieverse_upvotes', [], Array.isArray);
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    return safeLoadLocalStorage<string[]>('freebieverse_bookmarks', [], Array.isArray);
  });

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Modal State: Store ONLY ID to eliminate stale modal snapshot bugs
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Live derived selected deal (always in sync with deals state)
  const selectedDeal = useMemo(() => {
    if (!selectedDealId) return null;
    return deals.find(d => d.id === selectedDealId) ?? null;
  }, [deals, selectedDealId]);

  // Sync Theme to HTML Root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    safeSetLocalStorage('freebieverse_theme', theme);
  }, [theme]);

  // Persist Upvotes safely
  useEffect(() => {
    safeSetLocalStorage('freebieverse_upvotes', upvotedIds);
  }, [upvotedIds]);

  // Persist Bookmarks safely
  useEffect(() => {
    safeSetLocalStorage('freebieverse_bookmarks', bookmarkedIds);
  }, [bookmarkedIds]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      trackEvent('theme_toggled', { theme: next });
      return next;
    });
  };

  const handleUpvote = useCallback((id: string) => {
    setUpvotedIds(prev => {
      const isCurrentlyUpvoted = prev.includes(id);
      setDeals(dealsPrev =>
        dealsPrev.map(d => (d.id === id ? { ...d, upvotes: (d.upvotes || 0) + (isCurrentlyUpvoted ? -1 : 1) } : d))
      );
      return isCurrentlyUpvoted ? prev.filter(i => i !== id) : [...prev, id];
    });
  }, []);

  const handleToggleBookmark = useCallback((id: string) => {
    setBookmarkedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const handleClaim = useCallback((id: string) => {
    setDeals(prev =>
      prev.map(d => (d.id === id ? { ...d, claimsCount: (d.claimsCount || 0) + 1 } : d))
    );
  }, []);

  const handleReportExpired = useCallback((id: string) => {
    setDeals(prev =>
      prev.map(d => (d.id === id ? { ...d, status: 'expired' } : d))
    );
  }, []);

  const handleSubmitNewDeal = (newDeal: Deal) => {
    const customDeals = safeLoadLocalStorage<Deal[]>('freebieverse_custom_deals', [], Array.isArray);
    const updatedCustom = [newDeal, ...customDeals];
    safeSetLocalStorage('freebieverse_custom_deals', updatedCustom);
    setDeals(prev => [newDeal, ...prev]);
  };

  // Category counts computation
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryId, number> = {
      all: deals.length,
      birthday: 0,
      tech: 0,
      finance: 0,
      samples: 0,
      food: 0,
      entertainment: 0,
    };

    deals.forEach(d => {
      if (counts[d.category] !== undefined) {
        counts[d.category]++;
      }
    });

    return counts;
  }, [deals]);

  // Overall statistics derived dynamically
  const { totalClaimsCount, verifiedCount } = useMemo(() => {
    let claimsSum = 0;
    let vCount = 0;
    deals.forEach(d => {
      claimsSum += d.claimsCount || 0;
      if (d.status === 'verified') vCount++;
    });
    return { totalClaimsCount: claimsSum, verifiedCount: vCount };
  }, [deals]);

  // Filtered Deals
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      // Category filter
      if (selectedCategory !== 'all' && deal.category !== selectedCategory) {
        return false;
      }
      // Saved filter
      if (showSavedOnly && !bookmarkedIds.includes(deal.id)) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = deal.title.toLowerCase().includes(q);
        const matchesProvider = deal.provider.toLowerCase().includes(q);
        const matchesDesc = deal.shortDesc.toLowerCase().includes(q);
        const matchesValue = deal.valueText.toLowerCase().includes(q);
        const matchesCode = deal.promoCode?.toLowerCase().includes(q);
        return matchesTitle || matchesProvider || matchesDesc || matchesValue || matchesCode;
      }

      return true;
    });
  }, [deals, selectedCategory, searchQuery, showSavedOnly, bookmarkedIds]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background Blobs */}
      <div className="bg-gradient-mesh">
        <div className="bg-blob-1"></div>
        <div className="bg-blob-2"></div>
        <div className="bg-blob-3"></div>
      </div>

      {/* Sticky Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (q.trim().length > 2) trackEvent('search_query', { query: q });
        }}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        savedCount={bookmarkedIds.length}
        showSavedOnly={showSavedOnly}
        setShowSavedOnly={setShowSavedOnly}
      />

      {/* Hero Section */}
      <HeroSection
        onSelectTag={(tag) => {
          setSearchQuery(tag);
          trackEvent('hero_tag_clicked', { tag });
        }}
        totalDeals={deals.length}
        totalClaimsCount={totalClaimsCount}
        verifiedCount={verifiedCount}
      />

      {/* Main Content Area */}
      <main className="container" style={{ flex: 1 }}>
        {/* Category Tab Bar */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            setShowSavedOnly(false);
            trackEvent('category_selected', { category: catId });
          }}
          categoryCounts={categoryCounts}
        />

        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1.5rem 0 0.5rem 0' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {showSavedOnly
              ? `Saved Offers (${filteredDeals.length})`
              : selectedCategory === 'all'
              ? 'All Offers Catalog'
              : CATEGORIES.find(c => c.id === selectedCategory)?.name}
          </h2>

          {(searchQuery || selectedCategory !== 'all' || showSavedOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setShowSavedOnly(false);
                addToast('Filters reset', 'info');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                color: 'var(--accent-primary)',
                fontWeight: 600
              }}
            >
              <RefreshCw size={14} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Deals Card Grid */}
        {filteredDeals.length > 0 ? (
          <div className="deals-grid">
            {filteredDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                onSelectDeal={(d) => setSelectedDealId(d.id)}
                onUpvote={handleUpvote}
                isUpvoted={upvotedIds.includes(deal.id)}
                onToggleBookmark={handleToggleBookmark}
                isBookmarked={bookmarkedIds.includes(deal.id)}
                onClaim={handleClaim}
                addToast={addToast}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div
            className="glass-panel"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              margin: '3rem 0',
              maxWidth: '540px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            <AlertCircle size={44} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>No offers matched your query</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Try adjusting your search terms or clearing category filters to explore more freebies.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setShowSavedOnly(false);
              }}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-gradient)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}
            >
              Show All Offers
            </button>
          </div>
        )}
      </main>

      {/* Deal Detail Modal */}
      <DealModal
        deal={selectedDeal}
        onClose={() => setSelectedDealId(null)}
        onUpvote={handleUpvote}
        isUpvoted={selectedDeal ? upvotedIds.includes(selectedDeal.id) : false}
        onToggleBookmark={handleToggleBookmark}
        isBookmarked={selectedDeal ? bookmarkedIds.includes(selectedDeal.id) : false}
        onClaim={handleClaim}
        onReportExpired={handleReportExpired}
        addToast={addToast}
      />

      {/* Submit Deal Modal */}
      <SubmitDealModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleSubmitNewDeal}
        addToast={addToast}
      />

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <Footer
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
      />
    </div>
  );
};
