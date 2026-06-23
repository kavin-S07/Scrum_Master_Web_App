import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, UsersRound, Briefcase,
  Zap, CheckSquare, Clock, CalendarDays, Bell, RotateCcw, LogOut,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface NavItem { label: string; to: string; icon: React.ReactNode; }

const Sidebar: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const adminNav: NavItem[] = [
    { label: 'Dashboard',      to: '/dashboard',      icon: <LayoutDashboard size={16} /> },
    { label: 'Users',          to: '/users',           icon: <Users size={16} /> },
    { label: 'Departments',    to: '/departments',     icon: <Building2 size={16} /> },
    { label: 'Teams',          to: '/teams',           icon: <UsersRound size={16} /> },
    { label: 'Projects',       to: '/projects',        icon: <Briefcase size={16} /> },
    { label: 'Sprints',        to: '/sprints',         icon: <Zap size={16} /> },
    { label: 'Tasks',          to: '/tasks',           icon: <CheckSquare size={16} /> },
    { label: 'Leaves',         to: '/leaves',          icon: <CalendarDays size={16} /> },
    { label: 'Standups',       to: '/standups',        icon: <Clock size={16} /> },
    { label: 'Reassignments',  to: '/reassignments',   icon: <RotateCcw size={16} /> },
    { label: 'Notifications',  to: '/notifications',   icon: <Bell size={16} /> },
  ];

  const smNav: NavItem[] = [
    { label: 'Dashboard',      to: '/dashboard',      icon: <LayoutDashboard size={16} /> },
    { label: 'Projects',       to: '/projects',        icon: <Briefcase size={16} /> },
    { label: 'Sprints',        to: '/sprints',         icon: <Zap size={16} /> },
    { label: 'Tasks',          to: '/tasks',           icon: <CheckSquare size={16} /> },
    { label: 'Teams',          to: '/teams',           icon: <UsersRound size={16} /> },
    { label: 'Leaves',         to: '/leaves',          icon: <CalendarDays size={16} /> },
    { label: 'Standups',       to: '/standups',        icon: <Clock size={16} /> },
    { label: 'Reassignments',  to: '/reassignments',   icon: <RotateCcw size={16} /> },
    { label: 'Notifications',  to: '/notifications',   icon: <Bell size={16} /> },
  ];

  const empNav: NavItem[] = [
    { label: 'Dashboard',      to: '/dashboard',      icon: <LayoutDashboard size={16} /> },
    { label: 'My Tasks',       to: '/tasks',           icon: <CheckSquare size={16} /> },
    { label: 'Work Logs',      to: '/work-logs',       icon: <FileText size={16} /> },
    { label: 'Standups',       to: '/standups',        icon: <Clock size={16} /> },
    { label: 'My Leaves',      to: '/leaves',          icon: <CalendarDays size={16} /> },
    { label: 'Notifications',  to: '/notifications',   icon: <Bell size={16} /> },
  ];

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'scrum_master' ? smNav : empNav;
  const initials  = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : '?';
  const roleLabel = user?.role === 'scrum_master' ? 'Scrum Master' : user?.role === 'admin' ? 'Administrator' : 'Employee';

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>

        {/* Logo */}
        <div className="sidebar-logo">
          <img src="https://res.cloudinary.com/dw9kvnkkz/image/upload/v1782212001/full_logo_gtiszq.png"
            alt="SprintFlow" style={{ height: 34, objectFit: 'contain' }} />
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-label">Navigation</div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name">{user?.first_name} {user?.last_name}</div>
              <div className="sidebar-user-role">{roleLabel}</div>
            </div>
          </div>
          <button className="nav-item" onClick={handleLogout} style={{ width: '100%', marginTop: 4, color: 'var(--danger-text)' }}>
            <LogOut size={15} style={{ opacity: .8 }} />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
