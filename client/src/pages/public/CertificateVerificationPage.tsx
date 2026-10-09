import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Search, Award, CheckCircle, AlertTriangle, Download, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Logo } from '../../components/common/Logo';

interface VerificationResult {
  isValid: boolean;
  certificate?: {
    certificateId: string;
    studentName: string;
    courseTitle: string;
    teacherName: string;
    completionDate: string;
    verificationUrl: string;
  };
}

export const CertificateVerificationPage: React.FC = () => {
  const { certificateId: paramId } = useParams<{ certificateId?: string }>();
  const [searchId, setSearchId] = useState(paramId || '');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const verifyId = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/certificates/verify/${idToVerify.trim().toUpperCase()}`);
      if (res.data?.success) {
        setResult({
          isValid: true,
          certificate: res.data.certificate,
        });
      }
    } catch {
      setResult({ isValid: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramId) {
      verifyId(paramId);
    }
  }, [paramId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    verifyId(searchId);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Official Certificate Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            EduGo certificates are digitally signed and verifiable worldwide. Enter a unique Certificate ID below to confirm authenticity.
          </p>
        </div>

        {/* Verification Search Bar */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-md flex items-center gap-2 mb-10"
        >
          <Search className="w-5 h-5 text-slate-400 ml-3 pointer-events-none" />
          <input
            type="text"
            placeholder="e.g. EDUGO-2026-W89K2P"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value.toUpperCase())}
            className="w-full px-2 py-2 text-sm uppercase font-mono tracking-wider text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          <button
            type="submit"
            disabled={loading || !searchId.trim()}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 flex-shrink-0"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        {/* Verification Result Display */}
        {loading && (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
            <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-semibold">Validating certificate authenticity on database...</p>
          </div>
        )}

        {!loading && searched && result && (
          <div className="animate-fade-in">
            {result.isValid && result.certificate ? (
              <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-6 sm:p-10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 pointer-events-none" />

                <div className="relative z-10 space-y-6">
                  {/* Status Banner */}
                  <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase">
                        Verified Valid Certificate
                      </span>
                      <h2 className="text-xl font-bold text-slate-900">
                        Official EduGo Certificate of Completion
                      </h2>
                    </div>
                  </div>

                  {/* Verified Details Table */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                    <div>
                      <span className="text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                        Certificate Holder
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {result.certificate.studentName}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                        Completed Course
                      </span>
                      <span className="text-sm font-bold text-brand-600">
                        {result.certificate.courseTitle}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                        Course Instructor
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {result.certificate.teacherName}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                        Date Issued
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {new Date(result.certificate.completionDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">
                          Certificate ID
                        </span>
                        <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {result.certificate.certificateId}
                        </span>
                      </div>

                      <a
                        href={`/api/certificates/${result.certificate.certificateId}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Official PDF
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-red-200 p-8 text-center space-y-3 shadow-md">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Certificate Not Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  No valid certificate was found matching the identifier{' '}
                  <strong className="text-slate-700 font-mono">{searchId}</strong>. Please verify the ID for typos or check with the certificate holder.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
