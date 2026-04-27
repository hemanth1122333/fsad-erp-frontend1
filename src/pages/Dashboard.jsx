import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, CalendarDays, ClipboardList, Clock, FileText, MessageSquare } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const isStudent = user?.roles?.includes('ROLE_STUDENT');

  useEffect(() => {
    if (isStudent) {
      return;
    }

    api.get('/dashboard/summary')
      .then((response) => setSummary(response.data))
      .catch((dashboardError) => setError(dashboardError.response?.data?.message || 'Unable to load dashboard'));
  }, [isStudent]);

  const cards = summary
    ? [
        { label: 'Students', value: summary.students },
        { label: 'Assignments', value: summary.assignments },
        { label: 'Submissions', value: summary.submissions },
        { label: 'Notifications', value: summary.notifications },
      ]
    : [];

  const studentActions = [
    {
      to: '/attendance/student',
      label: 'Attendance',
      copy: 'Check your attendance report and overall percentage.',
      icon: CalendarDays,
    },
    {
      to: '/timetable',
      label: 'Timetable',
      copy: 'See weekday classes, holidays, and L-T-P-S subjects.',
      icon: Clock,
    },
    {
      to: '/grades',
      label: 'Grades',
      copy: 'Review marks, grades, and teacher remarks.',
      icon: ClipboardList,
    },
    {
      to: '/assignments',
      label: 'Assignments',
      copy: 'View teacher work and submit files or written answers.',
      icon: FileText,
    },
    {
      to: '/messages',
      label: 'Messages',
      copy: 'Send questions to teachers or admins.',
      icon: MessageSquare,
    },
    {
      to: '/notifications',
      label: 'Notifications',
      copy: 'Read notices shared for students.',
      icon: BellRing,
    },
  ];

  if (isStudent) {
    return (
      <AppLayout title="Dashboard">
        <div className="student-home-grid">
          <section className="panel student-home-hero">
            <div>
              <p className="eyebrow">Student workspace</p>
              <h2>Welcome back, {user?.name || 'Student'}</h2>
              <p>Keep up with your attendance, grades, assignments, messages, and notices from one place.</p>
            </div>
          </section>

          <section className="panel student-focus-panel">
            <p className="eyebrow">Next step</p>
            <h2>Submit pending work</h2>
            <p className="muted">Open assignments to upload a PDF/file or write your answer for teacher-created work.</p>
            <Link to="/assignments" className="primary-button student-home-link">Open Assignments</Link>
          </section>

          <section className="student-action-grid">
            {studentActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link to={action.to} className="panel student-action-card" key={action.to}>
                  <span className="student-action-icon"><Icon size={20} /></span>
                  <strong>{action.label}</strong>
                  <small>{action.copy}</small>
                </Link>
              );
            })}
          </section>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      <div className="dashboard-grid">
        <section className="hero-panel panel dashboard-hero">
          <div className="dashboard-hero-copy">
            <p className="eyebrow">Role-based access</p>
            <h2>Welcome back, {user?.name || 'User'}</h2>
            <p>
              Your account is signed in as {user?.roles?.join(', ') || 'a user'}. The dashboard summarizes the current ERP
              state.
            </p>
          </div>

          <div className="dashboard-hero-chip">
            <strong>{summary ? summary.students + summary.assignments + summary.submissions + summary.notifications : '—'}</strong>
            <span>core records tracked</span>
          </div>
        </section>

        {cards.map((card) => (
          <section className="stat-card panel" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.label === 'Submissions' ? 'Pending student uploads' : 'Live ERP record count'}</small>
          </section>
        ))}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
