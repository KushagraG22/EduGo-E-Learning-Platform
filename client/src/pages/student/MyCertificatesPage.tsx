import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, ShieldCheck, ExternalLink, BookOpen, Check } from 'lucide-react';
import { api } from '../../services/api';
import { CertificateItem } from '../../types';

export const MyCertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await api.get('/certificates/my-certificates');
        if (res.data?.success) {
          setCertificates(res.data.certificates || []);
        }
      } catch (err) {
        console.error('Failed to load certificates', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const copyVerificationLink = (certId: string) => {
    const url = `${window.location.origin}/verify/${certId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(certId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
            Official Credentials
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Certificates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Download your official course completion PDF certificates and share verifiable credentials.
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-3">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No certificates earned yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Complete 100% of required lessons in any enrolled course to automatically receive your verifiable certificate.
            </p>
            <Link
              to="/my-learning"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Go to My Learning
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Award
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-semibold">
                      {cert.certificateId}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {cert.courseTitle}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Instructor:</span>
                      <span className="font-semibold text-slate-800">{cert.teacherName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Completion Date:</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(cert.completionDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5">
                  <a
                    href={`/api/certificates/${cert.certificateId}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-center"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>

                  <button
                    type="button"
                    onClick={() => copyVerificationLink(cert.certificateId)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5"
                    title="Copy Public Verification Link"
                  >
                    {copiedId === cert.certificateId ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        <span>Share</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`/verify/${cert.certificateId}`}
                    className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
                    title="View Verification Page"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
