import React from 'react';

interface ProgressBarProps {
  percentage: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  showText = true,
  size = 'md',
  className = '',
}) => {
  const safePercentage = Math.min(100, Math.max(0, Math.round(percentage)));

  const heightMap = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const isComplete = safePercentage === 100;

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between items-center text-xs font-semibold mb-1">
          <span className="text-slate-600">Course Progress</span>
          <span className={isComplete ? 'text-emerald-600 font-bold' : 'text-brand-600'}>
            {safePercentage}%
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightMap[size]}`}>
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isComplete
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-brand-600 to-indigo-400'
          }`}
          style={{ width: `${safePercentage}%` }}
        />
      </div>
    </div>
  );
};
