import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  PlayCircle,
  FileText,
  Download,
  Users,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { api } from '../../services/api';
import { Course, Review } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { RatingStars } from '../../components/common/RatingStars';
import { ProgressBar } from '../../components/common/ProgressBar';

interface CurriculumSection {
  _id: string;
  title: string;
  order: number;
  lessons: {
    _id: string;
    title: string;
    type: 'video' | 'text' | 'file';
    isRequired: boolean;
    duration?: number;
    order: number;
  }[];
}

export const CourseDetailsPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumSection[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [enrollmentProgress, setEnrollmentProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [enrolling, setEnrolling] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        const [courseRes, reviewsRes] = await Promise.all([
          api.get(`/courses/${idOrSlug}`),
          api.get(`/courses/${idOrSlug}/reviews`).catch(() => ({ data: { reviews: [] } })),
        ]);

        if (courseRes.data?.success) {
          const courseData = courseRes.data.course;
          setCourse(courseData);
          setCurriculum(courseRes.data.curriculum || []);
          setIsEnrolled(courseRes.data.isEnrolled || false);
          setEnrollmentProgress(courseRes.data.enrollmentProgress || 0);

          // Expand all sections by default
          const exp: Record<string, boolean> = {};
          (courseRes.data.curriculum || []).forEach((s: any) => {
            exp[s._id] = true;
          });
          setExpandedSections(exp);
        }

        if (reviewsRes.data?.reviews) {
          setReviews(reviewsRes.data.reviews);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [idOrSlug]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${idOrSlug}` } });
      return;
    }

    if (user.role === 'teacher') {
      alert('You are currently logged in as a Teacher. Enrollments are for Students.');
      return;
    }

    if (!course) return;

    setEnrolling(true);
    try {
      const res = await api.post(`/courses/${course._id}/enroll`);
      if (res.data?.success) {
        setIsEnrolled(true);
        navigate(`/learn/${course._id}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Course Unavailable</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'Course not found'}</p>
        <Link
          to="/courses"
          className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  const totalLessons = curriculum.reduce((acc, s) => acc + s.lessons.length, 0);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Top Banner Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Left 2 Cols: Details */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="category">{course.category}</Badge>
                <Badge variant="difficulty" difficulty={course.difficulty} />
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  100% Free
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-slate-300 text-base leading-relaxed">
                {course.summary}
              </p>

              {/* Instructor & Rating Meta */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-600 flex items-center justify-center font-bold text-white">
                    {course.instructor?.avatar ? (
                      <img src={course.instructor.avatar} alt={course.instructor.name} className="w-full h-full object-cover" />
                    ) : (
                      course.instructor?.name?.charAt(0) || 'T'
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Created by</span>
                    <Link
                      to={`/teachers/${course.instructor?._id || course.instructor?.id}`}
                      className="font-bold text-white hover:text-brand-400 transition-colors"
                    >
                      {course.instructor?.name}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <RatingStars
                    rating={course.averageRating || 0}
                    reviewCount={course.reviewCount || 0}
                    showNumber
                    size="sm"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-slate-300">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{course.enrolledCount || 0} students enrolled</span>
                </div>
              </div>
            </div>

            {/* Right Col: Course Enrollment Card */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 lg:-mb-24 relative z-10">
              <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 mb-6 relative">
                <img
                  src={
                    course.thumbnail ||
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop'
                  }
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">Free</span>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    Full Access Included
                  </span>
                </div>

                {isEnrolled ? (
                  <div className="space-y-3">
                    <ProgressBar percentage={enrollmentProgress} />
                    <button
                      type="button"
                      onClick={() => navigate(`/learn/${course._id}`)}
                      className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <PlayCircle className="w-5 h-5" />
                      Continue Learning
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    {enrolling ? 'Enrolling...' : 'Enroll Now for Free'}
                  </button>
                )}

                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-slate-400" /> Total Curriculum:
                    </span>
                    <span className="font-bold text-slate-800">{totalLessons} lessons</span>
                  </div>

                  {course.estimatedDuration && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" /> Duration:
                      </span>
                      <span className="font-bold text-slate-800">{course.estimatedDuration}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-slate-400" /> Certificate:
                    </span>
                    <span className="font-bold text-emerald-600">Official PDF Included</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-slate-400" /> Access:
                    </span>
                    <span className="font-bold text-slate-800">Lifetime Free Access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            {/* Learning Objectives */}
            {course.learningObjectives && course.learningObjectives.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-5">What you will learn</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {course.learningObjectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-slate-700 leading-snug">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum Accordion */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Course Curriculum</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {curriculum.length} sections &bull; {totalLessons} lessons
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {curriculum.map((section) => (
                  <div
                    key={section._id}
                    className="border border-slate-200 rounded-2xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(section._id)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-slate-900">{section.title}</span>
                        <span className="text-xs text-slate-500 font-medium">
                          ({section.lessons.length} lessons)
                        </span>
                      </div>
                      {expandedSections[section._id] ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {expandedSections[section._id] && (
                      <div className="divide-y divide-slate-100 bg-white">
                        {section.lessons.map((lesson) => (
                          <div
                            key={lesson._id}
                            className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 text-xs text-slate-700"
                          >
                            <div className="flex items-center gap-2.5">
                              {lesson.type === 'video' && (
                                <PlayCircle className="w-4 h-4 text-brand-500 flex-shrink-0" />
                              )}
                              {lesson.type === 'text' && (
                                <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                              )}
                              {lesson.type === 'file' && (
                                <Download className="w-4 h-4 text-amber-500 flex-shrink-0" />
                              )}
                              <span className="font-medium text-slate-800">{lesson.title}</span>
                              {!lesson.isRequired && (
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                  Optional
                                </span>
                              )}
                            </div>
                            {lesson.duration ? (
                              <span className="text-slate-400">{lesson.duration} min</span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Full Course Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Course Description</h3>
              <div
                className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            </div>

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-700">
                  {course.prerequisites.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Teacher Profile Overview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">About the Instructor</h3>
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-brand-100 flex-shrink-0 shadow-sm">
                  {course.instructor?.avatar ? (
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-brand-700">
                      {course.instructor?.name?.charAt(0) || 'T'}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Link
                    to={`/teachers/${course.instructor?._id || course.instructor?.id}`}
                    className="text-base font-bold text-slate-900 hover:text-brand-600 transition-colors"
                  >
                    {course.instructor?.name}
                  </Link>
                  {course.instructor?.headline && (
                    <p className="text-xs font-semibold text-brand-600">{course.instructor.headline}</p>
                  )}
                  {course.instructor?.bio && (
                    <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                      {course.instructor.bio}
                    </p>
                  )}
                  <Link
                    to={`/teachers/${course.instructor?._id || course.instructor?.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 pt-1"
                  >
                    View Teacher Profile &amp; Courses &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Student Reviews Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Student Reviews</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <RatingStars rating={course.averageRating || 0} size="md" />
                    <span className="text-sm font-bold text-slate-900">
                      {course.averageRating ? course.averageRating.toFixed(1) : 'No ratings yet'}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({course.reviewCount || 0} total reviews)
                    </span>
                  </div>
                </div>
              </div>

              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No written reviews yet for this course. Be the first enrolled student to review!
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="py-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                            {rev.studentId?.avatar ? (
                              <img
                                src={rev.studentId.avatar}
                                alt={rev.studentId.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              rev.studentId?.name?.charAt(0) || 'S'
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              {rev.studentId?.name || 'EduGo Student'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <RatingStars rating={rev.rating} size="sm" />
                      </div>
                      {rev.comment && (
                        <p className="text-xs text-slate-600 leading-relaxed pl-11">
                          {rev.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
