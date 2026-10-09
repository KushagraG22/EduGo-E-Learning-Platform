import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ExploreCoursesPage } from './pages/public/ExploreCoursesPage';
import { CourseDetailsPage } from './pages/public/CourseDetailsPage';
import { PublicTeacherProfilePage } from './pages/public/PublicTeacherProfilePage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';
import { CertificateVerificationPage } from './pages/public/CertificateVerificationPage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/public/TermsOfServicePage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Teacher Pages
import { TeacherDashboardPage } from './pages/teacher/TeacherDashboardPage';
import { MyCoursesPage } from './pages/teacher/MyCoursesPage';
import { CreateCoursePage } from './pages/teacher/CreateCoursePage';
import { EditCoursePage } from './pages/teacher/EditCoursePage';
import { CurriculumBuilderPage } from './pages/teacher/CurriculumBuilderPage';
import { EnrolledStudentsPage } from './pages/teacher/EnrolledStudentsPage';
import { CourseAnnouncementsPage } from './pages/teacher/CourseAnnouncementsPage';
import { TeacherProfilePage } from './pages/teacher/TeacherProfilePage';

// Student Pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { MyLearningPage } from './pages/student/MyLearningPage';
import { LearningPlayerPage } from './pages/student/LearningPlayerPage';
import { LearningHistoryPage } from './pages/student/LearningHistoryPage';
import { MyCertificatesPage } from './pages/student/MyCertificatesPage';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Standalone Player Route (Full Window UI) */}
      <Route
        path="/learn/:courseId"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <LearningPlayerPage />
          </ProtectedRoute>
        }
      />

      {/* Pages with Global Main Layout */}
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<ExploreCoursesPage />} />
        <Route path="/courses/:idOrSlug" element={<CourseDetailsPage />} />
        <Route path="/teachers/:teacherId" element={<PublicTeacherProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify" element={<CertificateVerificationPage />} />
        <Route path="/verify/:certificateId" element={<CertificateVerificationPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />

        {/* Student Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-learning"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyLearningPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <LearningHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificates"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyCertificatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <MyCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses/new"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <CreateCoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses/:courseId/edit"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <EditCoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses/:courseId/curriculum"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <CurriculumBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses/:courseId/students"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <EnrolledStudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses/:courseId/announcements"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <CourseAnnouncementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/profile"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherProfilePage />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
