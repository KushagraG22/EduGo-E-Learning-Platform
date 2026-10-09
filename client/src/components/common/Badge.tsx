import React from 'react';
import { CourseDifficulty, CourseStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'difficulty' | 'status' | 'category' | 'role' | 'default';
  difficulty?: CourseDifficulty;
  status?: CourseStatus;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  difficulty,
  status,
  className = '',
}) => {
  let badgeStyles = 'bg-slate-100 text-slate-700';

  if (variant === 'difficulty' && difficulty) {
    if (difficulty === 'Beginner') {
      badgeStyles = 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
    } else if (difficulty === 'Intermediate') {
      badgeStyles = 'bg-blue-50 text-blue-700 border border-blue-200/60';
    } else if (difficulty === 'Advanced') {
      badgeStyles = 'bg-purple-50 text-purple-700 border border-purple-200/60';
    }
  } else if (variant === 'status' && status) {
    if (status === 'published') {
      badgeStyles = 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
    } else if (status === 'archived') {
      badgeStyles = 'bg-rose-50 text-rose-700 border border-rose-200/60';
    } else {
      badgeStyles = 'bg-amber-50 text-amber-700 border border-amber-200/60';
    }
  } else if (variant === 'category') {
    badgeStyles = 'bg-brand-50 text-brand-700 border border-brand-100 font-semibold';
  } else if (variant === 'role') {
    badgeStyles = 'bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider text-[10px]';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeStyles} ${className}`}
    >
      {children || difficulty || status}
    </span>
  );
};
