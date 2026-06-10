import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { colleges } from '../data/colleges';
import type { College } from '../types';
import { StarRating } from '../components/StarRating';
import { Badge } from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';

interface ComparePageProps {
  compareList: string[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

function formatFees(fees: number): string {
  if (fees >= 100000) return `₹${(fees / 100000).toFixed(1)}L/yr`;
  if (fees >= 1000) return `₹${(fees / 1000).toFixed(0)}K/yr`;
  return `₹${fees}/yr`;
}

function formatPackage(pkg: number): string {
  if (pkg >= 10000000) return `₹${(pkg / 10000000).toFixed(1)} Cr`;
  if (pkg >= 100000) return `₹${(pkg / 100000).toFixed(1)}L`;
  return `₹${(pkg / 1000).toFixed(0)}K`;
}

const typeVariant: Record<string, 'blue' | 'green' | 'purple'> = {
  Government: 'green',
  Private: 'purple',
  Deemed: 'blue',
};

interface CompareRowProps {
  label: string;
  values: (string | React.ReactNode)[];
  highlight?: boolean;
  highlightIndex?: number;
}

const CompareRow: React.FC<CompareRowProps> = ({ label, values, highlightIndex }) => (
  <tr className="compare-row">
    <td className="compare-label">{label}</td>
    {values.map((val, i) => (
      <td
        key={i}
        className={`compare-cell ${i === highlightIndex ? 'cell-best' : ''}`}
      >
        {val}
      </td>
    ))}
    {/* Fill empty columns if less than 3 colleges */}
    {Array.from({ length: 3 - values.length }).map((_, i) => (
      <td key={`empty-${i}`} className="compare-cell compare-empty-cell">—</td>
    ))}
  </tr>
);

export const ComparePage: React.FC<ComparePageProps> = ({ compareList, onRemove, onClear }) => {
  const navigate = useNavigate();
  const { user, saveComparison } = useAuth();
  const [addQuery, setAddQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedColleges: College[] = compareList
    .map(id => colleges.find(c => c.id === id))
    .filter(Boolean) as College[];

  const searchResults = addQuery.length > 1
    ? colleges
        .filter(c =>
          !compareList.includes(c.id) &&
          (c.name.toLowerCase().includes(addQuery.toLowerCase()) ||
           c.shortName.toLowerCase().includes(addQuery.toLowerCase()))
        )
        .slice(0, 6)
    : [];

  // Find best values for highlighting
  const bestRating = selectedColleges.length > 0 ? Math.max(...selectedColleges.map(c => c.rating)) : 0;
  const lowestFees = selectedColleges.length > 0 ? Math.min(...selectedColleges.map(c => c.fees)) : Infinity;
  const bestPackage = selectedColleges.length > 0 ? Math.max(...selectedColleges.map(c => c.placements.avgPackage)) : 0;
  const bestPlacement = selectedColleges.length > 0 ? Math.max(...selectedColleges.map(c => c.placements.placementRate)) : 0;
  const bestRanking = selectedColleges.length > 0 ? Math.min(...selectedColleges.map(c => c.ranking.nirf)) : Infinity;

  if (compareList.length === 0) {
    return (
      <div className="compare-page">
        <div className="compare-empty">
          <div className="compare-empty-icon">⚖️</div>
          <h2>No colleges to compare yet</h2>
          <p>Add colleges from the listing page to compare them side-by-side</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/colleges')}>
            Browse Colleges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-page">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <div className="compare-page-header">
        <div>
          <h1 className="page-title">Compare Colleges</h1>
          <p className="page-subtitle">Side-by-side comparison of {selectedColleges.length} college{selectedColleges.length > 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {compareList.length < 3 && (
            <div style={{ position: 'relative' }}>
              <button className="btn btn-outline" onClick={() => setAddOpen(v => !v)}>
                + Add College
              </button>
              {addOpen && (
                <div className="add-college-dropdown">
                  <input
                    autoFocus
                    className="add-college-input"
                    placeholder="Search college..."
                    value={addQuery}
                    onChange={e => setAddQuery(e.target.value)}
                  />
                  {searchResults.length > 0 && (
                    <ul className="add-college-results">
                      {searchResults.map(c => (
                        <li key={c.id}>
                          <button
                            className="add-college-result-btn"
                            onClick={() => {
                              navigate(`/colleges?search=${encodeURIComponent(c.shortName)}`);
                              setAddOpen(false);
                              setAddQuery('');
                            }}
                          >
                            <span className="acr-name">{c.name}</span>
                            <span className="acr-loc">{c.city}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {addQuery.length > 1 && searchResults.length === 0 && (
                    <p className="add-no-results">No results found</p>
                  )}
                </div>
              )}
            </div>
          )}
          <button className="btn btn-outline" onClick={onClear}>Clear All</button>
          {selectedColleges.length >= 2 && (
            <div style={{ position: 'relative' }}>
              {!showSaveForm ? (
                <button
                  className="btn btn-outline"
                  onClick={() => { if (!user) { setShowAuth(true); return; } setSaveName(`My ${selectedColleges.map(c => c.shortName).join(' vs ')} Comparison`); setShowSaveForm(true); }}
                >
                  🔖 Save Comparison
                </button>
              ) : (
                <div className="save-comparison-form">
                  <input
                    autoFocus className="form-input" style={{ fontSize: 13 }}
                    placeholder="Name this comparison…"
                    value={saveName} onChange={e => setSaveName(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setShowSaveForm(false)}>Cancel</button>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={saved}
                      onClick={() => {
                        if (saveName.trim()) {
                          saveComparison(saveName.trim(), compareList);
                          setSaved(true);
                          setTimeout(() => { setShowSaveForm(false); setSaved(false); }, 1200);
                        }
                      }}
                    >
                      {saved ? '✓ Saved!' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Best badge legend */}
      <div className="compare-legend">
        <span className="legend-badge best-badge">★ Best</span>
        <span style={{ fontSize: 13, color: '#6b7280' }}>— highlighted cells indicate the best value</span>
      </div>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="compare-th-label">Criteria</th>
              {selectedColleges.map(c => (
                <th key={c.id} className="compare-th-college">
                  <div className="compare-college-head">
                    <div className="compare-college-logo" style={{ background: c.coverColor }}>
                      {c.shortName}
                    </div>
                    <Link to={`/colleges/${c.id}`} className="compare-college-name">{c.name}</Link>
                    <p className="compare-college-loc">📍 {c.city}</p>
                    <button className="compare-remove-btn" onClick={() => onRemove(c.id)}>✕ Remove</button>
                  </div>
                </th>
              ))}
              {Array.from({ length: 3 - selectedColleges.length }).map((_, i) => (
                <th key={`ph-${i}`} className="compare-th-college compare-th-placeholder">
                  <div className="compare-placeholder-cell">
                    <span>+</span>
                    <p>Add College</p>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/colleges')}>Browse</button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Basic Info */}
            <tr className="compare-section-row">
              <td colSpan={4} className="compare-section-label">📋 Basic Information</td>
            </tr>
            <CompareRow
              label="Type"
              values={selectedColleges.map(c => <Badge key={c.id} variant={typeVariant[c.type] || 'gray'}>{c.type}</Badge>)}
            />
            <CompareRow
              label="Accreditation"
              values={selectedColleges.map(c => c.accreditation)}
            />
            <CompareRow
              label="Established"
              values={selectedColleges.map(c => c.established.toString())}
            />
            <CompareRow
              label="NIRF Rank"
              values={selectedColleges.map(c => `#${c.ranking.nirf}`)}
              highlightIndex={selectedColleges.findIndex(c => c.ranking.nirf === bestRanking)}
            />
            <CompareRow
              label="Rating"
              values={selectedColleges.map(c => <StarRating key={c.id} rating={c.rating} size="sm" showNumber />)}
              highlightIndex={selectedColleges.findIndex(c => c.rating === bestRating)}
            />

            {/* Fees */}
            <tr className="compare-section-row">
              <td colSpan={4} className="compare-section-label">💰 Fees</td>
            </tr>
            <CompareRow
              label="Annual Fees"
              values={selectedColleges.map(c => (
                <span key={c.id} className={c.fees === lowestFees ? 'value-best' : ''}>{formatFees(c.fees)}</span>
              ))}
              highlightIndex={selectedColleges.findIndex(c => c.fees === lowestFees)}
            />
            <CompareRow
              label="Courses Offered"
              values={selectedColleges.map(c => c.courses.length.toString())}
            />

            {/* Placements */}
            <tr className="compare-section-row">
              <td colSpan={4} className="compare-section-label">🎯 Placements</td>
            </tr>
            <CompareRow
              label="Avg Package"
              values={selectedColleges.map(c => (
                <span key={c.id} className={c.placements.avgPackage === bestPackage ? 'value-best' : ''}>
                  {formatPackage(c.placements.avgPackage)}
                </span>
              ))}
              highlightIndex={selectedColleges.findIndex(c => c.placements.avgPackage === bestPackage)}
            />
            <CompareRow
              label="Highest Package"
              values={selectedColleges.map(c => formatPackage(c.placements.highestPackage))}
              highlightIndex={selectedColleges.findIndex(c => c.placements.highestPackage === Math.max(...selectedColleges.map(x => x.placements.highestPackage)))}
            />
            <CompareRow
              label="Placement Rate"
              values={selectedColleges.map(c => (
                <div key={c.id} className="mini-bar-wrap">
                  <div className="mini-bar-bg">
                    <div
                      className="mini-bar-fill"
                      style={{
                        width: `${c.placements.placementRate}%`,
                        background: c.placements.placementRate === bestPlacement ? '#10b981' : '#6366f1',
                      }}
                    />
                  </div>
                  <span className="mini-bar-label">{c.placements.placementRate}%</span>
                </div>
              ))}
              highlightIndex={selectedColleges.findIndex(c => c.placements.placementRate === bestPlacement)}
            />
            <CompareRow
              label="Top Recruiters"
              values={selectedColleges.map(c => (
                <div key={c.id} className="recruiter-mini-list">
                  {c.placements.topRecruiters.slice(0, 3).map(r => (
                    <span key={r} className="recruiter-mini">{r}</span>
                  ))}
                </div>
              ))}
            />

            {/* Location */}
            <tr className="compare-section-row">
              <td colSpan={4} className="compare-section-label">📍 Location</td>
            </tr>
            <CompareRow
              label="City"
              values={selectedColleges.map(c => c.city)}
            />
            <CompareRow
              label="State"
              values={selectedColleges.map(c => c.state)}
            />

            {/* Exams */}
            <tr className="compare-section-row">
              <td colSpan={4} className="compare-section-label">📝 Entrance Exams</td>
            </tr>
            <CompareRow
              label="Accepted Exams"
              values={selectedColleges.map(c => (
                <div key={c.id} className="exam-tags">
                  {c.exams.map(e => <Badge key={e} variant="blue" size="sm">{e}</Badge>)}
                </div>
              ))}
            />
          </tbody>
        </table>
      </div>

      <div className="compare-actions">
        <button className="btn btn-outline" onClick={() => navigate('/colleges')}>
          ← Back to Colleges
        </button>
      </div>
    </div>
  );
};
