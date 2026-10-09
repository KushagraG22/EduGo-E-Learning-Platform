import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number; // 0 to 5
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showNumber?: boolean;
  reviewCount?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  max = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showNumber = false,
  reviewCount,
}) => {
  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      {showNumber && (
        <span className="font-bold text-amber-600 text-sm">
          {rating ? rating.toFixed(1) : 'New'}
        </span>
      )}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= Math.round(rating);

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
              className={`${
                interactive
                  ? 'cursor-pointer hover:scale-110 transition-transform focus:outline-none'
                  : 'cursor-default pointer-events-none'
              }`}
              title={`${starValue} Stars`}
            >
              <Star
                className={`${sizeMap[size]} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-200 fill-slate-100'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>
      {reviewCount !== undefined && (
        <span className="text-xs text-slate-500 font-medium">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
