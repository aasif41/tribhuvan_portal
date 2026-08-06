import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { Role } from '@tribhuvan/shared';

// Layouts
import { DashboardLayout } from '../pages/DashboardLayout';

// Auth pages
import { UnifiedAuthPage } from '../pages/auth/UnifiedAuthPage';
import { AdminLoginPage } from '../pages/auth/AdminLoginPage';

// Student pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { Timetable } from '../pages/student/Timetable';
import { Attendance } from '../pages/student/Attendance';
import { Announcements } from '../pages/student/Announcements';
import { Profile } from '../pages/student/Profile';

// Teacher pages
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { MyClasses } from '../pages/teacher/MyClasses';
import { MarkAttendance } from '../pages/teacher/MarkAttendance';
import { TeacherProfile } from '../pages/teacher/TeacherProfile';

// Admin pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { PendingApprovals } from '../pages/admin/PendingApprovals';
import { ManageStudents } from '../pages/admin/ManageStudents';
import { ManageTeachers } from '../pages/admin/ManageTeachers';
import { ManageAnnouncements } from '../pages/admin/ManageAnnouncements';
import { TimetableEditor } from '../pages/admin/TimetableEditor';
import { ManageSubjects } from '../pages/admin/ManageSubjects';
import { ManagePrograms } from '../pages/admin/ManagePrograms';
import { AuditLogs } from '../pages/admin/AuditLogs';
import { AdminProfile } from '../pages/admin/AdminProfile';

// College pages
import { AboutCollege } from '../pages/college/AboutCollege';

export function AppRoutes() {
  return (
    <Routes>
      {/* Default Landing & Auth routes */}
      <Route path="/" element={<UnifiedAuthPage />} />
      <Route path="/login" element={<UnifiedAuthPage />} />
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
  );
}
