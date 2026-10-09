export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  headline?: string;
}

export type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseStatus = 'draft' | 'published';

export interface Course {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  thumbnail: string;
  category: string;
  difficulty: CourseDifficulty;
  learningObjectives: string[];
  prerequisites: string[];
  instructor: {
    _id: string;
    id?: string;
    name: string;
    avatar?: string;
    headline?: string;
    bio?: string;
  };
  estimatedDuration: string;
  status: CourseStatus;
  enrolledCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  _id: string;
  courseId: string;
  title: string;
  order: number;
  lessons?: Lesson[];
}

export type LessonType = 'video' | 'text' | 'file';

export interface LessonContent {
  videoUrl?: string;
  textHtml?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

export interface Lesson {
  _id: string;
  courseId: string;
  sectionId: string;
  title: string;
  description?: string;
  type: LessonType;
  isRequired: boolean;
  order: number;
  duration?: number;
  content: LessonContent;
  isPublished: boolean;
}

export interface Enrollment {
  enrollmentId?: string;
  _id?: string;
  studentId: string;
  courseId: Course | string;
  course?: Course;
  enrolledAt: string;
  completedAt?: string | null;
  progressPercentage: number;
  completedRequiredLessons?: number;
  totalRequiredLessons?: number;
  isCompleted?: boolean;
  lastAccessedLessonId?: string | { _id: string; title: string };
  lastAccessedLesson?: { _id: string; title: string };
  lastAccessedAt?: string;
}

export interface Review {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  courseId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Announcement {
  _id: string;
  courseId: string;
  teacherId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  title: string;
  message: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'enrollment' | 'announcement' | 'completion' | 'certificate' | 'review' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CertificateItem {
  _id: string;
  certificateId: string;
  studentId: string;
  courseId: Course | string;
  studentName: string;
  courseTitle: string;
  teacherName: string;
  completionDate: string;
  pdfPath: string;
  verificationUrl: string;
}
