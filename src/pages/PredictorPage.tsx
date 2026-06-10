import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colleges, RANK_THRESHOLDS } from '../data/colleges';
import type { College, PredictorInput } from '../types';
import { StarRating } from '../components/StarRating';
import { Badge } from '../components/Badge';

interface CompareProps {
  compareList: string[];
  canAdd: boolean;
  onCompareToggle: (id: string) => void;
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

const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const CATEGORY_MULTIPLIERS: Record<string, number> = {
  General: 1,
  EWS: 1.2,
  OBC: 1.5,
  SC: 2.5,
  ST: 3.0,
};

const typeVariant: Record<string, 'blue' | 'green' | 'purple'> = {
  Government: 'green',
  Private: 'purple',
  Deemed: 'blue',
};

const SUPPORTED_EXAMS = Object.keys(RANK_THRESHOLDS);

type Chance = 'High' | 'Medium' | 'Low';

interface PredictedCollege {
  college: College;
  chance: Chance;
}

export const PredictorPage: React.FC<CompareProps> = ({ compareList, canAdd, onCompareToggle }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState<PredictorInput>({
    exam: '',
    rank: 0,
    category: 'General',
    preferredState: '',
  });
  const [rankStr, setRankStr] = useState('');
  const [results, setResults] = useState<PredictedCollege[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const predict = () => {
    setError('');
    if (!input.exam) { setError('Please select an entrance exam.'); return; }
    if (!rankStr || isNaN(Number(rankStr)) || Number(rankStr) <= 0) {
      setError('Please enter a valid rank.'); return;
    }

    const rank = Number(rankStr);
    const multiplier = CATEGORY_MULTIPLIERS[input.category] || 1;
    const effectiveRank = Math.floor(rank / multiplier);

    const thresholds = RANK_THRESHOLDS[input.exam];

    if (!thresholds) {
      // Fallback: show top colleges for this exam
      const fallback = colleges
        .filter(c => c.exams.includes(input.exam))
        .sort((a, b) => a.ranking.nirf - b.ranking.nirf)
        .slice(0, 5)
        .map(c => ({ college: c, chance: 'Medium' as Chance }));
      setResults(fallback);
      setHasSearched(true);
      return;
    }

    // Find the matching tier
    const tier = thresholds.find(t => effectiveRank <= t.maxRank);

    let predictedIds: string[] = [];
    let primaryChance: Chance = 'High';

    if (tier) {
      predictedIds = tier.collegeIds;
      primaryChance = effectiveRank <= tier.maxRank * 0.5 ? 'High' : 'Medium';
    } else {
      // Rank is too high — show last tier with Low chance
      const lastTier = thresholds[thresholds.length - 1];
      predictedIds = lastTier.collegeIds;
      primaryChance = 'Low';
    }

    // Also add borderline colleges from adjacent tier
    const tierIndex = tier ? thresholds.indexOf(tier) : thresholds.length - 1;
    const nextTier = thresholds[tierIndex + 1];
    const borderlineIds = nextTier ? nextTier.collegeIds.filter(id => !predictedIds.includes(id)) : [];

    const predicted: PredictedCollege[] = [
      ...predictedIds.map(id => {
        const college = colleges.find(c => c.id === id);
        if (!college) return null;
        return { college, chance: primaryChance };
      }).filter(Boolean) as PredictedCollege[],
      ...borderlineIds.slice(0, 2).map(id => {
        const college = colleges.find(c => c.id === id);
        if (!college) return null;
        return { college, chance: 'Low' as Chance };
      }).filter(Boolean) as PredictedCollege[],
    ];

    // Apply state preference boost — move preferred state colleges to top
    if (input.preferredState) {
      predicted.sort((a, b) => {
        const aMatch = a.college.state === input.preferredState ? -1 : 1;
        const bMatch = b.college.state === input.preferredState ? -1 : 1;
        return aMatch - bMatch;
      });
    }

    setResults(predicted.slice(0, 6));
    setHasSearched(true);
  };

  const chanceColors: Record<Chance, { bg: string; color: string; label: string }> = {
    High: { bg: '#dcfce7', color: '#15803d', label: '✓ High Chance' },
    Medium: { bg: '#fef9c3', color: '#92400e', label: '~ Moderate Chance' },
    Low: { bg: '#fee2e2', color: '#b91c1c', label: '△ Low Chance' },
  };

  return (
    <div className="predictor-page">
      <div className="predictor-hero">
        <div className="predictor-hero-content">
          <div className="predictor-badge">🎯 AI-Powered</div>
          <h1 className="page-title">College Rank Predictor</h1>
          <p className="page-subtitle">
            Enter your entrance exam and rank to discover colleges where you have the best admission chances.
          </p>
        </div>
      </div>

      <div className="predictor-layout">
        {/* Input Form */}
        <div className="predictor-form-card">
          <h2 className="predictor-form-title">Enter Your Details</h2>

          <div className="form-group">
            <label className="form-label">Entrance Exam *</label>
            <div className="exam-grid">
              {SUPPORTED_EXAMS.map(exam => (
                <button
                  key={exam}
                  className={`exam-chip ${input.exam === exam ? 'exam-chip-active' : ''}`}
                  onClick={() => setInput(p => ({ ...p, exam }))}
                >
                  {exam}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="rank">Your Rank *</label>
            <input
              id="rank"
              type="number"
              className="form-input"
              placeholder="e.g. 5000"
              value={rankStr}
              min={1}
              onChange={e => setRankStr(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="category-grid">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`category-chip ${input.category === cat ? 'category-chip-active' : ''}`}
                  onClick={() => setInput(p => ({ ...p, category: cat }))}
                >
                  {cat}
                </button>
              ))}
            </div>
            {input.category !== 'General' && (
              <p className="category-note">
                ℹ️ Category relaxation applied: effective rank ~{Math.floor(Number(rankStr || 0) / CATEGORY_MULTIPLIERS[input.category])}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="state">Preferred State (optional)</label>
            <select
              id="state"
              className="form-select"
              value={input.preferredState}
              onChange={e => setInput(p => ({ ...p, preferredState: e.target.value }))}
            >
              <option value="">Any State</option>
              {['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'West Bengal', 'Gujarat', 'Uttar Pradesh', 'Telangana'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn-primary btn-lg predictor-submit-btn" onClick={predict}>
            🔍 Predict My Colleges
          </button>
        </div>

        {/* Results */}
        <div className="predictor-results">
          {!hasSearched && (
            <div className="predictor-placeholder">
              <div className="predictor-placeholder-icon">🎓</div>
              <h3>Your college recommendations will appear here</h3>
              <p>Fill in your exam and rank on the left to get started</p>
              <div className="predictor-how">
                <h4>How it works</h4>
                <ol>
                  <li>Select your entrance exam</li>
                  <li>Enter your rank</li>
                  <li>Choose your category for relaxation</li>
                  <li>Get personalized college recommendations</li>
                </ol>
              </div>
            </div>
          )}

          {hasSearched && results && results.length === 0 && (
            <div className="predictor-no-results">
              <span>😔</span>
              <h3>No colleges found for this combination</h3>
              <p>Try a different exam or check colleges directly</p>
              <button className="btn btn-primary" onClick={() => navigate('/colleges')}>
                Browse All Colleges
              </button>
            </div>
          )}

          {hasSearched && results && results.length > 0 && (
            <>
              <div className="results-header">
                <h2>Recommended Colleges</h2>
                <p>
                  Based on <strong>{input.exam}</strong> rank <strong>{Number(rankStr).toLocaleString()}</strong>
                  {input.category !== 'General' && ` (${input.category} category)`}
                </p>
              </div>

              <div className="predictor-results-list">
                {results.map(({ college, chance }, idx) => {
                  const cc = chanceColors[chance];
                  return (
                    <div key={college.id} className="predictor-result-card">
                      <div className="prc-rank">{idx + 1}</div>
                      <div className="prc-logo" style={{ background: college.coverColor }}>
                        {college.shortName}
                      </div>
                      <div className="prc-info">
                        <div className="prc-header">
                          <button className="prc-name" onClick={() => navigate(`/colleges/${college.id}`)}>
                            {college.name}
                          </button>
                          <span
                            className="chance-badge"
                            style={{ background: cc.bg, color: cc.color }}
                          >
                            {cc.label}
                          </span>
                        </div>
                        <p className="prc-location">📍 {college.location}</p>
                        <div className="prc-stats">
                          <span className="prc-stat">
                            <StarRating rating={college.rating} size="sm" showNumber />
                          </span>
                          <span className="prc-stat">💰 {formatFees(college.fees)}</span>
                          <span className="prc-stat">📈 Avg: {formatPackage(college.placements.avgPackage)}</span>
                          <span className="prc-stat">
                            <Badge variant={typeVariant[college.type] || 'gray'} size="sm">{college.type}</Badge>
                          </span>
                        </div>
                      </div>
                      <div className="prc-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/colleges/${college.id}`)}
                        >
                          Details
                        </button>
                        <button
                          className={`btn btn-sm ${compareList.includes(college.id) ? 'btn-compare-active' : 'btn-outline'}`}
                          onClick={() => onCompareToggle(college.id)}
                          disabled={!canAdd && !compareList.includes(college.id)}
                        >
                          {compareList.includes(college.id) ? '✓' : '⇄'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="predictor-disclaimer">
                <strong>Disclaimer:</strong> These predictions are based on historical cutoff trends and are indicative only.
                Actual cutoffs may vary. Always verify with official counseling authorities.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
