import React, { useEffect, useState } from 'react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/logs')
      .then((response) => setLogs(response.data))
      .catch((logError) => setError(logError.response?.data?.message || 'Unable to load logs'));
  }, []);

  return (
    <AppLayout title="Activity Logs">
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Audit trail</p>
            <h2>Recent actions</h2>
          </div>
        </div>
        {error ? <div className="alert error">{error}</div> : null}
        <ul className="log-list">
          {logs.map((log) => (
            <li key={log.id}>
              <strong>{log.action}</strong> {log.entityType} {log.entityId} {log.details ? `- ${log.details}` : ''}
            </li>
          ))}
        </ul>
      </div>
    </AppLayout>
  );
};

export default Logs;