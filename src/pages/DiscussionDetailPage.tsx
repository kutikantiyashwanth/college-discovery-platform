import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDiscussion } from '../context/DiscussionContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const DiscussionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDiscussion, addAnswer, toggleUpvoteDiscussion, toggleUpvoteAnswer, acceptAnswer, incrementView } = useDiscussion();
  const { user } = useAuth();

  const [answerBody, setAnswerBody] = useState('');
  const [answerError, setAnswerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const discussion = getDiscussion(id!);

  useEffect(() => {
    if (id) incrementView(id);
  }, [id]);

  if (!discussion) {
    return (
      <div className="not-found">
        <h2>Discussion not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/discussions')}>Back to Discussions</button>
      </div>
    );
  }

  const handleAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setShowAuth(true); return; }
    setAnswerError('');
    if (!answerBody.trim() || answerBody.trim().length < 20) {
      setAnswerError('Answer must be at least 20 characters.');
      return;
    }
    setSubmitting(true);
    addAnswer(discussion.id, answerBody.trim(), user.id, user.name, user.avatar);
    setAnswerBody('');
    setSubmitting(false);
  };

  const isAuthor = user?.id === discussion.authorId;
  const sortedAnswers = [...discussion.answers].sort((a, b) => {
    if (a.isAccepted !== b.isAccepted) return a.isAccepted ? -1 : 1;
    return b.upvotes - a.upvotes;
  });

  return (
    <div className="disc-detail-page">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/discussions">Discussions</Link>
        <span>›</span>
        <span className="breadcrumb-current">{discussion.title.slice(0, 50)}{discussion.title.length > 50 ? '…' : ''}</span>
      </nav>

      {/* Question */}
      <div className="disc-question-card">
        <div className="disc-question-vote-col">
          <button
            className={`disc-vote-btn-lg ${user && discussion.upvotedBy.includes(user.id) ? 'voted' : ''}`}
            onClick={() => user ? toggleUpvoteDiscussion(discussion.id, user.id) : setShowAuth(true)}
            title="Upvote"
          >
            ▲
          </button>
          <span className="disc-vote-count-lg">{discussion.upvotes}</span>
          <span className="disc-vote-label">votes</span>
        </div>

        <div className="disc-question-content">
          <h1 className="disc-question-title">{discussion.title}</h1>
          <div className="disc-question-meta">
            <div className="disc-meta-author">
              <span className="disc-avatar">{discussion.authorAvatar}</span>
              <span className="disc-author-name">{discussion.authorName}</span>
            </div>
            <span className="disc-meta-sep">·</span>
            <span className="disc-meta-time">{timeAgo(discussion.createdAt)}</span>
            <span className="disc-meta-sep">·</span>
            <span className="disc-meta-views">👁 {discussion.views} views</span>
            {discussion.collegeName && (
              <>
                <span className="disc-meta-sep">·</span>
                <Link to={`/colleges/${discussion.collegeId}`} className="disc-college-link">
                  🏫 {discussion.collegeName}
                </Link>
              </>
            )}
          </div>

          <div className="disc-question-body">{discussion.body}</div>

          <div className="disc-question-tags">
            {discussion.tags.map(t => <span key={t} className="disc-tag">{t}</span>)}
          </div>
        </div>
      </div>

      {/* Answers header */}
      <div className="disc-answers-header">
        <h2>{discussion.answers.length} Answer{discussion.answers.length !== 1 ? 's' : ''}</h2>
        {discussion.answers.length > 1 && (
          <span className="disc-answers-note">Sorted by: accepted first, then votes</span>
        )}
      </div>

      {/* Answers */}
      {discussion.answers.length === 0 ? (
        <div className="disc-no-answers">
          <span>💡</span>
          <p>No answers yet. Be the first to help!</p>
        </div>
      ) : (
        <div className="disc-answers-list">
          {sortedAnswers.map(answer => (
            <div key={answer.id} className={`disc-answer-card ${answer.isAccepted ? 'answer-accepted' : ''}`}>
              <div className="disc-answer-vote-col">
                <button
                  className={`disc-vote-btn-lg ${user && answer.upvotedBy.includes(user.id) ? 'voted' : ''}`}
                  onClick={() => user ? toggleUpvoteAnswer(discussion.id, answer.id, user.id) : setShowAuth(true)}
                >
                  ▲
                </button>
                <span className="disc-vote-count-lg">{answer.upvotes}</span>
                {isAuthor && (
                  <button
                    className={`disc-accept-btn ${answer.isAccepted ? 'accepted' : ''}`}
                    onClick={() => acceptAnswer(discussion.id, answer.id)}
                    title={answer.isAccepted ? 'Unmark as accepted' : 'Mark as accepted answer'}
                  >
                    ✓
                  </button>
                )}
                {answer.isAccepted && !isAuthor && (
                  <span className="disc-accepted-check" title="Accepted answer">✓</span>
                )}
              </div>

              <div className="disc-answer-content">
                {answer.isAccepted && (
                  <div className="disc-accepted-label">✓ Accepted Answer</div>
                )}
                <div className="disc-answer-body">{answer.body}</div>
                <div className="disc-answer-meta">
                  <div className="disc-meta-author">
                    <span className="disc-avatar">{answer.authorAvatar}</span>
                    <span className="disc-author-name">{answer.authorName}</span>
                  </div>
                  <span className="disc-meta-sep">·</span>
                  <span className="disc-meta-time">{timeAgo(answer.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Answer */}
      <div className="disc-post-answer">
        <h2>Your Answer</h2>
        {!user ? (
          <div className="disc-login-prompt">
            <p>You must be signed in to post an answer.</p>
            <button className="btn btn-primary" onClick={() => setShowAuth(true)}>Sign In to Answer</button>
          </div>
        ) : (
          <form onSubmit={handleAnswer} className="disc-answer-form">
            <textarea
              className="form-textarea disc-answer-textarea"
              placeholder="Write a helpful, detailed answer. Share your personal experience, data, or reasoning..."
              value={answerBody}
              onChange={e => setAnswerBody(e.target.value)}
              rows={7}
            />
            <div className="disc-answer-form-footer">
              {answerError && <p className="form-error" style={{ margin: 0 }}>{answerError}</p>}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="disc-answer-chars">{answerBody.length} chars</span>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Posting…' : 'Post Answer'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
