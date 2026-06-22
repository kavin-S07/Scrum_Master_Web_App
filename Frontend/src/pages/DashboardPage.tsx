
import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import ScrumMasterDashboard from './ScrumMasterDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'scrum_master') return <ScrumMasterDashboard />;
  return <EmployeeDashboard />;
};

export default DashboardPage;