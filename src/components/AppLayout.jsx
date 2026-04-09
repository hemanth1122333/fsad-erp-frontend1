import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, ClipboardList, GraduationCap, LayoutDashboard, LogOut, MessageSquare, School, BellRing, Users, CalendarDays, FileText, UserCheck, ShieldAlert } from 'lucide-react';

const AppLayout = ({ title, children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const roles = user?.roles || [];
  const isStudent = roles.includes('ROLE_STUDENT');
  const attendancePath = isStudent ? '/attendance/student' : '/attendance';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/teachers', label: 'Teachers', icon: GraduationCap },
    { to: '/classes', label: 'Classes', icon: School },
    { to: attendancePath, label: 'Attendance', icon: CalendarDays },
    { to: '/grades', label: 'Grades', icon: ClipboardList },
    { to: '/assignments', label: 'Assignments', icon: FileText },
    { to: '/submissions', label: 'Submissions', icon: UserCheck },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/notifications', label: 'Notifications', icon: BellRing },
    { to: '/logs', label: 'Activity Logs', icon: ShieldAlert },
  ].filter((item) => !isStudent || ['/dashboard', '/attendance/student', '/grades', '/assignments', '/messages', '/notifications'].includes(item.to));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <BookOpen size={28} />
          <div>
            <strong>EduERP</strong>
            <span>Education operations</span>
          </div>
        </div>

        <nav className="side-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="content-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">{title}</p>
            <h1>{title}</h1>
          </div>
          <div className="topbar-actions">
            <div className="user-chip">
              <span>{user?.name || 'User'}</span>
              <small>{roles.join(', ')}</small>
            </div>
            <button type="button" className="danger-button" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        <section className="page-body">{children}</section>
      </main>
    </div>
  );
};

export default AppLayout;