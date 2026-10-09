import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock } from 'lucide-react';
import { Course } from '../../types';
import { Badge } from '../common/Badge';
import { RatingStars } from '../common/RatingStars';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const defaultThumbnail =
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Thumbnail */}
      <Link
        to={`/courses/${course.slug || course._id}`}
        className="relative block aspect-video overflow-hidden bg-slate-100"
      >
        <img
          src={course.thumbnail || defaultThumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge variant="category">{course.category}</Badge>
          <Badge variant="difficulty" difficulty={course.difficulty} />
        </div>
      </Link>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Instructor line */}
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
              {course.instructor?.avatar ? (
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                course.instructor?.name?.charAt(0) || 'T'
              )}
            </div>
            <Link
              to={`/teachers/${course.instructor?._id || course.instructor?.id}`}
              className="text-xs text-slate-500 hover:text-brand-600 transition-colors font-medium truncate"
            >
              {course.instructor?.name || 'EduGo Instructor'}
            </Link>
          </div>

          {/* Title */}
          <Link
            to={`/courses/${course.slug || course._id}`}
            className="block text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug mb-2"
          >
            {course.title}
          </Link>

          {/* Short Summary */}
          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {course.summary}
          </p>
        </div>

        <div>
          {/* Rating */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <RatingStars
              rating={course.averageRating || 0}
              reviewCount={course.reviewCount || 0}
              showNumber
              size="sm"
            />
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
              FREE
            </span>
          </div>

          {/* Meta stats */}
          <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{course.enrolledCount || 0} students</span>
            </div>
            {course.estimatedDuration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{course.estimatedDuration}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
