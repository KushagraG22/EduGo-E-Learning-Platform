import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, BookOpen, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { api } from '../../services/api';
import { Course } from '../../types';
import { CourseCard } from '../../components/course/CourseCard';

export const ExploreCoursesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialDifficulty = searchParams.get('difficulty') || 'All';
  const initialSort = searchParams.get('sortBy') || 'newest';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [sortBy, setSortBy] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  const categories = [
    'All',
    'Web Development',
    'Data Science',
    'Design',
    'DevOps & Cloud',
    'Mobile Development',
  ];

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    // Keep URL in sync
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (category !== 'All') params.category = category;
    if (difficulty !== 'All') params.difficulty = difficulty;
    if (sortBy !== 'newest') params.sortBy = sortBy;
    if (page > 1) params.page = page.toString();

    setSearchParams(params, { replace: true });

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchTerm) queryParams.append('search', searchTerm);
        if (category !== 'All') queryParams.append('category', category);
        if (difficulty !== 'All') queryParams.append('difficulty', difficulty);
        queryParams.append('sortBy', sortBy);
        queryParams.append('page', page.toString());
        queryParams.append('limit', '9');

        const res = await api.get(`/courses?${queryParams.toString()}`);
        if (res.data?.success) {
          setCourses(res.data.data || []);
          setTotal(res.data.pagination?.total || 0);
          setTotalPages(res.data.pagination?.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [searchTerm, category, difficulty, sortBy, page, setSearchParams]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategory('All');
    setDifficulty('All');
    setSortBy('newest');
    setPage(1);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
            Course Catalog
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Free Courses
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover comprehensive learning modules designed to build real-world proficiency.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 mb-8 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by course title or keyword..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <label htmlFor="sortBySelect" className="text-xs font-bold text-slate-500 whitespace-nowrap">
                Sort by:
              </label>
              <select
                id="sortBySelect"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="py-2.5 px-3 bg-slate-50 text-sm font-semibold text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Enrolled</option>
              </select>

              {(searchTerm || category !== 'All' || difficulty !== 'All' || sortBy !== 'newest') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-bold"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Categories pills & Difficulty filters */}
          <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Topic:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    category === cat
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Difficulty Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 mr-1">Level:</span>
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => {
                    setDifficulty(diff);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    difficulty === diff
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500 font-medium">
          <span>
            Showing <strong className="text-slate-800">{courses.length}</strong> of{' '}
            <strong className="text-slate-800">{total}</strong> published courses
          </span>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200/80"
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8 max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No courses match your criteria</h3>
            <p className="text-xs text-slate-500 mb-6">
              Try modifying your search keywords or clearing your selected filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    page === pageNum
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
