import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDiscussion } from '../context/DiscussionContext';
import { useAuth } from '../context/AuthContext';
import { colleges } from '../data/colleges';
import { AuthModal } from '../components/AuthModal';

const ALL_TAGS = ['JEE', 'CAT', 'Placements', 'Fees', 'Campus Life', 'Comparison', 'MBA', 'CSE', 'ECE', 'Career'];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const DiscussionPage: React.FC = () => {
  const { discussions, addDiscussion, toggleUpvoteDiscussion } = useDiscussion();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sort, setSort] = useState<'newest' | 'popular' | 'unanswered'>('newest');
  const [showAskForm, setShowAskForm] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Ask form state
  const [askTitle, setAskTitle] = useState('');
  const [askBody, setAskBody] = useState('');
  const [askTags, setAskTags] = useState<string[]>([]);
  const [askCollege, setAskCollege] = useState('');
  const [askError, setAskError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    let list = [...discussions];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.body.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q)) ||
        (d.collegeName?.toLowerCase().includes(q))
      );
    }
    if (selectedTag) {
      list = list.filter(d => d.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()));
    }
    if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sort === 'popular') list.sort((a, b) => b.upvotes - a.upvotes);
    if (sort === 'unanswered') list = list.filter(d => d.answers.length === 0);
    return list;
  }, [discussions, search, selectedTag, sort]);

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    setAskError('');
    if (!askTitle.trim()) { setAskError('Please add a title.'); return; }
    if (askTitle.trim().length < 15) { setAskError('Title must be at least 15 characters.'); return; }
    if (!askBody.trim()) { setAskError('Please describe your question.'); return; }

    setSubmitting(true);
    const college = colleges.find(c => c.id === askCollege);
    const d = addDiscussion(
      askTitle.trim(), askBody.trim(), askTags,
      askCollege || undefined, college?.name
    );
    setSubmitting(false);
    setAskTitle(''); setAskBody(''); setAskTags([]); setAskCollege('');
    setShowAskForm(false);
    navigate(`/discussions/${d.id}`);
  };

  const toggleAskTag = (tag: string) => {
    setAskTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag].slice(0, 5));
  };

  const handleAskClick = () => {
    if (!user) { setShowAuth(true); return; }
    setShowAskForm(true);
    setTimeout(() => document.getElementById('ask-title-input')?.focus(), 100);
  };

  return (
    <div className="discussion-page">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      <div className="disc-page-header">
        <div>
          <h1 className="page-title">Q&amp;A Discussions</h1>
          <p className="page-subtitle">Ask questions, share knowledge, help others choose their college</p>
        </div>
        <button className="btn btn-primary" onClick={handleAskClick}>
          + Ask a Question
        </button>
      </div>

      {/* Ask Form */}
      {showAskForm && (
        <div className="ask-form-card">
          <div className="ask-form-header">
            <h2>Ask a Question</h2>
            <button className="btn-ghost btn-sm" onClick={() => setShowAskForm(false)}>✕</button>
          </div>
          <form onSubmit={handleAsk} className="ask-form">
            <div className="form-group">
              <label className="form-label" htmlFor="ask-title-input">Question Title *</label>
              <input
                id="ask-title-input" className="form-input"
                placeholder="e.g. What is the best branch at IIT Bombay for placements?"
                value={askTitle} onChange={e => setAskTitle(e.target.value)}
                maxLength={140}
              />
              <span className="char-count">{askTitle.length}/140</span>
            </div>
            <div className="form-group">
              <label className="form-label">Details *</label>
              <textarea
                className="form-textarea"
                placeholder="Provide context — your rank, background, what you've already considered..."
                value={askBody} onChange={e => setAskBody(e.target.value)}
                rows={5}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Related College (optional)</label>
              <select className="form-select" value={askCollege} onChange={e => setAskCollege(e.target.value)}>
                <option value="">Not specific to a college</option>
                {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tags (up to 5)</label>
              <div className="ask-tags-wrap">
                {ALL_TAGS.map(tag => (
                  <button
                    key={tag} type="button"
                    className={`ask-tag-chip ${askTags.includes(tag) ? 'ask-tag-active' : ''}`}
                    onClick={() => toggleAskTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            {askError && <p className="form-error">{askError}</p>}
            <div className="ask-form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowAskForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Posting…' : 'Post Question'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="disc-filters">
        <div className="disc-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#9ca3af', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="disc-search-input"
            placeholder="Search discussions..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        <div className="disc-sort-tabs">
          {(['newest', 'popular', 'unanswered'] as const).map(s => (
            <button key={s} className={`disc-sort-btn ${sort === s ? 'disc-sort-active' : ''}`} onClick={() => setSort(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tag filter pills */}
      <div className="disc-tag-filters">
        <button className={`disc-tag-pill ${!selectedTag ? 'disc-tag-pill-active' : ''}`} onClick={() => setSelectedTag('')}>All</button>
        {ALL_TAGS.map(tag => (
          <button key={tag} className={`disc-tag-pill ${selectedTag === tag ? 'disc-tag-pill-active' : ''}`} onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}>
            {tag}
          </button>
        ))}
      </div>

      <div className="disc-layout">
        {/* Questions list */}
        <div className="disc-list">
          <p className="results-count"><strong>{filtered.length}</strong> discussion{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">💬</span>
              <h3>No discussions found</h3>
              <p>Be the first to ask a question!</p>
              <button className="btn btn-primary" onClick={handleAskClick}>Ask a Question</button>
            </div>
          ) : (
            filtered.map(d => (
              <Link to={`/discussions/${d.id}`} key={d.id} className="disc-card">
                <div className="disc-card-votes">
                  <button
                    className={`disc-vote-btn ${user && d.upvotedBy.includes(user.id) ? 'voted' : ''}`}
                    onClick={e => { e.preventDefault(); if (user) toggleUpvoteDiscussion(d.id, user.id); else setShowAuth(true); }}
                    title="Upvote"
                  >
                    ▲
                  </button>
                  <span className="disc-vote-count">{d.upvotes}</span>
                </div>
                <div className="disc-card-body">
                  <div className="disc-card-top">
                    {d.answers.some(a => a.isAccepted) && <span className="disc-accepted-badge">✓ Answered</span>}
                    <h3 className="disc-card-title">{d.title}</h3>
                  </div>
                  <p className="disc-card-excerpt">{d.body.slice(0, 120)}{d.body.length > 120 ? '…' : ''}</p>
                  <div className="disc-card-meta">
                    <div className="disc-card-tags">
                      {d.tags.slice(0, 3).map(t => <span key={t} className="disc-tag">{t}</span>)}
                      {d.collegeName && <span className="disc-college-tag">🏫 {d.collegeName}</span>}
                    </div>
                    <div className="disc-card-stats">
                      <span>💬 {d.answers.length}</span>
                      <span>👁 {d.views}</span>
                      <span className="disc-author">
                        <span className="disc-avatar-sm">{d.authorAvatar}</span>
                        {d.authorName}
                      </span>
                      <span className="disc-time">{timeAgo(d.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Sidebar */}
        <aside className="disc-sidebar">
          <div className="disc-sidebar-card">
            <h3>Discussion Stats</h3>
            <div className="disc-stat-row"><span>Total Questions</span><strong>{discussions.length}</strong></div>
            <div className="disc-stat-row"><span>Answered</span><strong>{discussions.filter(d => d.answers.some(a => a.isAccepted)).length}</strong></div>
            <div className="disc-stat-row"><span>Unanswered</span><strong>{discussions.filter(d => d.answers.length === 0).length}</strong></div>
          </div>
          <div className="disc-sidebar-card">
            <h3>Popular Tags</h3>
            <div className="disc-popular-tags">
              {ALL_TAGS.map(tag => {
                const count = discussions.filter(d => d.tags.some(t => t.toLowerCase() === tag.toLowerCase())).length;
                return (
                  <button key={tag} className="disc-popular-tag" onClick={() => setSelectedTag(tag)}>
                    <span>{tag}</span><span className="disc-tag-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
