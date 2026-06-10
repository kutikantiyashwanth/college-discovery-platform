import React from 'react';
import type { Filters, SortOption } from '../types';
import { STATES, COLLEGE_TYPES, EXAMS } from '../data/colleges';

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onChange, totalCount, filteredCount }) => {
  const toggle = (key: 'type' | 'state' | 'exam', value: string) => {
    const arr = filters[key] as string[];
    onChange({
      ...filters,
      [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
    });
  };

  const reset = () => {
    onChange({ search: '', type: [], state: [], exam: [], feesMin: 0, feesMax: 3000000, sort: 'rating' });
  };

  const hasFilters = filters.type.length > 0 || filters.state.length > 0 || filters.exam.length > 0 || filters.feesMax < 3000000;

  return (
    <aside className="filter-panel">
      <div className="filter-header">
        <span className="filter-title">Filters</span>
        <span className="filter-count">{filteredCount} of {totalCount}</span>
        {hasFilters && (
          <button className="filter-reset" onClick={reset}>Clear all</button>
        )}
      </div>

      <div className="filter-section">
        <label className="filter-section-label">Sort by</label>
        <select
          className="filter-select"
          value={filters.sort}
          onChange={e => onChange({ ...filters, sort: e.target.value as SortOption })}
        >
          <option value="rating">Top Rated</option>
          <option value="ranking">NIRF Ranking</option>
          <option value="fees_asc">Fees: Low to High</option>
          <option value="fees_desc">Fees: High to Low</option>
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-section-label">College Type</label>
        {COLLEGE_TYPES.map(type => (
          <label key={type} className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.type.includes(type)}
              onChange={() => toggle('type', type)}
            />
            <span>{type}</span>
          </label>
        ))}
      </div>

      <div className="filter-section">
        <label className="filter-section-label">State</label>
        <div className="filter-scroll">
          {STATES.map(state => (
            <label key={state} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.state.includes(state)}
                onChange={() => toggle('state', state)}
              />
              <span>{state}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-section-label">Entrance Exam</label>
        <div className="filter-scroll">
          {EXAMS.map(exam => (
            <label key={exam} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.exam.includes(exam)}
                onChange={() => toggle('exam', exam)}
              />
              <span>{exam}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-section-label">
          Max Annual Fees: <strong>₹{(filters.feesMax / 100000).toFixed(1)}L</strong>
        </label>
        <input
          type="range"
          min={0}
          max={3000000}
          step={50000}
          value={filters.feesMax}
          onChange={e => onChange({ ...filters, feesMax: Number(e.target.value) })}
          className="filter-range"
        />
        <div className="range-labels">
          <span>₹0</span>
          <span>₹30L</span>
        </div>
      </div>
    </aside>
  );
};
