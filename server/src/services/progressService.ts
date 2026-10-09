import mongoose from 'mongoose';
import { Lesson } from '../models/Lesson';
import { LessonProgress } from '../models/LessonProgress';
import { Enrollment } from '../models/Enrollment';
import { Certificate } from '../models/Certificate';
import { Course } from '../models/Course';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { generateCertificatePDF } from './certificateGenerator';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export interface ProgressCalculationResult {
  progressPercentage: number;
  totalRequiredLessons: number;
  completedRequiredLessons: number;
  isCompleted: boolean;
  certificate?: any;
}

export const recalculateAndSyncProgress = async (
  studentId: string | mongoose.Types.ObjectId,
  courseId: string | mongoose.Types.ObjectId
): Promise<ProgressCalculationResult> => {
  // Find all required, published lessons in this course
  const requiredLessons = await Lesson.find({
    courseId,
    isRequired: true,
    isPublished: true,
  }).select('_id');

  const totalRequiredLessons = requiredLessons.length;
  const requiredLessonIds = requiredLessons.map((l) => l._id.toString());

  // Find all completed lessons by this student for this course
  const completedProgressRecords = await LessonProgress.find({
    studentId,
    courseId,
    isCompleted: true,
  }).select('lessonId');

  const completedRequiredLessons = completedProgressRecords.filter((rec) =>
    requiredLessonIds.includes(rec.lessonId.toString())
  ).length;

  const progressPercentage =
    totalRequiredLessons > 0
      ? Math.min(100, Math.round((completedRequiredLessons / totalRequiredLessons) * 100))
      : 0;

  const isCompleted = progressPercentage === 100 && totalRequiredLessons > 0;

  // Update Enrollment
  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (enrollment) {
    enrollment.progressPercentage = progressPercentage;
    if (isCompleted && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
    }
    await enrollment.save();
  }

  // Handle certificate generation if 100% completed
  let certificate = null;
  if (isCompleted) {
    certificate = await Certificate.findOne({ studentId, courseId });

    if (!certificate) {
      const course = await Course.findById(courseId).populate('instructor', 'name');
      const student = await User.findById(studentId);

      if (course && student) {
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const year = new Date().getFullYear();
        const certificateId = `EDUGO-${year}-${randomCode}`;
        const teacherName = (course.instructor as any)?.name || 'Course Instructor';
        const verificationUrl = `${config.clientUrl}/verify/${certificateId}`;

        try {
          const pdfPath = await generateCertificatePDF({
            certificateId,
            studentName: student.name,
            courseTitle: course.title,
            teacherName,
            completionDate: new Date(),
            verificationUrl,
          });

          certificate = await Certificate.create({
            certificateId,
            studentId,
            courseId,
            studentName: student.name,
            courseTitle: course.title,
            teacherName,
            completionDate: new Date(),
            pdfPath,
            verificationUrl,
          });

          // Create notification for certificate
          await Notification.create({
            recipientId: studentId,
            title: 'Certificate Awarded!',
            message: `Congratulations! You have completed "${course.title}". Your official certificate is ready to download.`,
            type: 'certificate',
            link: '/certificates',
          });

          logger.info(`[ProgressService] Certificate issued for student ${student.email} on course "${course.title}" (${certificateId})`);
        } catch (pdfErr) {
          logger.error('[ProgressService] Failed to generate certificate PDF:', pdfErr);
        }
      }
    }
  }

  return {
    progressPercentage,
    totalRequiredLessons,
    completedRequiredLessons,
    isCompleted,
    certificate,
  };
};
