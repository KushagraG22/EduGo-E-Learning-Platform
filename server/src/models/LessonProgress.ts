import mongoose, { Document, Schema } from 'mongoose';

export interface ILessonProgress extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  isCompleted: boolean;
  completedAt: Date | null;
  watchedSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

const LessonProgressSchema = new Schema<ILessonProgress>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    watchedSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

LessonProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
LessonProgressSchema.index({ studentId: 1, courseId: 1, isCompleted: 1 });

export const LessonProgress = mongoose.model<ILessonProgress>('LessonProgress', LessonProgressSchema);
