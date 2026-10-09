import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-block bg-white px-3 py-1.5 rounded-xl">
              <Logo size="md" />
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              EduGo empowers learners and educators everywhere with high-quality, 100% free online courses, hands-on curriculum modules, and verifiable certificates.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-lg text-xs text-emerald-400 font-semibold border border-slate-700">
              <Sparkles className="w-3.5 h-3.5" />
              100% Free Learning &bull; No Subscriptions &bull; No Fees
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/courses" className="hover:text-brand-400 transition-colors">
                  Explore All Courses
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Web+Development" className="hover:text-brand-400 transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Data+Science" className="hover:text-brand-400 transition-colors">
                  Data Science
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Design" className="hover:text-brand-400 transition-colors">
                  UI/UX Design
                </Link>
              </li>
            </ul>
          </div>

          {/* For Teachers & Students */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Community
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/register" className="hover:text-brand-400 transition-colors">
                  Start Teaching Today
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-400 transition-colors">
                  Student Registration
                </Link>
              </li>
              <li>
                <Link to="/verify" className="flex items-center gap-1.5 hover:text-brand-400 transition-colors">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Verify Certificate
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Transparency
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-brand-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-brand-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-brand-400 transition-colors">
                  Public Verification
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} EduGo Platform. All rights reserved. Learn on the Move.</p>
          <p className="flex items-center gap-1">
            Built for accessible education worldwide <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
