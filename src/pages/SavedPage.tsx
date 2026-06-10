import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colleges } from '../data/colleges';
import { StarRating } from '../components/StarRating';
import { Badge } from '../components/Badge';

function formatFees(fees: number) {
  if (fees >= 100000) return `₹${(fees / 100000).toFixed(1)}L/yr`;
  return `₹${(fees / 1000).toFixed(0)}K/yr`;
}

interface SavedPageProps {
  onCompareToggle: (id: string) => void;
  compareList: string[];
}

export const SavedPage: React.FC<SavedPageProps> = ({ onCompareToggle, compareList }) => {
  const { user, savedColleges, toggleSaveCollege, savedComparisons, removeSavedComparison } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'colleges' | 'comparisons'>('colleges');
  const [removingId, setRemovingId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="saved-page">
        <div className="auth-required-state">
          <div className="auth-required-icon">🔒</div>
          <h2>Sign in to view saved items</h2>
          <p>Save colleges and comparisons to access them anytime.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const savedCollegeData = colleges.filter(c => savedColleges.includes(c.id));

  return (
    <div className="saved-page">
      <div className="saved-page-header">
        <div>
          <h1 className="page-title">My Saved Items</h1>
          <p className="page-subtitle">Hi {user.name.split(' ')[0]} 👋 — your personal college wishlist</p>
        </div>
      </div>

      <div className="saved-tabs">
        <button className={`saved-tab ${tab === 'colleges' ? 'saved-tab-active' : ''}`} onClick={() => setTab('colleges')}>
          Saved Colleges <span className="saved-tab-count">{savedColleges.length}</span>
        </button>
        <button className={`saved-tab ${tab === 'comparisons' ? 'saved-tab-active' : ''}`} onClick={() => setTab('comparisons')}>
          Saved Comparisons <span className="saved-tab-count">{savedComparisons.length}</span>
        </button>
      </div>

      {tab === 'colleges' && (
        <>
          {savedCollegeData.length === 0 ? (
            <div className="saved-empty">
              <span className="saved-empty-icon">🏫</span>
              <h3>No saved colleges yet</h3>
              <p>Click the bookmark icon on any college to save it here.</p>
              <button className="btn btn-primary" onClick={() => navigate('/colleges')}>Browse Colleges</button>
            </div>
          ) : (
            <div className="saved-colleges-grid">
              {savedCollegeData.map(college => (
                <div key={college.id} className="saved-college-card">
                  <div className="scc-header" style={{ background: college.coverColor }}>
                    <span className="scc-logo">{college.shortName}</span>
                    <button
                      className="scc-unsave"
                      onClick={() => { setRemovingId(college.id); toggleSaveCollege(college.id); }}
                      title="Remove from saved"
                    >
                      {removingId === college.id ? '✓' : '🔖'}
                    </button>
                  </div>
                  <div className="scc-body">
                    <Link to={`/colleges/${college.id}`} className="scc-name">{college.name}</Link>
                    <p className="scc-location">📍 {college.location}</p>
                    <div className="scc-meta">
                      <StarRating rating={college.rating} size="sm" showNumber />
                      <span className="scc-fees">{formatFees(college.fees)}</span>
                    </div>
                    <div className="scc-badges">
                      <Badge variant={college.type === 'Government' ? 'green' : college.type === 'Private' ? 'purple' : 'blue'} size="sm">
                        {college.type}
                      </Badge>
                      <Badge variant="orange" size="sm">#{college.ranking.nirf} NIRF</Badge>
                    </div>
                  </div>
                  <div className="scc-footer">
                    <Link to={`/colleges/${college.id}`} className="btn btn-primary btn-sm">View</Link>
                    <button
                      className={`btn btn-sm ${compareList.includes(college.id) ? 'btn-compare-active' : 'btn-outline'}`}
                      onClick={() => onCompareToggle(college.id)}
                    >
                      {compareList.includes(college.id) ? '✓ Comparing' : '⇄ Compare'}
                    </button>
                    <button
                      className="btn btn-sm btn-outline"
                      style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                      onClick={() => toggleSaveCollege(college.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'comparisons' && (
        <>
          {savedComparisons.length === 0 ? (
            <div className="saved-empty">
              <span className="saved-empty-icon">⚖️</span>
              <h3>No saved comparisons yet</h3>
              <p>Save a comparison from the Compare page to access it here.</p>
              <button className="btn btn-primary" onClick={() => navigate('/compare')}>Go to Compare</button>
            </div>
          ) : (
            <div className="saved-comparisons-list">
              {savedComparisons.map(comp => {
                const compColleges = colleges.filter(c => comp.collegeIds.includes(c.id));
                return (
                  <div key={comp.id} className="saved-comparison-card">
                    <div className="scc2-header">
                      <div>
                        <h3 className="scc2-name">{comp.name}</h3>
                        <p className="scc2-date">Saved {new Date(comp.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <button
                        className="btn btn-sm btn-outline"
                        style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                        onClick={() => removeSavedComparison(comp.id)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="scc2-colleges">
                      {compColleges.map(c => (
                        <div key={c.id} className="scc2-college-pill" style={{ borderLeftColor: c.coverColor }}>
                          <span className="scc2-pill-logo" style={{ background: c.coverColor }}>{c.shortName}</span>
                          <div>
                            <p className="scc2-pill-name">{c.name}</p>
                            <p className="scc2-pill-loc">{c.city}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="scc2-footer">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          comp.collegeIds.forEach(id => {
                            if (!compareList.includes(id)) onCompareToggle(id);
                          });
                          navigate('/compare');
                        }}
                      >
                        Load Comparison →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
