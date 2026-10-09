import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { AuthenticatedRequest } from '../middleware/auth';

const updateCourseRatingStats = async (courseId: any) => {
  const reviews = await Review.find({ courseId });
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
      : 0;

  await Course.findByIdAndUpdate(courseId, {
    averageRating,
    reviewCount,
  });
};

export const getCourseReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;

    const reviews = await Review.find({ courseId })
      .populate('studentId', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (
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
    const { rating, comment } = req.body;

    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.',
      });
      return;
    }

    // Must be enrolled student
    const isEnrolled = await Enrollment.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (!isEnrolled) {
      res.status(403).json({
        success: false,
        message: 'Only enrolled students can review this course.',
      });
      return;
    }

    // Only 1 review per student per course
    const existing = await Review.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: 'You have already submitted a review for this course. You can edit your existing review.',
      });
      return;
    }

    const review = await Review.create({
      studentId: req.user._id,
      courseId,
      rating: ratingNum,
      comment: (comment || '').trim(),
    });

    await updateCourseRatingStats(courseId);

    const populatedReview = await Review.findById(review._id).populate('studentId', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { courseId, reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({ _id: reviewId, courseId });
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    if (!review.studentId.equals(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews.',
      });
      return;
    }

    if (rating !== undefined) {
      const ratingNum = Number(rating);
      if (ratingNum < 1 || ratingNum > 5) {
        res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        return;
      }
      review.rating = ratingNum;
    }

    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    await review.save();
    await updateCourseRatingStats(courseId);

    const populatedReview = await Review.findById(review._id).populate('studentId', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { courseId, reviewId } = req.params;

    const review = await Review.findOne({ _id: reviewId, courseId });
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    if (!review.studentId.equals(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews.',
      });
      return;
    }

    await Review.findByIdAndDelete(reviewId);
    await updateCourseRatingStats(courseId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
