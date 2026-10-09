import { Response, NextFunction } from 'express';
import { Announcement } from '../models/Announcement';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { Notification } from '../models/Notification';
import { AuthenticatedRequest } from '../middleware/auth';

export const getCourseAnnouncements = async (
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

    const isInstructor = course.instructor.equals(req.user._id);
    let isEnrolled = false;

    if (!isInstructor) {
      const enrollment = await Enrollment.findOne({
        studentId: req.user._id,
        courseId,
      });
      if (enrollment) isEnrolled = true;
    }

    if (!isInstructor && !isEnrolled) {
      res.status(403).json({
        success: false,
        message: 'Only enrolled students and the course instructor can view announcements.',
      });
      return;
    }

    const announcements = await Announcement.find({ courseId })
      .populate('teacherId', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (
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
    const { title, message } = req.body;

    if (!title || !message) {
      res.status(400).json({
        success: false,
        message: 'Announcement title and message are required.',
      });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    if (!course.instructor.equals(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'You can only post announcements for courses you teach.',
      });
      return;
    }

    const announcement = await Announcement.create({
      courseId,
      teacherId: req.user._id,
      title: title.trim(),
      message: message.trim(),
    });

    // Notify all enrolled students in this course
    const enrollments = await Enrollment.find({ courseId }).select('studentId');
    if (enrollments.length > 0) {
      const notifications = enrollments.map((e) => ({
        recipientId: e.studentId,
        title: `New announcement: ${course.title}`,
        message: `Teacher ${req.user!.name} posted: "${title.trim()}"`,
        type: 'announcement',
        link: `/learn/${course._id}`,
      }));
      await Notification.insertMany(notifications);
    }

    const populatedAnnouncement = await Announcement.findById(announcement._id).populate(
      'teacherId',
      'name avatar'
    );

    res.status(201).json({
      success: true,
      message: 'Announcement posted successfully.',
      announcement: populatedAnnouncement,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { courseId, announcementId } = req.params;
    const { title, message } = req.body;

    const announcement = await Announcement.findOne({ _id: announcementId, courseId });
    if (!announcement) {
      res.status(404).json({ success: false, message: 'Announcement not found' });
      return;
    }

    if (!announcement.teacherId.equals(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'You can only edit announcements you authored.',
      });
      return;
    }

    if (title) announcement.title = title.trim();
    if (message) announcement.message = message.trim();

    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully.',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { courseId, announcementId } = req.params;

    const announcement = await Announcement.findOne({ _id: announcementId, courseId });
    if (!announcement) {
      res.status(404).json({ success: false, message: 'Announcement not found' });
      return;
    }

    if (!announcement.teacherId.equals(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'You can only delete announcements you authored.',
      });
      return;
    }

    await Announcement.findByIdAndDelete(announcementId);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
