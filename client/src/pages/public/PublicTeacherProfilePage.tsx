import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Users, Star, Award, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { Course } from '../../types';
import { CourseCard } from '../../components/course/CourseCard';
import { useAuth } from '../../context/AuthContext';

interface TeacherProfileData {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  headline?: string;
  joinedAt: string;
  totalCourses: number;
  totalStudents: number;
  totalReviews: number;
  averageRating: number;
  courses: Course[];
}

export const PublicTeacherProfilePage: React.FC = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const { user } = useAuth();

  const [teacher, setTeacher] = useState<TeacherProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchTeacher = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/teachers/${teacherId}`);
        if (res.data?.success) {
          setTeacher(res.data.teacher);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Teacher not found');
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Teacher Profile Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'This instructor profile does not exist.'}</p>
        <Link to="/courses" className="px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-sm">
          Explore Courses
        </Link>
      </div>
    );
  }

  const isSelf = user?.id === teacher.id;

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden bg-brand-100 flex-shrink-0 shadow-md">
            {teacher.avatar ? (
              <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-extrabold text-brand-700">
                {teacher.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">
                  Verified EduGo Instructor
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {teacher.name}
                </h1>
                {teacher.headline && (
                  <p className="text-sm font-semibold text-slate-600 mt-1">{teacher.headline}</p>
                )}
              </div>

              {isSelf && (
                <Link
                  to="/teacher/profile"
                  className="px-4 py-2 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl transition-all self-center sm:self-auto"
                >
                  Edit My Profile
                </Link>
              )}
            </div>

            {teacher.bio && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                {teacher.bio}
              </p>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-lg font-extrabold text-slate-900 block">{teacher.totalCourses}</span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Courses</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-lg font-extrabold text-slate-900 block">{teacher.totalStudents}</span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Students</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-lg font-extrabold text-slate-900 block">
                  {teacher.averageRating ? teacher.averageRating.toFixed(1) : '—'}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Avg Rating</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-lg font-extrabold text-slate-900 block">{teacher.totalReviews}</span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher's Published Courses */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Courses Taught by {teacher.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Explore and enroll in any course for free.
            </p>
          </div>

          {teacher.courses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-sm text-slate-500">
              No published courses currently available from this teacher.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teacher.courses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={{ ...course, instructor: { _id: teacher.id, name: teacher.name, avatar: teacher.avatar } }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
