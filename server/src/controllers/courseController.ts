import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Course } from '../models/Course';
import { Section } from '../models/Section';
import { Lesson } from '../models/Lesson';
import { Enrollment } from '../models/Enrollment';
import { Review } from '../models/Review';
import { AuthenticatedRequest } from '../middleware/auth';

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .concat('-', Math.random().toString(36).substring(2, 7));
};

export const getCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, category, difficulty, sortBy = 'newest', page = '1', limit = '12' } = req.query;

    const query: any = { status: 'published', isDeleted: { $ne: true } };

    if (search) {
      query.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { summary: { $regex: search as string, $options: 'i' } },
        { category: { $regex: search as string, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    let sortOption: any = { createdAt: -1 };
    if (sortBy === 'rating') {
      sortOption = { averageRating: -1, reviewCount: -1 };
    } else if (sortBy === 'popular') {
      sortOption = { enrolledCount: -1, createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('instructor', 'name avatar headline')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Course.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idOrSlug } = req.params;

    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const course = await Course.findOne(
      isObjectId ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] } : { slug: idOrSlug }
    ).populate('instructor', 'name avatar bio headline');

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    // If course is deleted or archived, only enrolled students or its instructor can access
    if (course.isDeleted || course.status === 'archived') {
      let isAllowed = false;
      if (req.user) {
        if (course.instructor.equals(req.user._id)) {
          isAllowed = true;
        } else if (req.user.role === 'student') {
          const enrollment = await Enrollment.findOne({
            studentId: req.user._id,
            courseId: course._id,
          });
          if (enrollment) isAllowed = true;
        }
      }
      if (!isAllowed) {
        res.status(404).json({
          success: false,
          message: 'This course has been archived by the instructor and is no longer available.',
        });
        return;
      }
    }

    // If course is draft, only its instructor can view it
    if (course.status === 'draft') {
      if (!req.user || !course.instructor.equals(req.user._id)) {
        res.status(403).json({ success: false, message: 'This course is currently in draft mode.' });
        return;
      }
    }

    // Fetch sections and lessons
    const sections = await Section.find({ courseId: course._id }).sort({ order: 1 });
    const sectionIds = sections.map((s) => s._id);

    const lessons = await Lesson.find({
      sectionId: { $in: sectionIds },
      isPublished: true,
    }).sort({ order: 1 });

    // Check enrollment status for current user
    let isEnrolled = false;
    let enrollmentProgress = 0;
    if (req.user && req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        studentId: req.user._id,
        courseId: course._id,
      });
      if (enrollment) {
        isEnrolled = true;
        enrollmentProgress = enrollment.progressPercentage;
      }
    }

    const curriculum = sections.map((section) => ({
      _id: section._id,
      title: section.title,
      order: section.order,
      lessons: lessons
        .filter((l) => l.sectionId.equals(section._id))
        .map((l) => ({
          _id: l._id,
          title: l.title,
          type: l.type,
          isRequired: l.isRequired,
          duration: l.duration,
          order: l.order,
        })),
    }));

    res.status(200).json({
      success: true,
      course,
      curriculum,
      isEnrolled,
      enrollmentProgress,
    });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const {
      title,
      summary,
      description,
      thumbnail,
      category,
      difficulty,
      learningObjectives,
      prerequisites,
      estimatedDuration,
    } = req.body;

    if (!title || !summary || !description || !category) {
      res.status(400).json({
        success: false,
        message: 'Title, summary, description, and category are required.',
      });
      return;
    }

    const slug = slugify(title);

    const course = await Course.create({
      title: title.trim(),
      slug,
      summary: summary.trim(),
      description,
      thumbnail: thumbnail || '',
      category: category.trim(),
      difficulty: difficulty || 'Beginner',
      learningObjectives: Array.isArray(learningObjectives) ? learningObjectives : [],
      prerequisites: Array.isArray(prerequisites) ? prerequisites : [],
      estimatedDuration: estimatedDuration || '',
      instructor: req.user._id,
      status: 'draft',
    });

    res.status(201).json({
      success: true,
      message: 'Course draft created successfully.',
      course,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (
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
    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    if (!course.instructor.equals(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'You can only edit courses you created.',
      });
      return;
    }

    const {
      title,
      summary,
      description,
      thumbnail,
      category,
      difficulty,
      learningObjectives,
      prerequisites,
      estimatedDuration,
    } = req.body;

    if (title) course.title = title.trim();
    if (summary) course.summary = summary.trim();
    if (description) course.description = description;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (category) course.category = category.trim();
    if (difficulty) course.difficulty = difficulty;
    if (learningObjectives) course.learningObjectives = learningObjectives;
    if (prerequisites) course.prerequisites = prerequisites;
    if (estimatedDuration !== undefined) course.estimatedDuration = estimatedDuration;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      course,
    });
  } catch (error) {
    next(error);
  }
};

