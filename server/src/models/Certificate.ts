import mongoose, { Document, Schema } from 'mongoose';

export interface ICertificate extends Document {
  _id: mongoose.Types.ObjectId;
  certificateId: string; // e.g. EDUGO-2026-XXXXX
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  studentName: string;
  courseTitle: string;
  teacherName: string;
  completionDate: Date;
  pdfPath: string;
  verificationUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
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
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    courseTitle: {
      type: String,
      required: true,
      trim: true,
    },
    teacherName: {
      type: String,
      required: true,
      trim: true,
    },
    completionDate: {
      type: Date,
      default: Date.now,
    },
    pdfPath: {
      type: String,
      default: '',
    },
    verificationUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

CertificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema);
