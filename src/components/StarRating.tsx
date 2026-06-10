import React from 'react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  count?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, size = 'md', showNumber = false, count }) => {
  const sizes = { sm: 13, md: 16, lg: 20 };
  const px = sizes[size];
  const filled = Math.floor(rating);
  const partial = rating - filled;
  const uid = `star-${rating}-${Math.random().toString(36).slice(2,6)}`;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => {
        const gradId = `${uid}-${i}`;
        return (
          <svg key={i} width={px} height={px} viewBox="0 0 20 20" fill="none">
            {i <= filled ? (
              <polygon points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7" fill="#f59e0b" />
            ) : i === filled + 1 && partial > 0.1 ? (
              <>
                <defs>
                  <linearGradient id={gradId}>
                    <stop offset={`${partial * 100}%`} stopColor="#f59e0b" />
                    <stop offset={`${partial * 100}%`} stopColor="#e5e7eb" />
                  </linearGradient>
                </defs>
                <polygon points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7" fill={`url(#${gradId})`} />
              </>
            ) : (
              <polygon points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7" fill="#e5e7eb" />
            )}
          </svg>
        );
      })}
      {showNumber && (
        <span style={{ fontSize: size === 'sm' ? 12 : size === 'lg' ? 16 : 14, fontWeight: 700, color: '#111827', marginLeft: 4 }}>
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 2 }}>({count.toLocaleString()})</span>
      )}
    </span>
  );
};
