import React from 'react';
import { FileText } from 'lucide-react';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Terms of Service</h1>
              <p className="text-xs text-slate-400">EduGo Platform &bull; Learn on the Move</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. Educational Purpose</h2>
            <p>
              EduGo provides a free, collaborative e-learning environment for educators and students. By accessing or using EduGo, you agree to adhere to these terms.
            </p>

            <h2 className="text-base font-bold text-slate-900">2. Free Access &amp; Content Ownership</h2>
            <p>
              All published courses are offered freely to enrolled students. Instructors retain ownership of original educational course material uploaded to their curriculum modules.
            </p>

            <h2 className="text-base font-bold text-slate-900">3. Certificates of Completion</h2>
            <p>
              Certificates are awarded exclusively upon 100% verified completion of all required lessons in a course. Altering certificate data or misrepresenting credentials is strictly prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
