import mongoose, { Document, Schema } from 'mongoose';

export type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseStatus = 'draft' | 'published';

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  summary: string;
  description: string;
  thumbnail: string;
  category: string;
  difficulty: CourseDifficulty;
  learningObjectives: string[];
  prerequisites: string[];
  instructor: mongoose.Types.ObjectId;
  estimatedDuration: string;
  status: CourseStatus;
  enrolledCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    summary: {
      type: String,
      required: [true, 'Short summary is required'],
      trim: true,
      maxlength: [300, 'Summary cannot exceed 300 characters'],
    },
    description: {
      type: String,
      required: [true, 'Full description is required'],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
      required: true,
      index: true,
    },
    learningObjectives: {
      type: [String],
      default: [],
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    estimatedDuration: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      required: true,
      index: true,
    },
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes
CourseSchema.index({ title: 'text', summary: 'text', description: 'text' });
CourseSchema.index({ status: 1, category: 1, difficulty: 1, createdAt: -1 });

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