export const togglePublishCourse = async (
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
    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    if (!course.instructor.equals(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'You can only publish or unpublish your own courses.',
      });
      return;
    }

    // If publishing, validate completeness
    if (course.status === 'draft') {
      const sectionsCount = await Section.countDocuments({ courseId: course._id });
      if (sectionsCount === 0) {
        res.status(400).json({
          success: false,
          message: 'Cannot publish course: You must add at least one curriculum section.',
        });
        return;
      }

      const requiredLessonsCount = await Lesson.countDocuments({
        courseId: course._id,
        isRequired: true,
      });

      if (requiredLessonsCount === 0) {
        res.status(400).json({
          success: false,
          message: 'Cannot publish course: You must add at least one required lesson.',
        });
        return;
      }

      course.status = 'published';
    } else {
      course.status = 'draft';
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: `Course is now ${course.status}.`,
      status: course.status,
      course,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (req.user.role !== 'teacher') {
      res.status(403).json({ success: false, message: 'Only teachers can delete courses.' });
      return;
    }

    const { courseId } = req.params;
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ success: false, message: 'Invalid course ID format' });
      return;
    }

    const course = await Course.findById(courseId);

    if (!course || course.isDeleted) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    if (!course.instructor.equals(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'You cannot delete another teacher’s course.',
      });
      return;
    }

    // Safe deletion: soft delete / archival to preserve student certificates and learning history
    course.isDeleted = true;
    course.status = 'archived';
    course.deletedAt = new Date();
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course successfully deleted and removed from public catalog. Existing student certificates and learning history remain safely preserved.',
    });
  } catch (error) {
    next(error);
  }
};

export const getTeacherCourses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { status } = req.query;
    const filter: any = { instructor: req.user._id, isDeleted: { $ne: true } };
    if (status && ['draft', 'published', 'archived'].includes(status as string)) {
      filter.status = status;
    }

    const courses = await Course.find(filter).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeacherDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const courses = await Course.find({ instructor: req.user._id, isDeleted: { $ne: true } });
    const courseIds = courses.map((c) => c._id);

    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c) => c.status === 'published').length;
    const draftCourses = courses.filter((c) => c.status === 'draft').length;
    const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);

    const totalReviews = courses.reduce((sum, c) => sum + (c.reviewCount || 0), 0);
    const avgRating =
      totalReviews > 0
        ? courses.reduce((sum, c) => sum + (c.averageRating || 0) * (c.reviewCount || 0), 0) /
          totalReviews
        : 0;

    // Recent enrollments in teacher courses
    const recentEnrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .populate('studentId', 'name email avatar')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalCourses,
        publishedCourses,
        draftCourses,
        totalEnrollments,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews,
      },
      recentEnrollments,
      recentCourses: courses.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseStudents = async (
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
    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    if (!course.instructor.equals(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'You can only view students for your own courses.',
      });
      return;
    }

    const enrollments = await Enrollment.find({ courseId: course._id })
      .populate('studentId', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      courseTitle: course.title,
      totalEnrolled: enrollments.length,
      students: enrollments.map((e) => ({
        enrollmentId: e._id,
        student: e.studentId,
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
