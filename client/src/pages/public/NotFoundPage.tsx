import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import { Logo } from '../../components/common/Logo';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center py-16">
      <Logo size="lg" className="mb-6" />
      <span className="text-6xl font-black text-brand-600 tracking-tight block mb-2">404</span>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        The page you are looking for doesn't exist, has been removed, or has had its name changed.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
        >
          <Compass className="w-4 h-4" />
          Explore Courses
        </Link>
      </div>
    </div>
  );
};
