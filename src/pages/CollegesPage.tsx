import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { colleges } from '../data/colleges';
import type { Filters, SortOption } from '../types';
import { CollegeCard } from '../components/CollegeCard';
import { FilterPanel } from '../components/FilterPanel';
import { useDebounce } from '../hooks/useDebounce';
import { AuthModal } from '../components/AuthModal';

interface CollegesPageProps {
  compareList: string[];
  canAdd: boolean;
  onCompareToggle: (id: string) => void;
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  type: [],
  state: [],
  exam: [],
  feesMin: 0,
  feesMax: 3000000,
  sort: 'rating',
};

const PAGE_SIZE = 9;

export const CollegesPage: React.FC<CollegesPageProps> = ({ compareList, canAdd, onCompareToggle }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    search: searchParams.get('search') || '',
  });
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 250);

  // Sync URL search param
  useEffect(() => {
    const s = searchParams.get('search') || '';
    if (s !== filters.search) {
      setFilters(f => ({ ...f, search: s }));
    }
  }, [searchParams]);

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1);
    if (newFilters.search !== filters.search) {
      setSearchParams(newFilters.search ? { search: newFilters.search } : {});
    }
  };

  const filtered = useMemo(() => {
    let result = [...colleges];

    // Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q)) ||
        c.courses.some(co => co.name.toLowerCase().includes(q))
      );
    }

    // Type filter
    if (filters.type.length > 0) {
      result = result.filter(c => filters.type.includes(c.type));
    }

    // State filter
    if (filters.state.length > 0) {
      result = result.filter(c => filters.state.includes(c.state));
    }

    // Exam filter
    if (filters.exam.length > 0) {
      result = result.filter(c => c.exams.some(e => filters.exam.includes(e)));
    }

    // Fees filter
    result = result.filter(c => c.fees <= filters.feesMax);

    // Sort
    switch (filters.sort as SortOption) {
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'ranking': result.sort((a, b) => a.ranking.nirf - b.ranking.nirf); break;
      case 'fees_asc': result.sort((a, b) => a.fees - b.fees); break;
      case 'fees_desc': result.sort((a, b) => b.fees - a.fees); break;
    }

    return result;
  }, [debouncedSearch, filters]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  return (
    <div className="colleges-page">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <div className="colleges-page-header">
        <div>
          <h1 className="page-title">Explore Colleges</h1>
          <p className="page-subtitle">Discover top colleges across India</p>
        </div>
        <button className="btn btn-outline mobile-only" onClick={() => setPanelOpen(v => !v)}>
          {panelOpen ? '✕ Close' : '⚡ Filters'}
        </button>
      </div>

      {/* Search bar */}
      <div className="colleges-search-bar">
        <div className="search-input-wrap">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search colleges, courses, cities..."
            value={filters.search}
            onChange={e => handleFiltersChange({ ...filters, search: e.target.value })}
          />
          {filters.search && (
            <button className="search-clear" onClick={() => handleFiltersChange({ ...filters, search: '' })}>✕</button>
          )}
        </div>
      </div>

      <div className="colleges-layout">
        {/* Filter panel */}
        <div className={`filter-panel-wrap ${panelOpen ? 'panel-open' : ''}`}>
          <FilterPanel
            filters={filters}
            onChange={handleFiltersChange}
            totalCount={colleges.length}
            filteredCount={filtered.length}
          />
        </div>

        {/* Results */}
        <main className="colleges-results">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🔍</span>
              <h3>No colleges found</h3>
              <p>Try adjusting your search or filters</p>
              <button className="btn btn-primary" onClick={() => handleFiltersChange(DEFAULT_FILTERS)}>
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <p className="results-count">
                Showing <strong>{paginated.length}</strong> of <strong>{filtered.length}</strong> colleges
              </p>
              <div className="colleges-grid">
                {paginated.map(college => (
                  <CollegeCard
                    key={college.id}
                    college={college}
                    isInCompare={compareList.includes(college.id)}
                    canAdd={canAdd}
                    onCompareToggle={onCompareToggle}
                    onAuthRequired={() => setShowAuth(true)}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="load-more-wrap">
                  <button className="btn btn-outline btn-lg load-more-btn" onClick={() => setPage(p => p + 1)}>
                    Load More Colleges ({filtered.length - paginated.length} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
