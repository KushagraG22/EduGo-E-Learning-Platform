import { Response, NextFunction } from 'express';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { Section } from '../models/Section';
import { Lesson } from '../models/Lesson';
import { Notification } from '../models/Notification';
import { AuthenticatedRequest } from '../middleware/auth';
import { recalculateAndSyncProgress } from '../services/progressService';

export const enrollInCourse = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (req.user.role !== 'student') {
      res.status(403).json({
        success: false,
        message: 'Only students can enroll in courses. Teachers can manage or preview their curriculum.',
      });
      return;
    }

    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    if (course.isDeleted || course.status !== 'published') {
      res.status(400).json({
        success: false,
        message: 'Cannot enroll in a deleted or unpublished course.',
      });
      return;
    }

    // Check duplicate enrollment
    const existing = await Enrollment.findOne({
      studentId: req.user._id,
      courseId: course._id,
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: 'You are already enrolled in this course.',
        enrollment: existing,
      });
      return;
    }

    // Find first lesson for initial lastAccessedLessonId
    const firstSection = await Section.findOne({ courseId: course._id }).sort({ order: 1 });
    let initialLessonId = null;
    if (firstSection) {
      const firstLesson = await Lesson.findOne({ sectionId: firstSection._id, isPublished: true }).sort({
        order: 1,
      });
      if (firstLesson) initialLessonId = firstLesson._id;
    }

    const enrollment = await Enrollment.create({
      studentId: req.user._id,
      courseId: course._id,
      progressPercentage: 0,
      lastAccessedLessonId: initialLessonId,
      lastAccessedAt: new Date(),
    });

    // Increment enrolled count on course
    await Course.findByIdAndUpdate(course._id, { $inc: { enrolledCount: 1 } });

    // Create in-app notification
    await Notification.create({
      recipientId: req.user._id,
      title: 'Course Enrollment Confirmed',
      message: `You have successfully enrolled in "${course.title}". Start learning now!`,
      type: 'enrollment',
      link: `/learn/${course._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course!',
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyLearning = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const enrollments = await Enrollment.find({ studentId: req.user._id })
      .populate({
        path: 'courseId',
        select: 'title slug thumbnail summary category difficulty instructor estimatedDuration',
        populate: {
          path: 'instructor',
          select: 'name avatar',
        },
      })
      .populate('lastAccessedLessonId', 'title')
      .sort({ lastAccessedAt: -1 });

    // Sync counts and progress
    const results = await Promise.all(
      enrollments.map(async (e) => {
        if (!e.courseId) return null;
        const sync = await recalculateAndSyncProgress(req.user!._id, (e.courseId as any)._id);
        return {
          enrollmentId: e._id,
          course: e.courseId,
          progressPercentage: sync.progressPercentage,
          completedRequiredLessons: sync.completedRequiredLessons,
          totalRequiredLessons: sync.totalRequiredLessons,
          isCompleted: sync.isCompleted,
          completedAt: e.completedAt,
          enrolledAt: e.enrolledAt,
          lastAccessedLesson: e.lastAccessedLessonId,
          lastAccessedAt: e.lastAccessedAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      enrollments: results.filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
};

export const getEnrollmentStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(200).json({ success: true, isEnrolled: false });
      return;
    }

    const { courseId } = req.params;
    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId,
    });

    res.status(200).json({
      success: true,
      isEnrolled: !!enrollment,
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const getLearningHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const enrollments = await Enrollment.find({ studentId: req.user._id })
      .populate('courseId', 'title slug thumbnail category difficulty')
      .sort({ updatedAt: -1 });

    const totalEnrolled = enrollments.length;
    const completedCourses = enrollments.filter((e) => e.progressPercentage === 100);
    const inProgressCourses = enrollments.filter(
      (e) => e.progressPercentage > 0 && e.progressPercentage < 100
    );

    res.status(200).json({
      success: true,
      stats: {
        totalEnrolled,
        completedCount: completedCourses.length,
        inProgressCount: inProgressCourses.length,
      },
      history: enrollments.map((e) => ({
        id: e._id,
        course: e.courseId,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
        progressPercentage: e.progressPercentage,
        lastAccessedAt: e.lastAccessedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};
