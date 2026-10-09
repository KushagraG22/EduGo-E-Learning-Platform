import { Router } from 'express';
import {
  getCourses,
  getCourseDetails,
  createCourse,
  updateCourse,
  togglePublishCourse,
  deleteCourse,
  getTeacherCourses,
  getTeacherDashboardStats,
  getCourseStudents,
} from '../controllers/courseController';
import {
  createSection,
  updateSection,
  deleteSection,
  createLesson,
  updateLesson,
  deleteLesson,
  getFullCurriculum,
} from '../controllers/curriculumController';
import { enrollInCourse, getEnrollmentStatus } from '../controllers/enrollmentController';
import {
  completeLesson,
  getCourseProgress,
  trackPlayback,
} from '../controllers/progressController';
import {
  getCourseReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController';
import {
  getCourseAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

// Teacher dashboard & management routes (Must come before /:idOrSlug)
router.get('/teacher/my-courses', authenticate, authorize('teacher'), getTeacherCourses);
router.get('/teacher/dashboard-stats', authenticate, authorize('teacher'), getTeacherDashboardStats);

// Public exploration
router.get('/', getCourses);
router.get('/:idOrSlug', optionalAuthenticate, getCourseDetails);

// Course creation & editing (Teachers)
router.post('/', authenticate, authorize('teacher'), createCourse);
router.put('/:courseId', authenticate, authorize('teacher'), updateCourse);
router.patch('/:courseId/publish', authenticate, authorize('teacher'), togglePublishCourse);
router.delete('/:courseId', authenticate, authorize('teacher'), deleteCourse);
router.get('/:courseId/students', authenticate, authorize('teacher'), getCourseStudents);

// Curriculum Management
router.get('/:courseId/curriculum', authenticate, getFullCurriculum);
router.post('/:courseId/sections', authenticate, authorize('teacher'), createSection);
router.put('/:courseId/sections/:sectionId', authenticate, authorize('teacher'), updateSection);
router.delete('/:courseId/sections/:sectionId', authenticate, authorize('teacher'), deleteSection);

// Lessons
router.post('/:courseId/sections/:sectionId/lessons', authenticate, authorize('teacher'), createLesson);
router.put('/:courseId/lessons/:lessonId', authenticate, authorize('teacher'), updateLesson);
router.delete('/:courseId/lessons/:lessonId', authenticate, authorize('teacher'), deleteLesson);

// Enrollment
router.post('/:courseId/enroll', authenticate, authorize('student'), enrollInCourse);
router.get('/:courseId/enrollment-status', optionalAuthenticate, getEnrollmentStatus);

// Progress
router.get('/:courseId/progress', authenticate, authorize('student'), getCourseProgress);
router.post('/:courseId/lessons/:lessonId/complete', authenticate, authorize('student'), completeLesson);
router.post('/:courseId/lessons/:lessonId/track', authenticate, authorize('student'), trackPlayback);

// Reviews
router.get('/:courseId/reviews', getCourseReviews);
router.post('/:courseId/reviews', authenticate, authorize('student'), createReview);
router.put('/:courseId/reviews/:reviewId', authenticate, authorize('student'), updateReview);
router.delete('/:courseId/reviews/:reviewId', authenticate, authorize('student'), deleteReview);

// Announcements
router.get('/:courseId/announcements', authenticate, getCourseAnnouncements);
router.post('/:courseId/announcements', authenticate, authorize('teacher'), createAnnouncement);
router.put('/:courseId/announcements/:announcementId', authenticate, authorize('teacher'), updateAnnouncement);
router.delete('/:courseId/announcements/:announcementId', authenticate, authorize('teacher'), deleteAnnouncement);

export default router;
