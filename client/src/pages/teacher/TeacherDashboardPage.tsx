import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Star,
  PlusCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  FileEdit,
  Eye,
} from 'lucide-react';
import { api } from '../../services/api';
import { Course } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';

interface DashboardStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  averageRating: number;
  totalReviews: number;
}

export const TeacherDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/courses/teacher/dashboard-stats');
        if (res.data?.success) {
          setStats(res.data.stats);
          setRecentCourses(res.data.recentCourses || []);
          setRecentEnrollments(res.data.recentEnrollments || []);
        }
      } catch (err) {
        console.error('Failed to load teacher stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
              Instructor Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Here is an overview of your published courses, drafts, and enrolled student activity.
            </p>
          </div>

          <Link
            to="/teacher/courses/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Course
          </Link>
        </div>

        {/* Real Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Total Courses</span>
              <BookOpen className="w-5 h-5 text-brand-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{stats?.totalCourses || 0}</div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span className="text-emerald-600 font-semibold">{stats?.publishedCourses || 0} published</span>
              <span>&bull;</span>
              <span className="text-amber-600 font-semibold">{stats?.draftCourses || 0} drafts</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Total Enrollments</span>
              <Users className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{stats?.totalEnrollments || 0}</div>
            <p className="text-xs text-slate-500 mt-2">Active learners in your courses</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Average Rating</span>
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {stats?.averageRating ? stats.averageRating.toFixed(1) : '—'}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Based on {stats?.totalReviews || 0} student reviews
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Published Ratio</span>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {stats?.totalCourses
                ? Math.round(((stats.publishedCourses || 0) / stats.totalCourses) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-slate-500 mt-2">Live and available to students</p>
          </div>
        </div>

        {/* Courses & Recent Enrollments Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses List */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Your Courses</h3>
                <p className="text-xs text-slate-500">Manage curriculum, drafts, and status</p>
              </div>
              <Link
                to="/teacher/courses"
                className="text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                View all ({stats?.totalCourses || 0}) &rarr;
              </Link>
            </div>

            {recentCourses.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl p-6">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 mb-4">You have not created any courses yet.</p>
                <Link
                  to="/teacher/courses/new"
                  className="px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl"
                >
                  Create Your First Course
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentCourses.map((c) => (
                  <div
                    key={c._id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-16 h-11 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={
                            c.thumbnail ||
                            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop'
                          }
                          alt={c.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="status" status={c.status} />
                          <Badge variant="category">{c.category}</Badge>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{c.title}</h4>
                        <span className="text-[11px] text-slate-400">
                          {c.enrolledCount || 0} students &bull; {c.reviewCount || 0} reviews
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Link
                        to={`/teacher/courses/${c._id}/curriculum`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        Curriculum
                      </Link>
                      <Link
                        to={`/teacher/courses/${c._id}/students`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Students
                      </Link>
                      <Link
                        to={`/courses/${c.slug || c._id}`}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="View Course Page"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Enrollments Activity */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Enrollments</h3>
              <p className="text-xs text-slate-500">Live student signups in your courses</p>
            </div>

            {recentEnrollments.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                No enrollments recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {recentEnrollments.map((e) => (
                  <div key={e._id} className="p-3.5 bg-slate-50 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 truncate">
                        {e.studentId?.name || 'Student'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(e.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-600 font-semibold truncate">
                      {e.courseId?.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Progress:</span>
                      <span className="font-bold text-slate-700">{e.progressPercentage || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
