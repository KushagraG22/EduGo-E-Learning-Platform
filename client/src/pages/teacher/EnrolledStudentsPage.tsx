import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, Award, Calendar, BookOpen } from 'lucide-react';
import { api } from '../../services/api';
import { ProgressBar } from '../../components/common/ProgressBar';

export const EnrolledStudentsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const [courseTitle, setCourseTitle] = useState('');
  const [totalEnrolled, setTotalEnrolled] = useState(0);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get(`/courses/${courseId}/students`);
        if (res.data?.success) {
          setCourseTitle(res.data.courseTitle || 'Course');
          setTotalEnrolled(res.data.totalEnrolled || 0);
          setStudents(res.data.students || []);
        }
      } catch (err) {
        console.error('Failed to load students', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          to="/teacher/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Courses
        </Link>

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
              Enrolled Learners
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {courseTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {totalEnrolled} total students actively enrolled in this course.
            </p>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-brand-50 text-brand-700 font-bold text-sm flex items-center gap-2 self-start sm:self-auto border border-brand-100">
            <Users className="w-4 h-4" />
            <span>{totalEnrolled} Learners</span>
          </div>
        </div>

        {/* Students Table / List */}
        {students.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-2">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No students enrolled yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Once you publish this course and students enroll, their milestone progress will be displayed here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Learner</th>
                    <th className="py-4 px-6">Enrolled Date</th>
                    <th className="py-4 px-6">Milestone Progress</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Completion Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((record) => (
                    <tr key={record.enrollmentId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                            {record.student?.avatar ? (
                              <img
                                src={record.student.avatar}
                                alt={record.student.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              record.student?.name?.charAt(0) || 'S'
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {record.student?.name}
                            </span>
                            <span className="text-[11px] text-slate-400">{record.student?.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        {new Date(record.enrolledAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-6 min-w-[160px]">
                        <ProgressBar percentage={record.progressPercentage || 0} size="sm" />
                      </td>

                      <td className="py-4 px-6">
                        {record.progressPercentage === 100 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                            <CheckCircle className="w-3 h-3" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                            In Progress
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-slate-500">
                        {record.completedAt ? (
                          <span className="font-semibold text-slate-800">
                            {new Date(record.completedAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
