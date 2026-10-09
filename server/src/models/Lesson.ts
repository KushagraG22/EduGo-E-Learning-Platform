import mongoose, { Document, Schema } from 'mongoose';

export type LessonType = 'video' | 'text' | 'file';

export interface ILessonContent {
  videoUrl?: string;
  textHtml?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

export interface ILesson extends Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: LessonType;
  isRequired: boolean;
  order: number;
  duration?: number; // duration in minutes
  content: ILessonContent;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LessonContentSchema = new Schema<ILessonContent>(
  {
    videoUrl: { type: String, default: '' },
    textHtml: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    fileType: { type: String, default: '' },
  },
  { _id: false }
);

const LessonSchema = new Schema<ILesson>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      maxlength: [150, 'Lesson title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['video', 'text', 'file'],
      required: true,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    content: {
      type: LessonContentSchema,
      default: () => ({}),
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

LessonSchema.index({ sectionId: 1, order: 1 });
LessonSchema.index({ courseId: 1, isRequired: 1 });

export const Lesson = mongoose.model<ILesson>('Lesson', LessonSchema);
