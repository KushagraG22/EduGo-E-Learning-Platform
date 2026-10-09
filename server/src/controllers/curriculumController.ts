import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Course } from '../models/Course';
import { Section } from '../models/Section';
import { Lesson } from '../models/Lesson';
import { Enrollment } from '../models/Enrollment';
import { AuthenticatedRequest } from '../middleware/auth';

const verifyCourseOwner = async (courseId: string, userId: mongoose.Types.ObjectId) => {
  const course = await Course.findById(courseId);
  if (!course) return { error: 'Course not found', status: 404 };
  if (!course.instructor.equals(userId)) {
    return { error: 'Unauthorized: You do not own this course', status: 403 };
  }
  return { course };
};

// SECTION CONTROLLERS
export const createSection = async (
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
    const { title } = req.body;

    if (!title) {
      res.status(400).json({ success: false, message: 'Section title is required' });
      return;
    }

    const check = await verifyCourseOwner(courseId, req.user._id);
    if (check.error) {
      res.status(check.status).json({ success: false, message: check.error });
      return;
    }

    const count = await Section.countDocuments({ courseId });
    const section = await Section.create({
      courseId,
      title: title.trim(),
      order: count,
    });

    res.status(201).json({ success: true, section });
  } catch (error) {
    next(error);
  }
};

export const updateSection = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { courseId, sectionId } = req.params;
    const { title, order } = req.body;

    const check = await verifyCourseOwner(courseId, req.user._id);
    if (check.error) {
      res.status(check.status).json({ success: false, message: check.error });
      return;
    }

    const section = await Section.findOne({ _id: sectionId, courseId });
    if (!section) {
      res.status(404).json({ success: false, message: 'Section not found' });
      return;
    }

    if (title) section.title = title.trim();
    if (order !== undefined) section.order = order;

    await section.save();

    res.status(200).json({ success: true, section });
  } catch (error) {
    next(error);
  }
};

export const deleteSection = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { courseId, sectionId } = req.params;

    const check = await verifyCourseOwner(courseId, req.user._id);
    if (check.error) {
      res.status(check.status).json({ success: false, message: check.error });
      return;
    }

    const section = await Section.findOne({ _id: sectionId, courseId });
    if (!section) {
      res.status(404).json({ success: false, message: 'Section not found' });
      return;
    }

    await Lesson.deleteMany({ sectionId });
    await Section.findByIdAndDelete(sectionId);

    res.status(200).json({ success: true, message: 'Section and lessons deleted' });
  } catch (error) {
    next(error);
  }
};

// LESSON CONTROLLERS
export const createLesson = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { courseId, sectionId } = req.params;
    const { title, description, type, isRequired = true, duration = 0, content } = req.body;

    if (!title || !type) {
      res.status(400).json({ success: false, message: 'Lesson title and type are required' });
      return;
    }

    // STRICT: Only video, text, or file
    if (!['video', 'text', 'file'].includes(type)) {
      res.status(400).json({
        success: false,
        message: 'Invalid lesson type. Must be video, text, or file.',
      });
      return;
    }

    const check = await verifyCourseOwner(courseId, req.user._id);
    if (check.error) {
      res.status(check.status).json({ success: false, message: check.error });
      return;
    }

    const section = await Section.findOne({ _id: sectionId, courseId });
    if (!section) {
      res.status(404).json({ success: false, message: 'Section not found in this course' });
      return;
    }

    const count = await Lesson.countDocuments({ sectionId });

    const lesson = await Lesson.create({
      courseId,
      sectionId,
      title: title.trim(),
      description: description || '',
      type,
      isRequired,
      duration: duration || 0,
      order: count,
      content: content || {},
      isPublished: true,
    });

    res.status(201).json({ success: true, lesson });
  } catch (error) {
    next(error);
  }
};

export const updateLesson = async (
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
    const { title, description, type, isRequired, duration, content, isPublished, order } = req.body;

    const check = await verifyCourseOwner(courseId, req.user._id);
    if (check.error) {
      res.status(check.status).json({ success: false, message: check.error });
      return;
    }

    const lesson = await Lesson.findOne({ _id: lessonId, courseId });
    if (!lesson) {
      res.status(404).json({ success: false, message: 'Lesson not found' });
      return;
    }

    if (type && !['video', 'text', 'file'].includes(type)) {
      res.status(400).json({ success: false, message: 'Lesson type must be video, text, or file.' });
      return;
    }

    if (title) lesson.title = title.trim();
    if (description !== undefined) lesson.description = description;
    if (type) lesson.type = type;
    if (isRequired !== undefined) lesson.isRequired = isRequired;
    if (duration !== undefined) lesson.duration = duration;
    if (content !== undefined) lesson.content = content;
    if (isPublished !== undefined) lesson.isPublished = isPublished;
    if (order !== undefined) lesson.order = order;

    await lesson.save();

    res.status(200).json({ success: true, lesson });
  } catch (error) {
    next(error);
  }
};

export const deleteLesson = async (
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

    const check = await verifyCourseOwner(courseId, req.user._id);
    if (check.error) {
      res.status(check.status).json({ success: false, message: check.error });
      return;
    }

    const lesson = await Lesson.findOneAndDelete({ _id: lessonId, courseId });
    if (!lesson) {
      res.status(404).json({ success: false, message: 'Lesson not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Lesson successfully deleted' });
  } catch (error) {
    next(error);
  }
};

// GET COMPLETE CURRICULUM FOR TEACHER OR ENROLLED LEARNER
export const getFullCurriculum = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate('instructor', 'name avatar bio');
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    // Permission check: Must be course instructor OR enrolled student
    const isInstructor = req.user && course.instructor.equals(req.user._id);
    let isEnrolled = false;

    if (req.user && req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        studentId: req.user._id,
        courseId: course._id,
      });
      if (enrollment) isEnrolled = true;
    }

    if (!isInstructor && !isEnrolled) {
      res.status(403).json({
        success: false,
        message: 'Access restricted: Please enroll in this free course to access learning content.',
      });
      return;
    }

    const sections = await Section.find({ courseId: course._id }).sort({ order: 1 });
    const sectionIds = sections.map((s) => s._id);

    const lessonsQuery: any = { sectionId: { $in: sectionIds } };
    if (!isInstructor) {
      lessonsQuery.isPublished = true;
    }

    const lessons = await Lesson.find(lessonsQuery).sort({ order: 1 });

    const curriculum = sections.map((section) => ({
      _id: section._id,
      title: section.title,
      order: section.order,
      lessons: lessons.filter((l) => l.sectionId.equals(section._id)),
    }));

    res.status(200).json({
      success: true,
      course,
      curriculum,
    });
  } catch (error) {
    next(error);
  }
};
