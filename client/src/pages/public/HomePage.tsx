import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  CheckCircle2,
  Video,
  FileText,
  Users,
  Compass,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { Course } from '../../types';
import { CourseCard } from '../../components/course/CourseCard';
import { useAuth } from '../../context/AuthContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const res = await api.get('/courses?limit=6&sortBy=popular');
        if (res.data?.success) {
          setCourses(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load featured courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedCourses();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/courses?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const categories = [
    'All',
    'Web Development',
    'Data Science',
    'Design',
    'DevOps & Cloud',
    'Mobile Development',
  ];

  return (
    <div className="flex flex-col">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Tagline */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/70 text-brand-700 text-xs font-bold tracking-wide mb-6 border border-brand-200/50 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>EduGo &bull; Learn on the Move</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Empower Your Future with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Free, Hands-on</span> Learning
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 mb-10 leading-relaxed font-normal max-w-2xl mx-auto">
              Master modern in-demand skills at your own pace. Watch concise video lessons, review practical materials, track lesson milestones, and earn verifiable certificates.
            </p>

            {/* Search Bar Input */}
            <form
              onSubmit={handleSearch}
              className="max-w-xl mx-auto relative flex items-center shadow-lg shadow-brand-500/5 rounded-2xl bg-white border border-slate-200 p-1.5 mb-8"
            >
              <Search className="w-5 h-5 text-slate-400 ml-3 pointer-events-none" />
              <input
                type="text"
                placeholder="What skill would you like to master today?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-3 pr-4 py-2.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 flex-shrink-0"
              >
                Search
              </button>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 text-sm"
              >
                <Compass className="w-4 h-4" />
                Explore Courses
              </Link>

              {user?.role === 'teacher' ? (
                <Link
                  to="/teacher/courses/new"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-all text-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  Create a Course
                </Link>
              ) : (
                <Link
                  to={user ? '/dashboard' : '/register'}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-all text-sm"
                >
                  <GraduationCap className="w-4 h-4" />
                  {user ? 'My Dashboard' : 'Start Teaching'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY EXPLORATION PILLS */}
      <section className="py-6 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={cat === 'All' ? '/courses' : `/courses?category=${encodeURIComponent(cat)}`}
                className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 text-slate-700 border border-transparent transition-all"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COURSES SECTION */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
                Curated Learning
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Featured Free Courses
              </h2>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 group"
            >
              Browse all courses
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">No courses available yet</h3>
              <p className="text-sm text-slate-500 mb-6">
                Be the very first instructor to publish an educational course on EduGo!
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 text-sm"
              >
                Start Teaching Today
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW EDUGO WORKS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
              Simple & Transparent
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How EduGo Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Designed from the ground up for focused, distraction-free online learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition-all flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xl mb-6 shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Enroll for Free</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Discover courses taught by real practitioners. Enroll in any published course instantly without credit cards or hidden subscription tiers.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition-all flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl mb-6 shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Learn on the Move</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Watch responsive video modules, read formatted lessons, download materials, and mark required milestones complete from phone or laptop.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition-all flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl mb-6 shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Earn & Verify Certificate</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete 100% of required lessons and automatically receive a verified, tamper-proof PDF certificate with a public verification link.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM BENEFITS */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 block mb-2">
                Why Choose EduGo
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
                Quality Education Should Be Accessible to Everyone
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mb-8 leading-relaxed">
                We believe that learning is a universal right. EduGo removes the clutter and barriers: no predatory paywalls, no fake quizzes, just pure structured knowledge.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">100% Free Course Catalog</h4>
                    <p className="text-xs text-slate-400">All courses published on EduGo are permanently free for all learners.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Genuine Lesson Progress Tracking</h4>
                    <p className="text-xs text-slate-400">Progress percentages calculated securely on our backend based on real completed lessons.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Tamper-Proof Verification</h4>
                    <p className="text-xs text-slate-400">Every certificate features a unique ID verifiable on our public verification portal.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual card */}
            <div className="bg-slate-800/80 p-8 rounded-3xl border border-slate-700/80 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Official Award</p>
                    <h4 className="text-sm font-bold text-white">Certificate of Completion</h4>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Verified
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Learner Name:</span>
                  <span className="font-semibold text-white">David Chen</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Course:</span>
                  <span className="font-semibold text-white">Modern Full-Stack Web Development</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Verification ID:</span>
                  <span className="font-mono text-brand-400">EDUGO-2026-W89K2P</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400 font-bold">100% Milestone Achieved</span>
                </div>
              </div>

              <Link
                to="/verify/EDUGO-2026-W89K2P"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Preview Public Verification Page
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TEACHER CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-r from-brand-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <GraduationCap className="w-12 h-12 text-brand-200 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Share Your Knowledge With The World
          </h2>
          <p className="text-brand-100 text-sm sm:text-base leading-relaxed mb-8">
            Create structured courses, upload videos, attach downloadable guides, track enrolled students, post announcements, and build your educator reputation.
          </p>
          <Link
            to={user?.role === 'teacher' ? '/teacher/courses/new' : '/register'}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand-800 hover:bg-brand-50 rounded-xl font-bold text-sm shadow-xl shadow-brand-900/30 transition-all"
          >
            {user?.role === 'teacher' ? 'Create a Course Now' : 'Join as an Instructor'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
