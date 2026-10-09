import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Section } from '../models/Section';
import { Lesson } from '../models/Lesson';
import { Enrollment } from '../models/Enrollment';
import { LessonProgress } from '../models/LessonProgress';
import { Review } from '../models/Review';
import { Announcement } from '../models/Announcement';
import { Certificate } from '../models/Certificate';
import { Notification } from '../models/Notification';
import { generateCertificatePDF } from '../services/certificateGenerator';
import { config } from '../config/env';
import { logger } from './logger';

export const seedDatabase = async () => {
  try {
    await connectDB();
    logger.info('[Seeder] Clearing old collections...');

    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Section.deleteMany({}),
      Lesson.deleteMany({}),
      Enrollment.deleteMany({}),
      LessonProgress.deleteMany({}),
      Review.deleteMany({}),
      Announcement.deleteMany({}),
      Certificate.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    logger.info('[Seeder] Creating users...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    const teacher1 = await User.create({
      name: 'Dr. Sarah Mitchell',
      email: 'sarah.teacher@edugo.org',
      password: passwordHash,
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=faces',
      headline: 'Senior Full-Stack Architect & Educational Author',
      bio: 'Over 12 years of industry experience architecting scalable distributed systems and mentoring over 40,000 developers worldwide. Passionate about hands-on software engineering.',
    });

    const teacher2 = await User.create({
      name: 'Alex Vance',
      email: 'alex.teacher@edugo.org',
      password: passwordHash,
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces',
      headline: 'Lead Product Designer & Design Systems Specialist',
      bio: 'Former principal designer at top tech startups. Teaching modern interface design, typography hierarchy, and accessibility standards.',
    });

    const student1 = await User.create({
      name: 'David Chen',
      email: 'david.student@edugo.org',
      password: passwordHash,
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces',
      headline: 'Aspiring Full-Stack Software Developer',
      bio: 'Learning full-stack web technologies and cloud foundations on EduGo.',
    });

    const student2 = await User.create({
      name: 'Emily Watson',
      email: 'emily.student@edugo.org',
      password: passwordHash,
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=faces',
      headline: 'Computer Science Student',
      bio: 'Enthusiastic about UI/UX design and Python programming.',
    });

    logger.info('[Seeder] Creating courses...');

    // Course 1
    const course1 = await Course.create({
      title: 'Modern Full-Stack Web Development with React & Node',
      slug: 'modern-full-stack-web-development-with-react-node',
      summary: 'Master full-stack web applications from front to back with React, Express, MongoDB, and Tailwind CSS.',
      description: `<h3>Master Modern Web Development From Ground Up</h3>
<p>In this comprehensive course, you will learn how to build production-grade web applications. We cover contemporary best practices including component architecture, RESTful API design, database modeling, and state management.</p>
<h4>What you will gain:</h4>
<ul>
  <li>Clean architecture patterns for scalable applications</li>
  <li>Practical hands-on implementation of real APIs</li>
  <li>Authentication, validation, and security fundamentals</li>
</ul>`,
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=500&fit=crop',
      category: 'Web Development',
      difficulty: 'Intermediate',
      learningObjectives: [
        'Build responsive frontend interfaces with React and Tailwind CSS',
        'Create robust backend APIs with Node.js and Express',
        'Design efficient MongoDB schemas with Mongoose',
        'Deploy and secure full-stack applications',
      ],
      prerequisites: ['Basic knowledge of HTML, CSS, and modern JavaScript'],
      instructor: teacher1._id,
      estimatedDuration: '6 Hours',
      status: 'published',
      enrolledCount: 2,
      averageRating: 4.8,
      reviewCount: 2,
    });

    // Sections & Lessons for Course 1
    const sec1_1 = await Section.create({
      courseId: course1._id,
      title: 'Module 1: Foundations & Architecture',
      order: 0,
    });

    const les1_1_1 = await Lesson.create({
      courseId: course1._id,
      sectionId: sec1_1._id,
      title: 'Course Introduction and Project Blueprint',
      description: 'An overview of what we are building and the architectural layers of modern full-stack web apps.',
      type: 'video',
      isRequired: true,
      order: 0,
      duration: 12,
      content: {
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      },
      isPublished: true,
    });

    const les1_1_2 = await Lesson.create({
      courseId: course1._id,
      sectionId: sec1_1._id,
      title: 'Setting Up the Modern Developer Environment',
      description: 'Step-by-step guidance on setting up Node.js, code editors, and development tooling.',
      type: 'text',
      isRequired: true,
      order: 1,
      duration: 8,
      content: {
        textHtml: `<h2>Setting Up Your Environment</h2>
<p>Before writing code, ensure you have the recommended development tooling installed:</p>
<ol>
  <li><strong>Node.js LTS</strong>: The runtime environment executing our JavaScript and TypeScript code.</li>
  <li><strong>MongoDB</strong>: Either local Community Server or MongoDB Atlas cloud cluster.</li>
  <li><strong>VS Code or Antigravity IDE</strong>: With extensions for ESLint and Tailwind CSS.</li>
</ol>
<p>Once verified, clone the starter workspace and install dependencies with <code>npm install</code>.</p>`,
      },
      isPublished: true,
    });

    const sec1_2 = await Section.create({
      courseId: course1._id,
      title: 'Module 2: Building Backend APIs & Database Integration',
      order: 1,
    });

    const les1_2_1 = await Lesson.create({
      courseId: course1._id,
      sectionId: sec1_2._id,
      title: 'Designing RESTful Endpoints and Mongoose Models',
      description: 'Learn how to model data with Mongoose schemas and build clean Express controllers.',
      type: 'video',
      isRequired: true,
      order: 0,
      duration: 18,
      content: {
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      },
      isPublished: true,
    });

    const les1_2_2 = await Lesson.create({
      courseId: course1._id,
      sectionId: sec1_2._id,
      title: 'Course Source Code & Architecture Cheat Sheet',
      description: 'Downloadable architectural diagram and starter resources.',
      type: 'file',
      isRequired: false, // Optional lesson
      order: 1,
      duration: 5,
      content: {
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'fullstack-architecture-guide.pdf',
        fileSize: 1048576,
        fileType: 'application/pdf',
      },
      isPublished: true,
    });

    // Course 2: UI/UX Design
    const course2 = await Course.create({
      title: 'UI/UX Design Systems: From Wireframe to Product',
      slug: 'ui-ux-design-systems-from-wireframe-to-product',
      summary: 'Learn the principles of professional digital product design, color psychology, and scalable design systems.',
      description: `<h3>Create Products Users Love</h3>
<p>Design is much more than pretty colors. In this course, you will master the principles of visual hierarchy, accessibility contrast, typography, and cohesive component systems.</p>`,
      thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=500&fit=crop',
      category: 'Design',
      difficulty: 'Beginner',
      learningObjectives: [
        'Understand design tokens and typography hierarchy',
        'Create accessible and WCAG compliant color palettes',
        'Build reusable component systems',
      ],
      prerequisites: ['No prior design experience required'],
      instructor: teacher2._id,
      estimatedDuration: '4 Hours',
      status: 'published',
      enrolledCount: 1,
      averageRating: 5.0,
      reviewCount: 1,
    });

    const sec2_1 = await Section.create({
      courseId: course2._id,
      title: 'Design Foundations',
      order: 0,
    });

    const les2_1_1 = await Lesson.create({
      courseId: course2._id,
      sectionId: sec2_1._id,
      title: 'Visual Hierarchy and Typography Principles',
      description: 'Understanding scale, line height, and hierarchy in digital interfaces.',
      type: 'video',
      isRequired: true,
      order: 0,
      duration: 15,
      content: {
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      },
      isPublished: true,
    });

    const les2_1_2 = await Lesson.create({
      courseId: course2._id,
      sectionId: sec2_1._id,
      title: 'Color Contrast and Accessibility Guidelines',
      description: 'Applying WCAG 2.2 AA standards for readable and accessible products.',
      type: 'text',
      isRequired: true,
      order: 1,
      duration: 10,
      content: {
        textHtml: `<h2>Accessible Color Systems</h2>
<p>Contrast is essential for legibility across devices and lighting conditions. For standard body text, aim for a minimum contrast ratio of 4.5:1 against the background.</p>`,
      },
      isPublished: true,
    });

    // Course 3: Python & Data Analysis
    const course3 = await Course.create({
      title: 'Mastering Python & Data Analysis for Beginners',
      slug: 'mastering-python-data-analysis-for-beginners',
      summary: 'Learn Python programming from scratch and unlock real-world data analysis with Pandas, NumPy, and visualization.',
      description: `<h3>Start Your Programming Journey with Python</h3>
<p>Python is the world's most versatile language. This course covers everything from variables and control flow to working with datasets, filtering data, and producing clean visualizations.</p>`,
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=500&fit=crop',
      category: 'Data Science',
      difficulty: 'Beginner',
      learningObjectives: [
        'Master Python fundamentals and control flow',
        'Manipulate datasets effortlessly using Pandas',
        'Create insightful data visualizations',
      ],
      prerequisites: ['Curiosity and an eagerness to learn'],
      instructor: teacher1._id,
      estimatedDuration: '5 Hours',
      status: 'published',
      enrolledCount: 0,
      averageRating: 0,
      reviewCount: 0,
    });

    const sec3_1 = await Section.create({
      courseId: course3._id,
      title: 'Python Essentials',
      order: 0,
    });

    await Lesson.create({
      courseId: course3._id,
      sectionId: sec3_1._id,
      title: 'Python Syntax, Variables, and Types',
      description: 'Understanding Python datatypes, variables, and expressions.',
      type: 'video',
      isRequired: true,
      order: 0,
      duration: 20,
      content: {
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      },
      isPublished: true,
    });

    // Course 4: Teacher 1 Draft Course
    await Course.create({
      title: 'Cloud DevOps & CI/CD Pipeline Automation (In Development)',
      slug: 'cloud-devops-ci-cd-pipeline-automation',
      summary: 'Automate build, test, and deployment pipelines using GitHub Actions and Docker.',
      description: '<p>A deep dive into containerization and pipeline automation.</p>',
      thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&h=500&fit=crop',
      category: 'DevOps & Cloud',
      difficulty: 'Advanced',
      learningObjectives: ['Containerize applications with Docker', 'Build automated CI/CD pipelines'],
      prerequisites: ['Linux basics and git experience'],
      instructor: teacher1._id,
      estimatedDuration: '7 Hours',
      status: 'draft',
      enrolledCount: 0,
      averageRating: 0,
      reviewCount: 0,
    });

    logger.info('[Seeder] Creating student enrollments & completions...');

    // Student 1 enrolled in Course 1 and completed 100% of required lessons!
    const enroll1 = await Enrollment.create({
      studentId: student1._id,
      courseId: course1._id,
      enrolledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      progressPercentage: 100,
      lastAccessedLessonId: les1_2_1._id,
      lastAccessedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    // Mark required lessons completed for Student 1
    await LessonProgress.create({
      studentId: student1._id,
      courseId: course1._id,
      lessonId: les1_1_1._id,
      isCompleted: true,
      completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    });

    await LessonProgress.create({
      studentId: student1._id,
      courseId: course1._id,
      lessonId: les1_1_2._id,
      isCompleted: true,
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    });

    await LessonProgress.create({
      studentId: student1._id,
      courseId: course1._id,
      lessonId: les1_2_1._id,
      isCompleted: true,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    // Generate real PDF Certificate for Student 1 on Course 1
    const certId1 = 'EDUGO-2026-W89K2P';
    const certUrl1 = `${config.clientUrl}/verify/${certId1}`;
    const pdfPath1 = await generateCertificatePDF({
      certificateId: certId1,
      studentName: student1.name,
      courseTitle: course1.title,
      teacherName: teacher1.name,
      completionDate: enroll1.completedAt || new Date(),
      verificationUrl: certUrl1,
    });

    await Certificate.create({
      certificateId: certId1,
      studentId: student1._id,
      courseId: course1._id,
      studentName: student1.name,
      courseTitle: course1.title,
      teacherName: teacher1.name,
      completionDate: enroll1.completedAt || new Date(),
      pdfPath: pdfPath1,
      verificationUrl: certUrl1,
    });

    // Student 2 enrolled in Course 1 (in progress 33%) and Course 2 (100% completed)
    await Enrollment.create({
      studentId: student2._id,
      courseId: course1._id,
      enrolledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      progressPercentage: 33,
      lastAccessedLessonId: les1_1_1._id,
      lastAccessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await LessonProgress.create({
      studentId: student2._id,
      courseId: course1._id,
      lessonId: les1_1_1._id,
      isCompleted: true,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    // Student 2 completed Course 2
    const enroll2_2 = await Enrollment.create({
      studentId: student2._id,
      courseId: course2._id,
      enrolledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      progressPercentage: 100,
      lastAccessedLessonId: les2_1_2._id,
      lastAccessedAt: new Date(),
    });

    await LessonProgress.create({
      studentId: student2._id,
      courseId: course2._id,
      lessonId: les2_1_1._id,
      isCompleted: true,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await LessonProgress.create({
      studentId: student2._id,
      courseId: course2._id,
      lessonId: les2_1_2._id,
      isCompleted: true,
      completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    });

    const certId2 = 'EDUGO-2026-D44V9X';
    const certUrl2 = `${config.clientUrl}/verify/${certId2}`;
    const pdfPath2 = await generateCertificatePDF({
      certificateId: certId2,
      studentName: student2.name,
      courseTitle: course2.title,
      teacherName: teacher2.name,
      completionDate: enroll2_2.completedAt || new Date(),
      verificationUrl: certUrl2,
    });

    await Certificate.create({
      certificateId: certId2,
      studentId: student2._id,
      courseId: course2._id,
      studentName: student2.name,
      courseTitle: course2.title,
      teacherName: teacher2.name,
      completionDate: enroll2_2.completedAt || new Date(),
      pdfPath: pdfPath2,
      verificationUrl: certUrl2,
    });

    logger.info('[Seeder] Creating reviews...');
    await Review.create({
      studentId: student1._id,
      courseId: course1._id,
      rating: 5,
      comment:
        'Outstanding course! The explanations are crisp, the structure is logical, and the progress tracking kept me motivated all the way through.',
    });

    await Review.create({
      studentId: student2._id,
      courseId: course1._id,
      rating: 4,
      comment:
        'Great introduction to full stack architecture. I enjoyed the modular sections and clean code demonstrations.',
    });

    await Review.create({
      studentId: student2._id,
      courseId: course2._id,
      rating: 5,
      comment:
        'Alex Vance is a superb teacher. The typography and color accessibility principles directly helped me build better UIs.',
    });

    logger.info('[Seeder] Creating announcements...');
    await Announcement.create({
      courseId: course1._id,
      teacherId: teacher1._id,
      title: 'Welcome to Full-Stack Web Development!',
      message:
        'Welcome everyone! Please feel free to go through Module 1 at your own pace. Make sure to download the architecture cheat sheet in Module 2.',
    });

    await Announcement.create({
      courseId: course2._id,
      teacherId: teacher2._id,
      title: 'New Figma Community Tokens Attached',
      message:
        'I have added supplementary design token references for those looking to configure Tailwind CSS themes with strict contrast ratios.',
    });

    logger.info('[Seeder] Creating notifications...');
    await Notification.create({
      recipientId: student1._id,
      title: 'Certificate Awarded!',
      message: `Congratulations! You have completed "${course1.title}". Your official certificate is ready to download.`,
      type: 'certificate',
      link: '/certificates',
      isRead: true,
    });

    await Notification.create({
      recipientId: student2._id,
      title: 'Certificate Awarded!',
      message: `Congratulations! You have completed "${course2.title}". Your official certificate is ready to download.`,
      type: 'certificate',
      link: '/certificates',
      isRead: false,
    });

    await Notification.create({
      recipientId: student1._id,
      title: 'New Announcement: Full-Stack Web Development',
      message: 'Dr. Sarah Mitchell posted: "Welcome to Full-Stack Web Development!"',
      type: 'announcement',
      link: `/learn/${course1._id}`,
      isRead: false,
    });

    logger.info('[Seeder] Seed completed successfully!');
    logger.info('---------------------------------------------');
    logger.info('Default Teacher Login:');
    logger.info('  Email: sarah.teacher@edugo.org');
    logger.info('  Password: Password123!');
    logger.info('Default Student Login:');
    logger.info('  Email: david.student@edugo.org');
    logger.info('  Password: Password123!');
    logger.info('---------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('[Seeder] Failed to seed database:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}
