import { Response, NextFunction } from 'express';
import { LessonProgress } from '../models/LessonProgress';
import { Enrollment } from '../models/Enrollment';
import { Lesson } from '../models/Lesson';
import { AuthenticatedRequest } from '../middleware/auth';
import { recalculateAndSyncProgress } from '../services/progressService';

export const completeLesson = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { courseId, lessonId } = req.params;

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (!enrollment) {
      res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to save progress.',
      });
      return;
    }

    const lesson = await Lesson.findOne({ _id: lessonId, courseId });
    if (!lesson) {
      res.status(404).json({ success: false, message: 'Lesson not found in this course.' });
      return;
    }

    let progressRecord = await LessonProgress.findOne({
      studentId: req.user._id,
      lessonId,
    });

    if (!progressRecord) {
      progressRecord = await LessonProgress.create({
        studentId: req.user._id,
        courseId,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
      });
    } else {
      progressRecord.isCompleted = true;
      progressRecord.completedAt = new Date();
      await progressRecord.save();
    }

    enrollment.lastAccessedLessonId = lesson._id;
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    // Backend-driven progress calculation & auto-certificate generation
    const syncResult = await recalculateAndSyncProgress(req.user._id, courseId);

    res.status(200).json({
      success: true,
      message: 'Lesson marked as completed.',
      isCompleted: true,
      progressPercentage: syncResult.progressPercentage,
      totalRequiredLessons: syncResult.totalRequiredLessons,
      completedRequiredLessons: syncResult.completedRequiredLessons,
      isCourseCompleted: syncResult.isCompleted,
      certificate: syncResult.certificate,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseProgress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { courseId } = req.params;

    const [progressRecords, syncResult] = await Promise.all([
      LessonProgress.find({
        studentId: req.user._id,
        courseId,
      }),
      recalculateAndSyncProgress(req.user._id, courseId),
    ]);

    const completedLessonIds = progressRecords
      .filter((p) => p.isCompleted)
      .map((p) => p.lessonId.toString());

    res.status(200).json({
      success: true,
      progressPercentage: syncResult.progressPercentage,
      completedLessonIds,
      totalRequiredLessons: syncResult.totalRequiredLessons,
      completedRequiredLessons: syncResult.completedRequiredLessons,
      isCompleted: syncResult.isCompleted,
    });
  } catch (error) {
    next(error);
  }
};

export const trackPlayback = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { courseId, lessonId } = req.params;
    const { watchedSeconds } = req.body;

    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (enrollment) {
      enrollment.lastAccessedLessonId = lessonId as any;
      enrollment.lastAccessedAt = new Date();
      await enrollment.save();
    }

    if (watchedSeconds !== undefined) {
      await LessonProgress.findOneAndUpdate(
        { studentId: req.user._id, lessonId },
        {
          courseId,
          watchedSeconds: Math.max(0, parseInt(watchedSeconds, 10) || 0),
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
