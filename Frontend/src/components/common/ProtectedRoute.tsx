import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingCenter } from '../common';
import AppLayout from '../layout/AppLayout';

interface Props {
  children: React.ReactNode;
  roles?: ('admin' | 'scrum_master' | 'employee')[];
}

const ProtectedRoute: React.FC<Props> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingCenter text="Authenticating…" />;

  if (!user) {
    // Pass the intended destination so LoginPage can redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

export default ProtectedRoute;