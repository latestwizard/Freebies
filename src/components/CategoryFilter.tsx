import React from 'react';
import { CATEGORIES } from '../data/deals';
import { CategoryId } from '../types';
import { Sparkles, Code, Coins, Gift, Utensils, Tv, Cake } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  categoryCounts: Record<CategoryId, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles size={18} />;
      case 'Code': return <Code size={18} />;
      case 'Coins': return <Coins size={18} />;
      case 'Gift': return <Gift size={18} />;
      case 'Utensils': return <Utensils size={18} />;
      case 'Tv': return <Tv size={18} />;
      case 'Cake': return <Cake size={18} />;
      default: return <Sparkles size={18} />;
    }
  };

  return (
    <div style={{ margin: '1.5rem 0', overflowX: 'auto', paddingBottom: '0.5rem' }}>
      <div role="tablist" aria-label="Freebie Categories" style={{ display: 'flex', gap: '0.75rem', minWidth: 'max-content' }}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isSelected}
              aria-label={`Filter by ${cat.name} (${count} offers available)`}
              onClick={() => onSelectCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                background: isSelected ? 'var(--accent-gradient)' : 'var(--bg-card)',
                border: `1px solid ${isSelected ? 'transparent' : 'var(--border-color)'}`,
                color: isSelected ? '#ffffff' : 'var(--text-primary)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.9rem',
                boxShadow: isSelected ? '0 4px 14px rgba(139, 92, 246, 0.3)' : 'none',
                transition: 'all var(--transition-fast)',
                cursor: 'pointer'
              }}
            >
              <span style={{ color: isSelected ? '#ffffff' : 'var(--accent-primary)', display: 'flex' }}>
                {getCategoryIcon(cat.icon)}
              </span>
              <span>{cat.name}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  background: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-input)',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
