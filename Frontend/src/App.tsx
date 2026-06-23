import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UserPage';
import DepartmentsPage from './pages/DepartmentPage';
import TeamsPage from './pages/TeamPage';
import ProjectsPage from './pages/ProjectPage';
import SprintsPage from './pages/SprintsPage';
import TasksPage from './pages/TasksPage';
import WorkLogsPage from './pages/WorkLogsPage';
import LeavesPage from './pages/LeavesPage';
import ProfilePage from './pages/ProfilePage';
import StandupsPage from './pages/StandupsPage';
import NotificationsPage from './pages/NotificationsPage';
import ReassignmentsPage from './pages/ReassignmentsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';


const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

        <Routes>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/departments" element={<ProtectedRoute><DepartmentsPage /></ProtectedRoute>} />
          <Route path="/teams" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />

          <Route path="/sprints" element={<ProtectedRoute><SprintsPage /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
          <Route path="/work-logs" element={<ProtectedRoute><WorkLogsPage /></ProtectedRoute>} />
          <Route path="/standups" element={<ProtectedRoute><StandupsPage /></ProtectedRoute>} />
          <Route path="/leaves" element={<ProtectedRoute><LeavesPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/reassignments" element={<ProtectedRoute><ReassignmentsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          <Route path="/users" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>

      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;