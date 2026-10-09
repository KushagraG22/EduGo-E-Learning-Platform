import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Section } from '../models/Section';
import { Lesson } from '../models/Lesson';
import { Enrollment } from '../models/Enrollment';
import { Certificate } from '../models/Certificate';
import { PasswordResetToken } from '../models/PasswordResetToken';

describe('EduGo Platform API Comprehensive Test Suite', () => {
  let teacherToken: string;
  let teacher2Token: string;
  let studentToken: string;
  let teacherId: string;
  let teacher2Id: string;
  let studentId: string;
  let testCourseId: string;
  let testSectionId: string;
  let testLessonId: string;
  let optionalLessonId: string;
  let issuedCertificateId: string;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Health Check & Basic Endpoints', () => {
    it('should return 200 OK for /api/health with EduGo brand metadata', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.app).toBe('EduGo');
      expect(res.body.tagline).toBe('Learn on the Move');
    });
  });

  describe('2. Authentication Flow & Role Enforcement', () => {
    it('should successfully register a new student', async () => {
      const email = `test.student.${Date.now()}@edugo.test`;
      const res = await request(app).post('/api/auth/register').send({
        name: 'Automated Student Tester',
        email,
        password: 'Password123!',
        role: 'student',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('student');
      studentToken = res.body.token;
      studentId = res.body.user.id;
    });

    it('should successfully register a new teacher', async () => {
      const email = `test.teacher.${Date.now()}@edugo.test`;
      const res = await request(app).post('/api/auth/register').send({
        name: 'Automated Teacher Tester',
        email,
        password: 'Password123!',
        role: 'teacher',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('teacher');
      teacherToken = res.body.token;
      teacherId = res.body.user.id;
    });

    it('should register a second teacher to test unauthorized cross-course edits', async () => {
      const email = `test.teacher2.${Date.now()}@edugo.test`;
      const res = await request(app).post('/api/auth/register').send({
        name: 'Second Teacher Tester',
        email,
        password: 'Password123!',
        role: 'teacher',
      });

      expect(res.status).toBe(201);
      teacher2Token = res.body.token;
      teacher2Id = res.body.user.id;
    });

    it('should reject registration with duplicate email', async () => {
      const user = await User.findById(studentId);
      const res = await request(app).post('/api/auth/register').send({
        name: 'Duplicate Student',
        email: user?.email,
        password: 'Password123!',
        role: 'student',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with incorrect password', async () => {
      const user = await User.findById(studentId);
      const res = await request(app).post('/api/auth/login').send({
        email: user?.email,
        password: 'WrongPassword999!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should successfully log in with valid credentials and return JWT', async () => {
      const user = await User.findById(studentId);
      const res = await request(app).post('/api/auth/login').send({
        email: user?.email,
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should return current authenticated profile from /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(studentId);
    });
  });

  describe('2.1. Google OAuth Endpoints & Token Security', () => {
    it('should return client configuration status from /api/auth/config', async () => {
      const res = await request(app).get('/api/auth/config');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('googleClientId');
      expect(res.body).toHaveProperty('isGoogleConfigured');
      expect(res.body).toHaveProperty('clientUrl');
    });

    it('should reject Google login if neither credential nor code is provided', async () => {
      const res = await request(app).post('/api/auth/google').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    it('should cleanly reject invalid/tampered Google token without 500 server crash', async () => {
      const res = await request(app).post('/api/auth/google').send({
        credential: 'fake_invalid_google_jwt_token.tampered.signature',
      });
      // Returns 400 Bad Request with user-friendly error message
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('2.2. Password Reset Full Flow (Email Delivery, Secure Hash & Single-Use Enforcement)', () => {
    let capturedResetToken: string;

    it('should respond with identical generic message for nonexistent email (prevent enumeration)', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({
        email: 'nobody_exists_with_this_address@edugo.test',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('password reset instructions have been sent');
    });

    it('should successfully dispatch password reset email for registered user', async () => {
      const user = await User.findById(studentId);
      expect(user).toBeDefined();

      const res = await request(app).post('/api/auth/forgot-password').send({
        email: user?.email,
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify email dispatch via dev inspection endpoint
      const emailRes = await request(app).get('/api/auth/dev-last-email');
      expect(emailRes.status).toBe(200);
      expect(emailRes.body.lastEmail).toBeDefined();
      expect(emailRes.body.lastEmail.to).toBe(user?.email);
      expect(emailRes.body.lastEmail.subject).toContain('Reset Your Password');
      expect(emailRes.body.lastEmail.resetUrl).toContain('token=');

      // Extract raw token from resetUrl
      const url = new URL(emailRes.body.lastEmail.resetUrl);
      capturedResetToken = url.searchParams.get('token') || '';
      expect(capturedResetToken).toBeTruthy();
    });

    it('should verify reset token is stored hashed in MongoDB with 1-hour expiration', async () => {
      const resetRecord = await PasswordResetToken.findOne({ userId: studentId }).sort({ createdAt: -1 });
      expect(resetRecord).toBeDefined();
      expect(resetRecord?.usedAt).toBeNull();
      expect(resetRecord?.expiresAt.getTime()).toBeGreaterThan(Date.now());
      // Raw token must NOT be stored in plain text
      expect(resetRecord?.tokenHash).not.toBe(capturedResetToken);
    });

    it('should reject reset attempt with invalid or manipulated token', async () => {
      const res = await request(app).post('/api/auth/reset-password').send({
        token: 'invalid_tampered_token_1234567890',
        newPassword: 'BrandNewPassword123!',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('invalid, expired, or already used');
    });

    it('should reject reset attempt with password shorter than 6 characters', async () => {
      const res = await request(app).post('/api/auth/reset-password').send({
        token: capturedResetToken,
        newPassword: '123',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('at least 6 characters');
    });

    it('should successfully reset password with valid token and hash new password', async () => {
      const res = await request(app).post('/api/auth/reset-password').send({
        token: capturedResetToken,
        newPassword: 'UpdatedNewPassword999!',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('successfully reset');

      // Verify token is marked used in DB
      const resetRecord = await PasswordResetToken.findOne({ userId: studentId }).sort({ createdAt: -1 });
      expect(resetRecord?.usedAt).toBeDefined();
      expect(resetRecord?.usedAt).not.toBeNull();
    });

    it('should enforce single-use and reject reusing the same reset token', async () => {
      const res = await request(app).post('/api/auth/reset-password').send({
        token: capturedResetToken,
        newPassword: 'YetAnotherPassword123!',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('invalid, expired, or already used');
    });

    it('should prevent login with old password and succeed with new password', async () => {
      const user = await User.findById(studentId);

      // Old password must fail
      const oldLoginRes = await request(app).post('/api/auth/login').send({
        email: user?.email,
        password: 'Password123!',
      });
      expect(oldLoginRes.status).toBe(401);

      // New password must succeed
      const newLoginRes = await request(app).post('/api/auth/login').send({
        email: user?.email,
        password: 'UpdatedNewPassword999!',
      });
      expect(newLoginRes.status).toBe(200);
      expect(newLoginRes.body.success).toBe(true);
      expect(newLoginRes.body.token).toBeDefined();
      // Update studentToken for subsequent tests
      studentToken = newLoginRes.body.token;
    });
  });

  describe('3. Course Management & Curriculum (Teacher)', () => {
    it('should allow teacher to create a new draft course', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Automated Test Course',
          summary: 'A course created during automated testing',
          description: '<p>Comprehensive test course description.</p>',
          category: 'Web Development',
          difficulty: 'Beginner',
          learningObjectives: ['Learn automated testing', 'Verify permissions'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.course.status).toBe('draft');
      testCourseId = res.body.course._id;
    });

    it('should NOT list draft course in public courses exploration', async () => {
      const res = await request(app).get('/api/courses?search=Automated+Test+Course');
      expect(res.status).toBe(200);
      const found = res.body.data.some((c: any) => c._id === testCourseId);
      expect(found).toBe(false);
    });

    it('should reject students from creating courses (role check)', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Student Attempt Course',
          summary: 'Should fail',
          description: 'Should fail',
          category: 'Web Development',
        });

      expect(res.status).toBe(403);
    });

    it('should allow teacher to create curriculum sections and lessons', async () => {
      // 1. Create Section
      const secRes = await request(app)
        .post(`/api/courses/${testCourseId}/sections`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ title: 'Section 1: Test Fundamentals' });

      expect(secRes.status).toBe(201);
      testSectionId = secRes.body.section._id;

      // 2. Create Required Lesson (video)
      const lesRes = await request(app)
        .post(`/api/courses/${testCourseId}/sections/${testSectionId}/lessons`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Lesson 1: Introduction Video',
          type: 'video',
          isRequired: true,
          content: { videoUrl: 'https://example.com/video.mp4' },
        });

      expect(lesRes.status).toBe(201);
      testLessonId = lesRes.body.lesson._id;

      // 3. Create Optional Lesson (file)
      const optRes = await request(app)
        .post(`/api/courses/${testCourseId}/sections/${testSectionId}/lessons`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Lesson 2: Optional Cheat Sheet',
          type: 'file',
          isRequired: false,
          content: { fileUrl: 'https://example.com/cheatsheet.pdf', fileName: 'cheat.pdf' },
        });

      expect(optRes.status).toBe(201);
      optionalLessonId = optRes.body.lesson._id;
    });

    it('should prevent teacher 2 from modifying teacher 1 course', async () => {
      const res = await request(app)
        .put(`/api/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${teacher2Token}`)
        .send({ title: 'Malicious Update by Another Teacher' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow owner teacher to publish the course', async () => {
      const res = await request(app)
        .patch(`/api/courses/${testCourseId}/publish`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('published');
    });

    it('should now display published course in public exploration', async () => {
      const res = await request(app).get('/api/courses?search=Automated+Test+Course');
      expect(res.status).toBe(200);
      const found = res.body.data.some((c: any) => c._id === testCourseId);
      expect(found).toBe(true);
    });
  });

  describe('4. Enrollment & Progress Calculation (Student)', () => {
    it('should allow student to enroll in the free published course', async () => {
      const res = await request(app)
        .post(`/api/courses/${testCourseId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.enrollment.progressPercentage).toBe(0);
    });

    it('should prevent duplicate enrollment for the same student', async () => {
      const res = await request(app)
        .post(`/api/courses/${testCourseId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should mark required lesson complete and update progress percentage to 100%', async () => {
      const res = await request(app)
        .post(`/api/courses/${testCourseId}/lessons/${testLessonId}/complete`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.progressPercentage).toBe(100);
      expect(res.body.isCourseCompleted).toBe(true);
      expect(res.body.certificate).toBeDefined();
    });

    it('should confirm optional lesson does NOT block 100% course completion', async () => {
      const res = await request(app)
        .get(`/api/courses/${testCourseId}/progress`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.progressPercentage).toBe(100);
      expect(res.body.isCompleted).toBe(true);
    });
  });

  describe('5. Reviews & Ratings', () => {
    it('should allow enrolled student to review course and update average rating', async () => {
      const res = await request(app)
        .post(`/api/courses/${testCourseId}/reviews`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          rating: 5,
          comment: 'Fantastic course with clear lessons!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      // Verify course average rating updated
      const course = await Course.findById(testCourseId);
      expect(course?.averageRating).toBe(5);
      expect(course?.reviewCount).toBe(1);
    });

    it('should prevent duplicate review by same student on same course', async () => {
      const res = await request(app)
        .post(`/api/courses/${testCourseId}/reviews`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ rating: 4, comment: 'Second review attempt' });

      expect(res.status).toBe(409);
    });
  });

  describe('6. Automatic PDF Certificate Generation & Verification', () => {
    it('should list earned certificate in student certificates', async () => {
      const res = await request(app)
        .get('/api/certificates/my-certificates')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.certificates.length).toBeGreaterThan(0);
      issuedCertificateId = res.body.certificates[0].certificateId;
      expect(issuedCertificateId).toMatch(/^EDUGO-\d{4}-[A-Z0-9]+$/);
    });

    it('should allow public verification of issued certificate without leaking private data', async () => {
      const res = await request(app).get(`/api/certificates/verify/${issuedCertificateId}`);

      expect(res.status).toBe(200);
      expect(res.body.isValid).toBe(true);
      expect(res.body.certificate.studentName).toBe('Automated Student Tester');
      expect(res.body.certificate.courseTitle).toBe('Automated Test Course');
      expect(res.body.certificate.email).toBeUndefined(); // Private email protected!
    });

    it('should return 404 for invalid certificate verification ID', async () => {
      const res = await request(app).get('/api/certificates/verify/FAKE-ID-999');
      expect(res.status).toBe(404);
      expect(res.body.isValid).toBe(false);
    });
  });

  describe('7. Teacher Course Deletion & Student Record Protection', () => {
    it('should reject course deletion when attempted by a student (403 Forbidden)', async () => {
      const res = await request(app)
        .delete(`/api/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject course deletion when attempted by another teacher (403 Forbidden)', async () => {
      const res = await request(app)
        .delete(`/api/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${teacher2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('another teacher');
    });

    it('should reject course deletion with invalid course ID format (400 Bad Request)', async () => {
      const res = await request(app)
        .delete('/api/courses/invalid-mongodb-id')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when deleting a non-existent course ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .delete(`/api/courses/${nonExistentId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should allow authenticated owner teacher to safely delete/archive the course (200 OK)', async () => {
      const res = await request(app)
        .delete(`/api/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted');

      // Verify course state in MongoDB
      const course = await Course.findById(testCourseId);
      expect(course?.isDeleted).toBe(true);
      expect(course?.status).toBe('archived');
      expect(course?.deletedAt).toBeDefined();
    });

    it('should exclude deleted course from public discovery (/api/courses)', async () => {
      const res = await request(app).get('/api/courses');
      expect(res.status).toBe(200);
      const ids = (res.body.data || []).map((c: any) => c._id);
      expect(ids).not.toContain(testCourseId);
    });

    it('should prevent new student enrollments on deleted course (400 Bad Request)', async () => {
      // Register a third student
      const newEmail = `postdelete.student.${Date.now()}@edugo.test`;
      const regRes = await request(app).post('/api/auth/register').send({
        name: 'Post Delete Student',
        email: newEmail,
        password: 'Password123!',
        role: 'student',
      });
      const newStudentToken = regRes.body.token;

      const enrollRes = await request(app)
        .post(`/api/courses/${testCourseId}/enroll`)
        .set('Authorization', `Bearer ${newStudentToken}`);

      expect(enrollRes.status).toBe(400);
      expect(enrollRes.body.success).toBe(false);
      expect(enrollRes.body.message).toContain('deleted or unpublished');
    });

    it('should preserve previously issued student certificates and public verification', async () => {
      expect(issuedCertificateId).toBeDefined();
      const res = await request(app).get(`/api/certificates/verify/${issuedCertificateId}`);

      expect(res.status).toBe(200);
      expect(res.body.isValid).toBe(true);
      expect(res.body.certificate.studentName).toBe('Automated Student Tester');
      expect(res.body.certificate.courseTitle).toBe('Automated Test Course');
    });

    it('should preserve student certificate listing and learning history after deletion', async () => {
      const res = await request(app)
        .get('/api/certificates/my-certificates')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.certificates.length).toBeGreaterThan(0);
      const found = res.body.certificates.find((c: any) => c.certificateId === issuedCertificateId);
      expect(found).toBeDefined();
    });
  });
});
