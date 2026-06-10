import React from 'react';
import { Link } from 'react-router-dom';
import type { College } from '../types';
import { StarRating } from './StarRating';
import { Badge } from './Badge';
import { useAuth } from '../context/AuthContext';

interface CollegeCardProps {
  college: College;
  isInCompare: boolean;
  canAdd: boolean;
  onCompareToggle: (id: string) => void;
  onAuthRequired?: () => void;
}

function formatFees(fees: number): string {
  if (fees >= 100000) return `₹${(fees / 100000).toFixed(1)}L/yr`;
  if (fees >= 1000) return `₹${(fees / 1000).toFixed(0)}K/yr`;
  return `₹${fees}/yr`;
}

const typeVariant: Record<string, 'blue' | 'green' | 'purple'> = {
  Government: 'green',
  Private: 'purple',
  Deemed: 'blue',
};

export const CollegeCard: React.FC<CollegeCardProps> = ({ college, isInCompare, canAdd, onCompareToggle, onAuthRequired }) => {
  const { isCollegeSaved, toggleSaveCollege, user } = useAuth();
  const saved = isCollegeSaved(college.id);
  const canToggle = isInCompare || canAdd;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { onAuthRequired?.(); return; }
    toggleSaveCollege(college.id);
  };

  return (
    <article className="college-card">
      <div className="card-header" style={{ background: college.coverColor }}>
        <div className="card-img-wrap">
          <img
            src={college.image}
            alt={college.name}
            className="card-img"
            loading="lazy"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="card-img-overlay" style={{ background: `linear-gradient(to bottom, ${college.coverColor}88 0%, ${college.coverColor}ee 100%)` }} />
        </div>
        <div className="card-header-top">
          <div className="card-logo-wrap">
            <span className="card-logo">{college.shortName}</span>
          </div>
          <div className="card-header-right">
            <div className="card-header-badges">
              <Badge variant={typeVariant[college.type] || 'gray'}>{college.type}</Badge>
              {college.ranking.nirf <= 10 && <Badge variant="orange">#{college.ranking.nirf} NIRF</Badge>}
            </div>
            <button
              className={`card-save-btn ${saved ? 'saved' : ''}`}
              onClick={handleSave}
              title={saved ? 'Remove from saved' : 'Save college'}
            >
              {saved ? '🔖' : '🔖'}
            </button>
          </div>
        </div>
      </div>

      <div className="card-body">
        <Link to={`/colleges/${college.id}`} className="card-title-link">
          <h3 className="card-title">{college.name}</h3>
        </Link>
        <p className="card-location">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {college.location}
        </p>

        <div className="card-rating">
          <StarRating rating={college.rating} size="sm" showNumber count={college.totalReviews} />
        </div>

        <div className="card-stats">
          <div className="stat">
            <span className="stat-label">Annual Fees</span>
            <span className="stat-value fees">{formatFees(college.fees)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Avg Package</span>
            <span className="stat-value">{formatFees(college.placements.avgPackage)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Placement</span>
            <span className="stat-value">{college.placements.placementRate}%</span>
          </div>
        </div>

        <div className="card-exams">
          {college.exams.slice(0, 2).map(exam => (
            <Badge key={exam} variant="gray" size="sm">{exam}</Badge>
          ))}
          {college.exams.length > 2 && <Badge variant="gray" size="sm">+{college.exams.length - 2}</Badge>}
        </div>
      </div>

      <div className="card-footer">
        <Link to={`/colleges/${college.id}`} className="btn btn-primary btn-sm">
          View Details
        </Link>
        <button
          className={`btn btn-sm ${isInCompare ? 'btn-compare-active' : 'btn-outline'}`}
          onClick={() => onCompareToggle(college.id)}
          disabled={!canToggle}
          title={!canToggle ? 'Max 3 colleges can be compared' : isInCompare ? 'Remove from compare' : 'Add to compare'}
        >
          {isInCompare ? '✓ Comparing' : '⇄ Compare'}
        </button>
      </div>
    </article>
  );
};
