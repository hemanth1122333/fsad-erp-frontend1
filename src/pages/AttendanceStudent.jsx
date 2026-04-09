import React, { useEffect, useMemo, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Download, History, TrendingUp, TriangleAlert } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import api from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const formatDate = (value) => new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
}).format(new Date(value));

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const downloadCsv = (filename, rows) => {
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const AttendanceStudent = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadReport = async () => {
      try {
        setLoading(true);
        const response = await api.get('/attendance/report/me');
        if (active) {
          setReport(response.data);
          setError('');
          setLoading(false);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load attendance report');
          setLoading(false);
        }
      }
    };

    loadReport();
    const timer = window.setInterval(loadReport, 30000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const percentage = report?.attendancePercentage || 0;
  const toneClass = percentage >= 75 ? 'tone-good' : percentage >= 50 ? 'tone-warn' : 'tone-danger';

  const chartData = useMemo(() => ({
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [report?.statusBreakdown?.PRESENT || 0, report?.statusBreakdown?.ABSENT || 0],
      backgroundColor: ['#067647', '#dc2626'],
      borderWidth: 0,
    }],
  }), [report]);

  const calendarDays = useMemo(() => {
    if (!report) {
      return [];
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const monthHistory = new Map((report.currentMonthHistory || []).map((item) => [item.attendanceDate, item.status]));
    const totalDays = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: totalDays }, (_, index) => {
      const current = new Date(year, month, index + 1);
      const key = current.toISOString().slice(0, 10);
      return { key, day: index + 1, status: monthHistory.get(key) || 'N/A' };
    });
  }, [report]);

  const exportCsv = () => {
    if (!report) {
      return;
    }

    const rows = [
      ['Date', 'Status', 'Class', 'Remarks'],
      ...(report.history || []).map((entry) => [
        formatDate(entry.attendanceDate),
        entry.status,
        entry.className || '',
        entry.remarks || '',
      ]),
    ];

    downloadCsv(`attendance-report-${report?.admissionNumber || 'student'}.csv`, rows);
  };

  return (
    <AppLayout title="Attendance Dashboard">
      <div className="attendance-dashboard student-dashboard">
        <section className="panel attendance-hero student-hero">
          <div>
            <p className="eyebrow">Student view</p>
            <h2>{report?.studentName || 'Attendance overview'}</h2>
            <p className="muted">
              Track your attendance percentage, review your history, and keep an eye on the current month at a glance.
            </p>
          </div>
          <div className={`progress-chip ${toneClass}`}>
            <strong>{percentage}%</strong>
            <span>{percentage >= 75 ? 'On track' : 'Needs attention'}</span>
          </div>
        </section>

        {error ? <div className="alert error">{error}</div> : null}

        <section className="attendance-stats-grid student-stats-grid">
          {[
            { label: 'Classes attended', value: report?.classesAttended || 0 },
            { label: 'Classes conducted', value: report?.totalClasses || 0 },
            { label: 'Attendance percentage', value: `${percentage}%` },
            { label: 'Ranking', value: report?.rank ? `#${report.rank}` : 'N/A' },
          ].map((card) => (
            <article key={card.label} className="panel attendance-stat-card">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </article>
          ))}
        </section>

        {report?.warning ? (
          <div className="alert error warning-banner">
            <TriangleAlert size={16} />
            {report.warningMessage}
          </div>
        ) : null}

        <section className="attendance-content-grid student-content-grid">
          <div className="panel attendance-table-panel student-summary-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Summary</p>
                <h2>{report?.className || 'Student attendance'}</h2>
              </div>
              <button type="button" className="ghost-button" onClick={exportCsv}>
                <Download size={16} /> Download Report
              </button>
            </div>

            <div className="progress-block">
              <div className="progress-track">
                <div className="progress-bar" style={{ width: `${percentage}%` }} />
              </div>
              <div className="progress-caption">
                <span>Attendance progress</span>
                <strong>{percentage}%</strong>
              </div>
            </div>

            <div className="chart-card student-chart-card">
              <Pie data={chartData} options={{ plugins: { legend: { position: 'bottom' } }, cutout: '62%' }} />
            </div>

            <div className="calendar-card">
              <div className="calendar-header">
                <History size={16} />
                <strong>Current month attendance</strong>
              </div>
              <div className="calendar-grid">
                {calendarDays.map((day) => (
                  <div key={day.key} className={`calendar-day ${day.status === 'PRESENT' ? 'present' : day.status === 'ABSENT' ? 'absent' : 'empty'}`}>
                    <span>{day.day}</span>
                    <small>{day.status === 'N/A' ? 'N/A' : day.status}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="panel attendance-analytics-panel student-insight-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Insights</p>
                <h2>Quick facts</h2>
              </div>
              <TrendingUp size={18} />
            </div>

            <div className="mini-summary-list">
              <div><span>Admission no.</span><strong>{report?.admissionNumber || '—'}</strong></div>
              <div><span>Batch year</span><strong>{report?.batchYear || '—'}</strong></div>
              <div><span>Current rank</span><strong>{report?.rank ? `#${report.rank}` : '—'}</strong></div>
              <div><span>Low-attendance alert</span><strong>{report?.warning ? 'Active' : 'Clear'}</strong></div>
            </div>

            <div className="warning-box subtle-box">
              <strong>Auto calculation</strong>
              <p>The attendance percentage updates automatically from your saved history and refreshes every 30 seconds.</p>
            </div>
          </aside>
        </section>

        <section className="panel attendance-table-panel history-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">History</p>
              <h2>Attendance log</h2>
            </div>
            <span className="pill neutral-pill">{loading ? 'Loading...' : `${report?.history?.length || 0} records`}</span>
          </div>

          <div className="table-wrap sticky-table-wrap attendance-table-wrap">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Class</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {!loading && (report?.history || []).length === 0 ? (
                  <tr>
                    <td colSpan="4"><div className="empty-state">Attendance history will appear here once records are saved.</div></td>
                  </tr>
                ) : null}

                {(report?.history || []).map((entry) => (
                  <tr key={entry.attendanceId}>
                    <td>{formatDate(entry.attendanceDate)}</td>
                    <td><span className={`attendance-badge ${entry.status === 'PRESENT' ? 'badge-good' : 'badge-danger'}`}>{entry.status}</span></td>
                    <td>{entry.className || 'N/A'}</td>
                    <td>{entry.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default AttendanceStudent;