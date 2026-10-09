import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Privacy Policy</h1>
              <p className="text-xs text-slate-400">Effective Date: October 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              When you register for an EduGo account, we collect your name, email address, and role (student or teacher). We also store your course enrollments, lesson progress records, and any course reviews or announcements you create.
            </p>

            <h2 className="text-base font-bold text-slate-900">2. How We Protect Student Privacy</h2>
            <p>
              Student accounts are strictly private by default. Your email address, progress history, and certificates are never made publicly searchable. Only verified certificates are viewable through their unique verification identifier.
            </p>

            <h2 className="text-base font-bold text-slate-900">3. Teacher Public Profiles</h2>
            <p>
              Teachers choose to make their public instructor profile, bio, headline, and course catalog visible to prospective students to foster community trust.
            </p>

            <h2 className="text-base font-bold text-slate-900">4. Free Platform Guarantee</h2>
            <p>
              EduGo does not process payments, store credit card details, or sell personal data to advertisers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
