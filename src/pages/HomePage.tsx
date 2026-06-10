import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colleges } from '../data/colleges';

const POPULAR_SEARCHES = ['IIT', 'IIM', 'NIT', 'MBA', 'Engineering', 'Medical'];

const STATS = [
  { value: '20+', label: 'Top Colleges' },
  { value: '15+', label: 'States Covered' },
  { value: '10+', label: 'Entrance Exams' },
  { value: '50K+', label: 'Student Reviews' },
];

export const HomePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/colleges?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/colleges');
    }
  };

  const topColleges = [...colleges].sort((a, b) => a.ranking.nirf - b.ranking.nirf).slice(0, 6);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">🎓 India's College Discovery Platform</div>
          <h1 className="hero-title">
            Find Your Perfect<br />
            <span className="hero-accent">College in India</span>
          </h1>
          <p className="hero-subtitle">
            Search, compare and explore 20+ top colleges. Get placement stats,
            fee details, and rank-based predictions — all in one place.
          </p>

          <form onSubmit={handleSearch} className="hero-search-form">
            <div className="hero-search-box">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="hero-search-input"
                placeholder="Search by college name, course, city..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
              <button type="submit" className="hero-search-btn">Search</button>
            </div>
          </form>

          <div className="popular-searches">
            <span className="popular-label">Popular:</span>
            {POPULAR_SEARCHES.map(s => (
              <button
                key={s}
                className="popular-chip"
                onClick={() => navigate(`/colleges?search=${encodeURIComponent(s)}`)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="hero-stats">
          {STATS.map(stat => (
            <div key={stat.label} className="hero-stat">
              <span className="hero-stat-value">{stat.value}</span>
              <span className="hero-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2 className="section-title">Everything you need to decide</h2>
        <div className="features-grid">
          {[
            { icon: '🔍', title: 'Smart Search', desc: 'Filter by exam, state, type, fees and more to find the right fit.' },
            { icon: '⚖️', title: 'Side-by-Side Compare', desc: 'Compare up to 3 colleges on fees, placements and ratings.' },
            { icon: '🎯', title: 'Rank Predictor', desc: 'Enter your exam rank and get personalized college recommendations.' },
            { icon: '📊', title: 'Placement Data', desc: 'Real placement stats — average package, highest package, and top recruiters.' },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Colleges */}
      <section className="top-colleges-section">
        <div className="section-header">
          <h2 className="section-title">Top Ranked Colleges</h2>
          <button className="btn btn-outline" onClick={() => navigate('/colleges')}>View All →</button>
        </div>
        <div className="top-colleges-grid">
          {topColleges.map(college => (
            <button
              key={college.id}
              className="top-college-card"
              onClick={() => navigate(`/colleges/${college.id}`)}
            >
              <div className="tc-rank">#{college.ranking.nirf}</div>
              <div className="tc-logo" style={{ background: college.coverColor }}>{college.shortName}</div>
              <div className="tc-info">
                <p className="tc-name">{college.name}</p>
                <p className="tc-location">{college.city}, {college.state}</p>
                <p className="tc-rating">⭐ {college.rating} · {college.type}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Know your rank? Find your college.</h2>
          <p>Use our Predictor Tool to get personalized college recommendations based on your JEE, CAT, CUET rank and category.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/predictor')}>
            Try Rank Predictor →
          </button>
        </div>
      </section>
    </div>
  );
};
