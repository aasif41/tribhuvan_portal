import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { Role } from '@tribhuvan/shared';
import { PageSkeleton } from '../components/ui/Skeleton';

// Layouts
import { DashboardLayout } from '../pages/DashboardLayout';

// Auth & Public pages (eagerly loaded for instant TTI on landing)
import { UnifiedAuthPage } from '../pages/auth/UnifiedAuthPage';

// Lazy-loaded pages
const AdminLoginPage = lazy(() => import('../pages/auth/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AboutCollege = lazy(() => import('../pages/college/AboutCollege').then(m => ({ default: m.AboutCollege })));

// Student pages
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const Timetable = lazy(() => import('../pages/student/Timetable').then(m => ({ default: m.Timetable })));
const Attendance = lazy(() => import('../pages/student/Attendance').then(m => ({ default: m.Attendance })));
const Announcements = lazy(() => import('../pages/student/Announcements').then(m => ({ default: m.Announcements })));
const Profile = lazy(() => import('../pages/student/Profile').then(m => ({ default: m.Profile })));

// Teacher pages
const TeacherDashboard = lazy(() => import('../pages/teacher/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const MyClasses = lazy(() => import('../pages/teacher/MyClasses').then(m => ({ default: m.MyClasses })));
const MarkAttendance = lazy(() => import('../pages/teacher/MarkAttendance').then(m => ({ default: m.MarkAttendance })));
const TeacherProfile = lazy(() => import('../pages/teacher/TeacherProfile').then(m => ({ default: m.TeacherProfile })));

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const PendingApprovals = lazy(() => import('../pages/admin/PendingApprovals').then(m => ({ default: m.PendingApprovals })));
const ManageStudents = lazy(() => import('../pages/admin/ManageStudents').then(m => ({ default: m.ManageStudents })));
const ManageTeachers = lazy(() => import('../pages/admin/ManageTeachers').then(m => ({ default: m.ManageTeachers })));
const ManageAnnouncements = lazy(() => import('../pages/admin/ManageAnnouncements').then(m => ({ default: m.ManageAnnouncements })));
const TimetableEditor = lazy(() => import('../pages/admin/TimetableEditor').then(m => ({ default: m.TimetableEditor })));
const ManageSubjects = lazy(() => import('../pages/admin/ManageSubjects').then(m => ({ default: m.ManageSubjects })));
const ManagePrograms = lazy(() => import('../pages/admin/ManagePrograms').then(m => ({ default: m.ManagePrograms })));
const AuditLogs = lazy(() => import('../pages/admin/AuditLogs').then(m => ({ default: m.AuditLogs })));
const AdminProfile = lazy(() => import('../pages/admin/AdminProfile').then(m => ({ default: m.AdminProfile })));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* Default Landing & Auth routes */}
        <Route path="/" element={<UnifiedAuthPage />} />
        <Route path="/login" element={<UnifiedAuthPage />} />
        <Route path="/about" element={<AboutCollege />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/pending" element={<Navigate to="/login" replace />} />

        {/* Student routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[Role.STUDENT]}>
                <DashboardLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Teacher routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[Role.TEACHER]}>
                <DashboardLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="classes" element={<MyClasses />} />
          <Route path="attendance" element={<MarkAttendance />} />
          <Route path="announcements" element={<ManageAnnouncements />} />
          <Route path="profile" element={<TeacherProfile />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[Role.ADMIN]}>
                <DashboardLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="approvals" element={<PendingApprovals />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="teachers" element={<ManageTeachers />} />
          <Route path="programs" element={<ManagePrograms />} />
          <Route path="subjects" element={<ManageSubjects />} />
          <Route path="announcements" element={<ManageAnnouncements />} />
          <Route path="timetable" element={<TimetableEditor />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
