import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { AuthenticatedRequest } from '../middleware/auth';

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { name, bio, headline, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (headline !== undefined) user.headline = headline.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        headline: user.headline,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicTeacherProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { teacherId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      res.status(400).json({ success: false, message: 'Invalid teacher ID format' });
      return;
    }

    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' }).select(
      'name avatar bio headline createdAt'
    );

    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher not found' });
      return;
    }

    // Fetch published courses for this teacher
    const publishedCourses = await Course.find({
      instructor: teacher._id,
      status: 'published',
    }).select('title slug summary thumbnail category difficulty enrolledCount averageRating reviewCount createdAt');

    // Calculate overall stats
    const totalStudents = publishedCourses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
    const totalReviews = publishedCourses.reduce((acc, c) => acc + (c.reviewCount || 0), 0);
    const avgRating =
      publishedCourses.length > 0 && totalReviews > 0
        ? publishedCourses.reduce((acc, c) => acc + (c.averageRating || 0) * (c.reviewCount || 0), 0) /
          totalReviews
        : 0;

    res.status(200).json({
      success: true,
      teacher: {
        id: teacher._id,
        name: teacher.name,
        avatar: teacher.avatar,
        bio: teacher.bio,
        headline: teacher.headline,
        joinedAt: teacher.createdAt,
        totalCourses: publishedCourses.length,
        totalStudents,
        totalReviews,
        averageRating: Math.round(avgRating * 10) / 10,
        courses: publishedCourses,
      },
    });
  } catch (error) {
    next(error);
  }
};
