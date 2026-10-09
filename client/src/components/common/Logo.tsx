import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  withTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', withTagline = true, size = 'md' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <div
        className={`${iconSizes[size]} bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200`}
      >
        <svg
          className="w-5/6 h-5/6 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Graduation Cap */}
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
          {/* Forward arrow / motion spark */}
          <path d="M12 22v-3" stroke="#f97316" strokeWidth="2.5" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-extrabold tracking-tight text-slate-900 leading-none ${textSizes[size]}`}>
          Edu<span className="text-brand-600">Go</span>
        </span>
        {withTagline && size !== 'sm' && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 group-hover:text-brand-600 transition-colors mt-0.5">
            Learn on the Move
          </span>
        )}
      </div>
    </Link>
  );
};
