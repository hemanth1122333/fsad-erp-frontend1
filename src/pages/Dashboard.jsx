import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import api from '../services/api';

const parseActivity = (entry) => {
  const [action = 'UPDATE', ...rest] = String(entry || '').split(' - ');
  const details = rest.join(' - ').trim();

  return {
    action,
    details: details || 'Activity recorded',
    tone: action.includes('SIGN') ? 'success' : action.includes('DELETE') ? 'danger' : 'neutral',
  };
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/summary')
      .then((response) => setSummary(response.data))
      .catch((dashboardError) => setError(dashboardError.response?.data?.message || 'Unable to load dashboard'));
  }, []);

  const cards = summary
    ? [
        { label: 'Students', value: summary.students },
        { label: 'Teachers', value: summary.teachers },
        { label: 'Classes', value: summary.classes },
        { label: 'Assignments', value: summary.assignments },
        { label: 'Submissions', value: summary.submissions },
        { label: 'Notifications', value: summary.notifications },
      ]
    : [];

  const activityItems = (summary?.recentLogs || []).map(parseActivity);

  return (
    <AppLayout title="Dashboard">
      <div className="dashboard-grid">
        <section className="hero-panel panel dashboard-hero">
          <div className="dashboard-hero-copy">
            <p className="eyebrow">Role-based access</p>
            <h2>Welcome back, {user?.name || 'User'}</h2>
            <p>
              Your account is signed in as {user?.roles?.join(', ') || 'a user'}. The dashboard summarizes the current ERP
              state and recent activity.
            </p>
          </div>

          <div className="dashboard-hero-chip">
            <strong>{summary ? summary.students + summary.teachers + summary.classes : '—'}</strong>
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

        <section className="panel wide-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Recent activity</p>
              <h2>System logs</h2>
            </div>
            <span className="pill neutral-pill">{activityItems.length} entries</span>
          </div>
          {error ? <div className="alert error">{error}</div> : null}
          {activityItems.length > 0 ? (
            <ul className="activity-feed">
              {activityItems.map((entry, index) => (
                <li key={`${entry.action}-${entry.details}-${index}`} className={`activity-item tone-${entry.tone}`}>
                  <div className="activity-badge">{entry.action}</div>
                  <div className="activity-copy">
                    <strong>{entry.details}</strong>
                    <span>{index === 0 ? 'Most recent event' : 'Earlier event'}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">No activity yet. Once users start interacting, recent events will appear here.</div>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
