import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { colleges } from '../data/colleges';
import { StarRating } from '../components/StarRating';
import { Badge } from '../components/Badge';

type Tab = 'overview' | 'courses' | 'placements' | 'reviews';

function formatFees(fees: number): string {
  if (fees >= 100000) return `₹${(fees / 100000).toFixed(1)}L`;
  if (fees >= 1000) return `₹${(fees / 1000).toFixed(0)}K`;
  return `₹${fees}`;
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

export const CollegeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  const college = colleges.find(c => c.id === id);

  if (!college) {
    return (
      <div className="not-found">
        <h2>College not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/colleges')}>Browse Colleges</button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'courses', label: 'Courses' },
    { id: 'placements', label: 'Placements' },
    { id: 'reviews', label: `Reviews (${college.reviews.length})` },
  ];

  return (
    <div className="detail-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/colleges">Colleges</Link>
        <span>›</span>
        <span>{college.shortName}</span>
      </nav>

      {/* Header */}
      <div className="detail-header">
        <div className="detail-header-img-wrap">
          <img
            src={college.image}
            alt={college.name}
            className="detail-header-img"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="detail-header-img-overlay" style={{ background: `linear-gradient(135deg, ${college.coverColor}dd 0%, ${college.coverColor}bb 100%)` }} />
        </div>
        <div className="detail-header-inner">
          <div className="detail-logo">{college.shortName}</div>
          <div className="detail-header-info">
            <div className="detail-header-badges">
              <Badge variant={typeVariant[college.type] || 'gray'} size="md">{college.type}</Badge>
              <Badge variant="orange" size="md">NIRF #{college.ranking.nirf}</Badge>
              {college.ranking.qs && <Badge variant="blue" size="md">QS #{college.ranking.qs}</Badge>}
            </div>
            <h1 className="detail-name">{college.name}</h1>
            <p className="detail-location">
              📍 {college.location} · Est. {college.established} · {college.accreditation}
            </p>
            <div className="detail-rating">
              <StarRating rating={college.rating} size="lg" showNumber count={college.totalReviews} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        {[
          { label: 'Annual Fees', value: formatFees(college.fees) },
          { label: 'Avg Package', value: formatPackage(college.placements.avgPackage) },
          { label: 'Highest Package', value: formatPackage(college.placements.highestPackage) },
          { label: 'Placement Rate', value: `${college.placements.placementRate}%` },
        ].map(stat => (
          <div key={stat.label} className="quick-stat">
            <span className="qs-value">{stat.value}</span>
            <span className="qs-label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`detail-tab ${tab === t.id ? 'tab-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="detail-content">
        {tab === 'overview' && (
          <div className="tab-overview">
            <div className="overview-grid">
              <div className="overview-main">
                <h2>About {college.shortName}</h2>
                <p className="overview-text">{college.overview}</p>

                <h3>Entrance Exams Accepted</h3>
                <div className="tags-wrap">
                  {college.exams.map(e => <Badge key={e} variant="blue" size="md">{e}</Badge>)}
                </div>

                <h3>Tags</h3>
                <div className="tags-wrap">
                  {college.tags.map(t => <Badge key={t} variant="gray" size="md">{t}</Badge>)}
                </div>
              </div>

              <div className="overview-side">
                <div className="info-card">
                  <h3>Quick Info</h3>
                  {[
                    { label: 'Established', value: college.established },
                    { label: 'Type', value: college.type },
                    { label: 'Accreditation', value: college.accreditation },
                    { label: 'Location', value: college.location },
                    { label: 'NIRF Rank', value: `#${college.ranking.nirf}` },
                  ].map(item => (
                    <div key={item.label} className="info-row">
                      <span className="info-label">{item.label}</span>
                      <span className="info-value">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="info-card">
                  <h3>Facilities</h3>
                  <div className="facilities-wrap">
                    {college.facilities.map(f => (
                      <span key={f} className="facility-tag">✓ {f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'courses' && (
          <div className="tab-courses">
            <h2>Available Courses</h2>
            <div className="courses-table-wrap">
              <table className="courses-table">
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Duration</th>
                    <th>Annual Fees</th>
                    <th>Seats</th>
                  </tr>
                </thead>
                <tbody>
                  {college.courses.map((course, i) => (
                    <tr key={i}>
                      <td className="course-name">{course.name}</td>
                      <td>{course.duration}</td>
                      <td className="course-fees">{formatFees(course.fees)}</td>
                      <td>{course.seats}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'placements' && (
          <div className="tab-placements">
            <h2>Placement Statistics ({college.placements.year})</h2>
            <div className="placement-stats-grid">
              {[
                { label: 'Average Package', value: formatPackage(college.placements.avgPackage), color: '#10b981' },
                { label: 'Highest Package', value: formatPackage(college.placements.highestPackage), color: '#6366f1' },
                { label: 'Placement Rate', value: `${college.placements.placementRate}%`, color: '#f59e0b' },
              ].map(stat => (
                <div key={stat.label} className="placement-stat-card" style={{ borderTopColor: stat.color }}>
                  <span className="ps-value" style={{ color: stat.color }}>{stat.value}</span>
                  <span className="ps-label">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Placement rate bar */}
            <div className="placement-bar-section">
              <div className="placement-bar-label">
                <span>Placement Rate</span>
                <span>{college.placements.placementRate}%</span>
              </div>
              <div className="placement-bar-bg">
                <div
                  className="placement-bar-fill"
                  style={{ width: `${college.placements.placementRate}%` }}
                />
              </div>
            </div>

            <div className="recruiters-section">
              <h3>Top Recruiters</h3>
              <div className="recruiters-wrap">
                {college.placements.topRecruiters.map(r => (
                  <div key={r} className="recruiter-badge">{r}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'reviews' && (
          <div className="tab-reviews">
            <div className="reviews-summary">
              <div className="reviews-score">
                <span className="reviews-big-score">{college.rating.toFixed(1)}</span>
                <StarRating rating={college.rating} size="lg" />
                <span className="reviews-total">{college.totalReviews.toLocaleString()} reviews</span>
              </div>
            </div>

            <div className="reviews-list">
              {college.reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-avatar">{review.author[0]}</div>
                    <div className="reviewer-info">
                      <p className="reviewer-name">{review.author}</p>
                      <p className="review-date">{new Date(review.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="review-rating">
                      <StarRating rating={review.rating} size="sm" showNumber />
                    </div>
                  </div>

                  <h4 className="review-title">{review.title}</h4>
                  <p className="review-body">{review.body}</p>

                  <div className="review-pros-cons">
                    <div className="pros">
                      <p className="pros-label">👍 Pros</p>
                      <ul>
                        {review.pros.map(p => <li key={p}>{p}</li>)}
                      </ul>
                    </div>
                    <div className="cons">
                      <p className="cons-label">👎 Cons</p>
                      <ul>
                        {review.cons.map(c => <li key={c}>{c}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
