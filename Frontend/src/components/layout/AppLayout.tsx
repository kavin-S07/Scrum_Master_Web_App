
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'Users',
  '/departments': 'Departments',
  '/teams': 'Teams',
  '/projects': 'Projects',
  '/sprints': 'Sprints',
  '/tasks': 'Tasks',
  '/work-logs': 'Work Logs',
  '/standups': 'Standups',
  '/leaves': 'Leave Management',
  '/notifications': 'Notifications',
  '/reassignments': 'Reassignments',
  '/profile': 'My Profile',
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'SprintFlow';

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;