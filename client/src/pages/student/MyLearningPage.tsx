import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, CheckCircle, Clock, Search } from 'lucide-react';
import { api } from '../../services/api';
import { ProgressBar } from '../../components/common/ProgressBar';

export const MyLearningPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLearning = async () => {
      try {
        const res = await api.get('/enrollments/my-learning');
        if (res.data?.success) {
          setEnrollments(res.data.enrollments || []);
        }
      } catch (err) {
        console.error('Failed to load my learning', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLearning();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  const filteredEnrollments = enrollments.filter((item) => {
    if (filter === 'in-progress' && item.progressPercentage === 100) return false;
    if (filter === 'completed' && item.progressPercentage < 100) return false;
    if (search.trim()) {
      return item.course?.title?.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Learning</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your ongoing courses, mark required lessons complete, and earn certificates.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Courses ({enrollments.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('in-progress')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'in-progress'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              In Progress ({enrollments.filter((e) => e.progressPercentage < 100).length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'completed'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Completed ({enrollments.filter((e) => e.progressPercentage === 100).length})
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search your courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* List of enrolled courses */}
        {filteredEnrollments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No courses match this filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ready to learn something new? Explore our catalog of 100% free online courses.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Explore Free Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEnrollments.map((item) => {
              const c = item.course;
              if (!c) return null;
              const isComplete = item.progressPercentage === 100;

              return (
                <div
                  key={item.enrollmentId}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-shadow overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <Link to={`/learn/${c._id}`} className="block aspect-video bg-slate-100 overflow-hidden relative">
                      <img
                        src={
                          c.thumbnail ||
                          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop'
                        }
                        alt={c.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {isComplete && (
                        <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </div>
                      )}
                    </Link>

                    <div className="p-5 space-y-3">
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                        {c.category}
                      </span>

                      <Link
                        to={`/learn/${c._id}`}
                        className="block text-base font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-2"
                      >
                        {c.title}
                      </Link>

                      <p className="text-xs text-slate-500">
                        Instructor: <strong>{c.instructor?.name || 'EduGo Teacher'}</strong>
                      </p>

                      <div className="pt-2">
                        <ProgressBar percentage={item.progressPercentage} size="sm" />
                        <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                          <span>
                            {item.completedRequiredLessons || 0} / {item.totalRequiredLessons || 0} required
                          </span>
                          <span>{item.progressPercentage}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      to={`/learn/${c._id}`}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        isComplete
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20'
                      }`}
                    >
                      <PlayCircle className="w-4 h-4" />
                      {isComplete ? 'Review Course Material' : 'Continue Learning'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
