import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  BookOpen,
  Edit,
  Trash2,
  Users,
  Eye,
  Megaphone,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { Course } from '../../types';
import { Badge } from '../../components/common/Badge';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const MyCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string>('');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const url =
        statusFilter === 'all'
          ? '/courses/teacher/my-courses'
          : `/courses/teacher/my-courses?status=${statusFilter}`;
      const res = await api.get(url);
      if (res.data?.success) {
        setCourses(res.data.courses || []);
      }
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [statusFilter]);

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    setDeleting(true);
    setDeleteError('');
    setDeleteSuccess('');
    try {
      const res = await api.delete(`/courses/${courseToDelete._id}`);
      if (res.data?.success) {
        setCourses((prev) => prev.filter((c) => c._id !== courseToDelete._id));
        setDeleteSuccess(
          res.data?.message ||
            `Course "${courseToDelete.title}" was successfully deleted and archived from the public catalog.`
        );
        setCourseToDelete(null);
      }
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Failed to delete course');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Courses</h1>
            <p className="text-sm text-slate-500 mt-1">
              Create, organize curriculum, manage enrolled students, and publish your courses.
            </p>
          </div>

          <Link
            to="/teacher/courses/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Create Course
          </Link>
        </div>

        {/* Success Feedback Banner */}
        {deleteSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-emerald-800 text-xs font-semibold animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{deleteSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setDeleteSuccess('')}
              className="text-emerald-600 hover:text-emerald-800 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Feedback Banner */}
        {deleteError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-800 text-xs font-semibold animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{deleteError}</span>
            </div>
            <button
              type="button"
              onClick={() => setDeleteError('')}
              className="text-rose-600 hover:text-rose-800 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
              statusFilter === 'all'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Courses
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('published')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
              statusFilter === 'published'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Published
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
              statusFilter === 'draft'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Drafts
          </button>
        </div>

        {/* Courses Table / Cards */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No courses found</h3>
            <p className="text-xs text-slate-500 mb-6">
              {statusFilter === 'all'
                ? 'You have not created any courses yet. Get started today!'
                : `You currently have no ${statusFilter} courses.`}
            </p>
            <Link
              to="/teacher/courses/new"
              className="px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl"
            >
              Create New Course
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left Thumbnail & Info */}
                <div className="flex items-start gap-4">
                  <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={
                        course.thumbnail ||
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop'
                      }
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="status" status={course.status} />
                      <Badge variant="category">{course.category}</Badge>
                      <Badge variant="difficulty" difficulty={course.difficulty} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{course.summary}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>{course.enrolledCount || 0} students enrolled</span>
                      <span>&bull;</span>
                      <span>
                        Rating: {course.averageRating ? course.averageRating.toFixed(1) : 'No reviews'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                  <Link
                    to={`/teacher/courses/${course._id}/curriculum`}
                    className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                    title="Curriculum Builder"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Curriculum
                  </Link>

                  <Link
                    to={`/teacher/courses/${course._id}/edit`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    title="Edit Course Details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Link>

                  <Link
                    to={`/teacher/courses/${course._id}/students`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    title="Enrolled Students"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Students
                  </Link>

                  <Link
                    to={`/teacher/courses/${course._id}/announcements`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    title="Post Course Announcements"
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    Announcements
                  </Link>

                  <Link
                    to={`/courses/${course.slug || course._id}`}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                    title="Preview Course Page"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError('');
                      setCourseToDelete(course);
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 border border-rose-200/60 shadow-sm"
                    title="Delete Course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Modal for Delete */}
        <ConfirmModal
          isOpen={!!courseToDelete}
          onClose={() => setCourseToDelete(null)}
          onConfirm={handleDeleteCourse}
          title={`Delete Course: "${courseToDelete?.title}"`}
          message={`Are you sure you want to delete this course?

• Removal from Public Discovery: This course will be immediately archived and permanently removed from catalog discovery and search.
• New Enrollments Blocked: No new students will be allowed to enroll.
• Student Records Protected: Enrolled students will retain access to their existing certificates, verification IDs, and completed learning history.

This action cannot be undone.`}
          confirmText={deleting ? 'Deleting Course...' : 'Delete Course'}
          cancelText="Cancel"
          isDangerous
          isLoading={deleting}
        />
      </div>
    </div>
  );
};
