import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Layouts
import DashboardLayout from './components/common/DashboardLayout';

// Student Pages
import StudentDashboard from './components/student/StudentDashboard';
import StudentQuizzes from './components/student/StudentQuizzes';
import TakeQuiz from './components/student/TakeQuiz';
import QuizResult from './components/student/QuizResult';
import StudentMaterials from './components/student/StudentMaterials';
import StudentAnalytics from './components/student/StudentAnalytics';
import StudentClasses from './components/student/StudentClasses';

// Teacher Pages
import TeacherDashboard from './components/teacher/TeacherDashboard';
import TeacherClasses from './components/teacher/TeacherClasses';
import ClassDetail from './components/teacher/ClassDetail';
import CreateQuiz from './components/teacher/CreateQuiz';
import TeacherQuizzes from './components/teacher/TeacherQuizzes';
import QuizAnalytics from './components/teacher/QuizAnalytics';
import TeacherMaterials from './components/teacher/TeacherMaterials';
import StudentProgress from './components/teacher/StudentProgress';

// Admin Pages
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import AdminClasses from './components/admin/AdminClasses';

// Shared
import NotificationsPage from './pages/shared/NotificationsPage';
import ProfilePage from './pages/shared/ProfilePage';
import LoadingSpinner from './components/common/LoadingSpinner';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullscreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullscreen />;
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute roles={['student']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="classes" element={<StudentClasses />} />
        <Route path="quizzes" element={<StudentQuizzes />} />
        <Route path="quiz/:id" element={<TakeQuiz />} />
        <Route path="quiz/:id/result/:submissionId" element={<QuizResult />} />
        <Route path="analytics" element={<StudentAnalytics />} />
        <Route path="materials" element={<StudentMaterials />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Teacher */}
      <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="classes" element={<TeacherClasses />} />
        <Route path="classes/:id" element={<ClassDetail />} />
        <Route path="quizzes" element={<TeacherQuizzes />} />
        <Route path="quizzes/create" element={<CreateQuiz />} />
        <Route path="quizzes/:id/analytics" element={<QuizAnalytics />} />
        <Route path="materials" element={<TeacherMaterials />} />
        <Route path="students/:id/progress" element={<StudentProgress />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="classes" element={<AdminClasses />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: '#1E293B', color: '#F8FAFC', borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#10B981', secondary: '#F8FAFC' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#F8FAFC' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}