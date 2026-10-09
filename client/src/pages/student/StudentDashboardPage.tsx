import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  Award,
  PlayCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Megaphone,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ProgressBar } from '../../components/common/ProgressBar';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  const completedCount = enrollments.filter((e) => e.progressPercentage === 100).length;
  const inProgressCount = enrollments.filter((e) => e.progressPercentage < 100).length;
  const mostRecent = enrollments[0];

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-brand-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-200 block">
              Student Dashboard
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Keep Going, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
              Every completed lesson brings you closer to earning your official verified certificate.
            </p>
          </div>

          {mostRecent && (
            <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 sm:max-w-xs w-full space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-200 block">
                Continue Learning
              </span>
              <h4 className="text-sm font-bold text-white line-clamp-1">
                {mostRecent.course?.title}
              </h4>
              <ProgressBar percentage={mostRecent.progressPercentage} showText={false} size="sm" />
              <Link
                to={`/learn/${mostRecent.course?._id}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-white text-brand-800 hover:bg-brand-50 rounded-xl font-bold text-xs transition-colors shadow-sm"
              >
                <PlayCircle className="w-4 h-4" />
                Resume Lesson
              </Link>
            </div>
          )}
        </div>

        {/* Real Stats Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Enrolled Courses</span>
              <BookOpen className="w-5 h-5 text-brand-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{enrollments.length}</div>
            <p className="text-xs text-slate-500 mt-2">Free courses in your library</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
              <Clock className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{inProgressCount}</div>
            <p className="text-xs text-slate-500 mt-2">Active learning courses</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{completedCount}</div>
            <p className="text-xs text-slate-500 mt-2">100% finished milestones</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Certificates</span>
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{completedCount}</div>
            <Link to="/certificates" className="text-xs text-brand-600 hover:underline mt-2 block font-semibold">
              View &amp; download PDF &rarr;
            </Link>
          </div>
        </div>

        {/* Enrolled Courses Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Enrolled Courses</h2>
              <p className="text-xs text-slate-500 mt-0.5">Pick up where you stopped</p>
            </div>
            <Link
              to="/courses"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Explore more courses &rarr;
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">You are not enrolled in any courses yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Discover our catalog of 100% free online courses and start learning today.
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Browse Free Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enrollments.map((item) => {
                const c = item.course;
                if (!c) return null;
                const isComplete = item.progressPercentage === 100;

                return (
                  <div
                    key={item.enrollmentId}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-shadow overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail */}
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
                              {item.completedRequiredLessons || 0} / {item.totalRequiredLessons || 0} required lessons
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
    </div>
  );
};
