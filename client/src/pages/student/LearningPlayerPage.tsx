import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Award,
  Sparkles,
  Star,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { api } from '../../services/api';
import { Course, Lesson } from '../../types';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Modal } from '../../components/common/Modal';
import { RatingStars } from '../../components/common/RatingStars';
import { VideoPlayer } from '../../components/player/VideoPlayer';

interface CurriculumSection {
  _id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export const LearningPlayerPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumSection[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [certificateData, setCertificateData] = useState<any>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [markingComplete, setMarkingComplete] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [userReview, setUserReview] = useState<any>(null);

  // Certificate Modal State
  const [celebrationModalOpen, setCelebrationModalOpen] = useState<boolean>(false);

  // Video Ref
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchLearningSession = async () => {
      setLoading(true);
      try {
        const [curriculumRes, progressRes, reviewsRes] = await Promise.all([
          api.get(`/courses/${courseId}/curriculum`),
          api.get(`/courses/${courseId}/progress`),
          api.get(`/courses/${courseId}/reviews`),
        ]);

        if (curriculumRes.data?.success) {
          setCourse(curriculumRes.data.course);
          const sections: CurriculumSection[] = curriculumRes.data.curriculum || [];
          setCurriculum(sections);

          // Flatten lessons to find initial active lesson
          const allLessons = sections.flatMap((s) => s.lessons);
          if (allLessons.length > 0) {
            // Find first uncompleted or first lesson
            const completed = progressRes.data?.completedLessonIds || [];
            const firstUncompleted = allLessons.find((l) => !completed.includes(l._id));
            setCurrentLesson(firstUncompleted || allLessons[0]);
          }
        }

        if (progressRes.data?.success) {
          setCompletedLessonIds(progressRes.data.completedLessonIds || []);
          setProgressPercentage(progressRes.data.progressPercentage || 0);
          setIsCompleted(progressRes.data.isCompleted || false);
        }

        // Check if current user already submitted review
        const userStored = JSON.parse(localStorage.getItem('edugo_user') || '{}');
        const existingRev = (reviewsRes.data?.reviews || []).find(
          (r: any) => r.studentId?._id === userStored.id || r.studentId === userStored.id
        );
        if (existingRev) {
          setUserReview(existingRev);
          setReviewRating(existingRev.rating);
          setReviewComment(existingRev.comment);
        }
      } catch (err: any) {
        if (err.response?.status === 403) {
          alert('You must enroll in this course first to access learning lessons.');
          navigate(`/courses/${courseId}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLearningSession();
  }, [courseId, navigate]);

  // Track playback time when video updates
  const handleTimeUpdate = (currentTime?: number) => {
    if (!currentLesson) return;
    const watched =
      typeof currentTime === 'number'
        ? Math.floor(currentTime)
        : videoRef.current
        ? Math.floor(videoRef.current.currentTime)
        : 0;
    // Track playback every 15 seconds
    if (watched > 0 && watched % 15 === 0) {
      api.post(`/courses/${courseId}/lessons/${currentLesson._id}/track`, {
        watchedSeconds: watched,
      }).catch(() => {});
    }
  };

  // Toggle/Mark Lesson Complete
  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    setMarkingComplete(true);
    try {
      const res = await api.post(`/courses/${courseId}/lessons/${currentLesson._id}/complete`);
      if (res.data?.success) {
        if (!completedLessonIds.includes(currentLesson._id)) {
          setCompletedLessonIds([...completedLessonIds, currentLesson._id]);
        }
        setProgressPercentage(res.data.progressPercentage);
        if (res.data.isCourseCompleted) {
          setIsCompleted(true);
          setCertificateData(res.data.certificate);
          setCelebrationModalOpen(true);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update lesson status');
    } finally {
      setMarkingComplete(false);
    }
  };

  // Previous & Next Lesson Navigation
  const allLessons = curriculum.flatMap((s) => s.lessons);
  const currentIndex = allLessons.findIndex((l) => l._id === currentLesson?._id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const isCurrentCompleted = currentLesson && completedLessonIds.includes(currentLesson._id);

  // Submit or edit review
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      if (userReview) {
        await api.put(`/courses/${courseId}/reviews/${userReview._id}`, {
          rating: reviewRating,
          comment: reviewComment,
        });
      } else {
        const res = await api.post(`/courses/${courseId}/reviews`, {
          rating: reviewRating,
          comment: reviewComment,
        });
        if (res.data?.success) {
          setUserReview(res.data.review);
        }
      }
      setReviewModalOpen(false);
      alert('Thank you! Your course review has been saved.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-400 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Top Learning Bar */}
      <div className="h-14 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3 truncate">
          <Link
            to="/my-learning"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex-shrink-0"
            title="Back to My Learning"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            EduGo Player
          </span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
            {course?.title}
          </h2>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Progress Indicator */}
          <div className="hidden md:flex items-center gap-3 w-48">
            <ProgressBar percentage={progressPercentage} showText={false} size="sm" />
            <span className="text-xs font-bold text-brand-400 whitespace-nowrap">
              {progressPercentage}%
            </span>
          </div>

          {/* Review Button */}
          <button
            type="button"
            onClick={() => setReviewModalOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 text-slate-300"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="hidden sm:inline">{userReview ? 'Edit Review' : 'Rate Course'}</span>
          </button>

          {/* Toggle Sidebar on mobile */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            title="Toggle Curriculum Sidebar"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Workspace (Player + Sidebar) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900">
          {currentLesson ? (
            <div className="flex-1 flex flex-col p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
              {/* Media Content Area */}
              {currentLesson.type === 'video' && (
                <VideoPlayer
                  videoUrl={
                    currentLesson.content?.videoUrl ||
                    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                  }
                  lessonTitle={currentLesson.title}
                  onTimeUpdate={(currentTime) => handleTimeUpdate(currentTime)}
                />
              )}

              {currentLesson.type === 'text' && (
                <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-10 border border-slate-700/80 shadow-xl space-y-6">
                  <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold uppercase tracking-wider">
                    <FileText className="w-4 h-4" /> Reading Lesson
                  </div>
                  <div
                    className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html:
                        currentLesson.content?.textHtml ||
                        '<p>No written lesson content available.</p>',
                    }}
                  />
                </div>
              )}

              {currentLesson.type === 'file' && (
                <div className="bg-slate-800/80 rounded-3xl p-8 border border-slate-700/80 shadow-xl space-y-6 text-center max-w-xl mx-auto my-12">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                    <Download className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {currentLesson.content?.fileName || currentLesson.title}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Download this educational resource guide to support your practical learning.
                    </p>
                  </div>
                  {currentLesson.content?.fileUrl ? (
                    <a
                      href={currentLesson.content.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/20 transition-all"
                    >
                      <Download className="w-4 h-4" /> Download Resource File
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">File download unavailable</span>
                  )}
                </div>
              )}

              {/* Lesson Title & Mark Complete Bar */}
              <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-brand-400 font-bold capitalize">
                      {currentLesson.type} Lesson
                    </span>
                    {currentLesson.isRequired ? (
                      <span className="text-[10px] bg-brand-900/60 text-brand-300 font-semibold px-2 py-0.5 rounded-full border border-brand-500/30">
                        Required for Certificate
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                        Optional
                      </span>
                    )}
                  </div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-white">
                    {currentLesson.title}
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={handleMarkComplete}
                  disabled={markingComplete}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm disabled:opacity-50 ${
                    isCurrentCompleted
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/40'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isCurrentCompleted ? 'Completed ✓' : 'Mark Lesson Complete'}
                </button>
              </div>

              {/* Lesson Description & Details */}
              {currentLesson.description && (
                <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Lesson Overview
                  </h4>
                  <p>{currentLesson.description}</p>
                </div>
              )}

              {/* Bottom Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <button
                  type="button"
                  disabled={!prevLesson}
                  onClick={() => prevLesson && setCurrentLesson(prevLesson)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous Lesson
                </button>

                <button
                  type="button"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && setCurrentLesson(nextLesson)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-2 shadow-md"
                >
                  Next Lesson
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">Select a lesson from the curriculum sidebar.</div>
          )}
        </div>

        {/* Curriculum Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 sm:w-96 bg-slate-950 border-l border-slate-800 flex flex-col flex-shrink-0 overflow-hidden z-20 absolute sm:relative inset-y-0 right-0">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Course Curriculum</h3>
                <p className="text-[11px] text-slate-400">
                  {completedLessonIds.length} of {allLessons.length} lessons completed
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="sm:hidden p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {curriculum.map((section, sIdx) => (
                <div key={section._id} className="py-3">
                  <div className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {section.lessons.map((lesson) => {
                      const isActive = currentLesson?._id === lesson._id;
                      const isDone = completedLessonIds.includes(lesson._id);

                      return (
                        <button
                          key={lesson._id}
                          type="button"
                          onClick={() => {
                            setCurrentLesson(lesson);
                            if (window.innerWidth < 640) setSidebarOpen(false);
                          }}
                          className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors ${
                            isActive
                              ? 'bg-brand-600/20 text-brand-300 border-l-4 border-brand-500'
                              : 'hover:bg-slate-900 text-slate-300'
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600" />
                            )}
                          </div>

                          <div className="flex-1 text-xs leading-snug">
                            <span className="font-semibold block">{lesson.title}</span>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                              <span className="capitalize">{lesson.type}</span>
                              {lesson.duration ? <span>&bull; {lesson.duration}m</span> : null}
                              {!lesson.isRequired && <span className="text-amber-500/80 font-bold">&bull; Optional</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={userReview ? 'Edit Your Course Review' : 'Rate & Review This Course'}
      >
        <form onSubmit={handleSaveReview} className="space-y-5 text-slate-900">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Overall Rating</label>
            <div className="flex items-center gap-2">
              <RatingStars
                rating={reviewRating}
                interactive
                size="lg"
                onRatingChange={(r) => setReviewRating(r)}
              />
              <span className="text-sm font-bold text-amber-600 ml-2">{reviewRating} Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Written Comment (Optional)
            </label>
            <textarea
              rows={4}
              maxLength={1000}
              placeholder="What did you like about this course? How was the teaching style?"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full p-3 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl shadow-sm disabled:opacity-50"
            >
              {submittingReview ? 'Saving...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Celebration & Certificate Modal on 100% Completion */}
      <Modal
        isOpen={celebrationModalOpen}
        onClose={() => setCelebrationModalOpen(false)}
        title="Congratulations on Course Completion!"
        maxWidth="md"
      >
        <div className="text-center py-4 space-y-4 text-slate-900">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md">
            <Award className="w-9 h-9" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900">
            You've Mastered This Course!
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            All required lessons have been completed. Your official, verified certificate of completion has been automatically issued.
          </p>

          {certificateData && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Certificate ID:</span>
                <span className="font-mono font-bold text-brand-600">
                  {certificateData.certificateId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Learner Name:</span>
                <span className="font-semibold text-slate-800">{certificateData.studentName}</span>
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link
              to="/certificates"
              className="flex-1 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              View My Certificates
            </Link>
            <button
              type="button"
              onClick={() => setCelebrationModalOpen(false)}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Continue Learning
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
