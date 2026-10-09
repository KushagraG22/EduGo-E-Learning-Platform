import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, Award, BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { ProgressBar } from '../../components/common/ProgressBar';

export const LearningHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/enrollments/history');
        if (res.data?.success) {
          setHistory(res.data.history || []);
          setStats(res.data.stats || {});
        }
      } catch (err) {
        console.error('Failed to load learning history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
            Private Learning Record
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Learning History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            A chronological timeline of your course milestones, active studies, and completions.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-2xl font-black text-slate-900 block">{stats?.totalEnrolled || 0}</span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Enrolled</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-2xl font-black text-indigo-600 block">{stats?.inProgressCount || 0}</span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">In Progress</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-2xl font-black text-emerald-600 block">{stats?.completedCount || 0}</span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Completed</span>
          </div>
        </div>

        {/* Timeline */}
        {history.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-3">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No learning history recorded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your enrollments and lesson milestone progress will be tracked here automatically.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl"
            >
              Start Learning Free
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {history.map((record) => {
                const c = record.course;
                if (!c) return null;
                const isFinished = record.progressPercentage === 100;

                return (
                  <div key={record.id} className="relative space-y-2">
                    {/* Timeline dot */}
                    <div
                      className={`absolute -left-[30px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                        isFinished ? 'border-emerald-500 bg-emerald-50' : 'border-brand-500 bg-brand-50'
                      }`}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <Link
                        to={`/learn/${c._id}`}
                        className="text-base font-bold text-slate-900 hover:text-brand-600 transition-colors"
                      >
                        {c.title}
                      </Link>
                      <span className="text-xs text-slate-400 font-medium">
                        Enrolled on {new Date(record.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="max-w-md pt-1">
                      <ProgressBar percentage={record.progressPercentage} size="sm" />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                      {isFinished ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Completed on {new Date(record.completedAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span>
                          Last active: {new Date(record.lastAccessedAt).toLocaleDateString()}
                        </span>
                      )}
                      <span>&bull;</span>
                      <Link
                        to={`/learn/${c._id}`}
                        className="text-brand-600 hover:underline font-semibold"
                      >
                        Go to Player &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
