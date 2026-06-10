interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
}

export function StarRating({ rating, max = 5, size = 'sm', showValue = true }: StarRatingProps) {
  const pct = (rating / max) * 100;
  const starSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <span className={`inline-flex items-center gap-1 ${starSize}`}>
      <span className="relative inline-flex">
        {/* Gray stars */}
        <span className="text-slate-200 select-none">{'★'.repeat(max)}</span>
        {/* Filled stars */}
        <span
          className="absolute inset-0 text-amber-400 overflow-hidden select-none"
          style={{ width: `${pct}%` }}
        >
          {'★'.repeat(max)}
        </span>
      </span>
      {showValue && (
        <span className="text-slate-600 font-medium">{rating.toFixed(1)}</span>
      )}
    </span>
  );
}
