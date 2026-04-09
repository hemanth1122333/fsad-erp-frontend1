import React, { useEffect, useMemo, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { BellRing, CheckCheck, Download, RefreshCcw, Search, Users } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import api from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const todayValue = () => new Date().toISOString().slice(0, 10);

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

const AttendanceTeacher = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayValue());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    api.get('/classes')
      .then((response) => {
        setClasses(response.data);
        if (!selectedClassId && response.data.length > 0) {
          setSelectedClassId(String(response.data[0].id));
        }
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'Unable to load classes');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      return undefined;
    }

    let active = true;

    const loadStudents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/attendance/students', {
          params: { classId: selectedClassId, date: selectedDate },
        });

        if (!active) {
          return;
        }

        setStudents(response.data.map((student) => ({ ...student, present: Boolean(student.present) })));
        setError('');
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load attendance roster');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadStudents();
    const timer = window.setInterval(loadStudents, 30000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [selectedClassId, selectedDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClassId, selectedDate]);

  useEffect(() => {
    if (success) {
      const timer = window.setTimeout(() => setSuccess(''), 3500);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [success]);

  const selectedClass = classes.find((item) => String(item.id) === String(selectedClassId));

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return students;
    }

    return students.filter((student) => [student.admissionNumber, student.studentName, student.className]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query)));
  }, [students, searchTerm]);

  const totalStudents = filteredStudents.length;
  const presentStudents = filteredStudents.filter((student) => student.present).length;
  const absentStudents = totalStudents - presentStudents;
  const lowAttendanceStudents = filteredStudents.filter((student) => student.lowAttendance).length;
  const averageAttendance = totalStudents
    ? Math.round((filteredStudents.reduce((sum, student) => sum + Number(student.attendancePercentage || 0), 0) / totalStudents) * 10) / 10
    : 0;

  const totalPages = Math.max(1, Math.ceil(totalStudents / pageSize));
  const visibleStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const statusData = {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [presentStudents, absentStudents],
      backgroundColor: ['#067647', '#dc2626'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const toggleStudent = (studentId, present) => {
    setStudents((currentStudents) => currentStudents.map((student) => (
      student.studentId === studentId ? { ...student, present } : student
    )));
  };

  const markAll = (present) => {
    setStudents((currentStudents) => currentStudents.map((student) => ({ ...student, present })));
  };

  const submitAttendance = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = students.map((student) => ({
        studentId: student.studentId,
        classId: Number(selectedClassId),
        attendanceDate: selectedDate,
        status: student.present ? 'PRESENT' : 'ABSENT',
      }));

      await api.post('/attendance/mark', payload);
      setSuccess('Attendance saved successfully.');
      const response = await api.get('/attendance/students', {
        params: { classId: selectedClassId, date: selectedDate },
      });
      setStudents(response.data.map((student) => ({ ...student, present: Boolean(student.present) })));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const exportReport = () => {
    const rows = [
      ['Student ID', 'Admission Number', 'Student Name', 'Class', 'Date', 'Status', 'Attendance %'],
      ...filteredStudents.map((student) => [
        student.studentId,
        student.admissionNumber,
        student.studentName,
        student.className,
        formatDate(selectedDate),
        student.present ? 'PRESENT' : 'ABSENT',
        `${student.attendancePercentage || 0}%`,
      ]),
    ];

    downloadCsv(`attendance-${selectedDate}.csv`, rows);
  };

  return (
    <AppLayout title="Attendance Management">
      <div className="attendance-dashboard">
        <section className="panel attendance-hero">
          <div>
            <p className="eyebrow">Teacher workspace</p>
            <h2>Daily attendance capture</h2>
            <p className="muted">
              Mark presence in one pass, review low-attendance students quickly, and export the daily sheet when you are done.
            </p>
          </div>
          <div className="attendance-hero-actions">
            <button type="button" className="secondary-button" onClick={() => markAll(true)}>
              <CheckCheck size={16} /> Mark All Present
            </button>
            <button type="button" className="secondary-button" onClick={() => markAll(false)}>
              <Users size={16} /> Mark All Absent
            </button>
            <button type="button" className="secondary-button" onClick={exportReport}>
              <Download size={16} /> Download Report
            </button>
          </div>
        </section>

        <section className="attendance-toolbar panel">
          <label className="field compact-field">
            <span>Date</span>
            <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          </label>

          <label className="field compact-field">
            <span>Class / Section</span>
            <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)}>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.classCode} - {classItem.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field compact-field search-field">
            <span>Search student</span>
            <div className="input-icon-wrap">
              <Search size={16} />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Admission number, name, or class"
              />
            </div>
          </label>

          <button type="button" className="ghost-button" onClick={() => window.location.reload()}>
            <RefreshCcw size={16} /> Refresh
          </button>
        </section>

        {error ? <div className="alert error">{error}</div> : null}
        {success ? <div className="alert success">{success}</div> : null}

        <section className="attendance-stats-grid">
          {[
            { label: 'Students in view', value: totalStudents },
            { label: 'Present', value: presentStudents },
            { label: 'Absent', value: absentStudents },
            { label: 'Low attendance', value: lowAttendanceStudents },
          ].map((card) => (
            <article key={card.label} className="panel attendance-stat-card">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </article>
          ))}

          <article className="panel attendance-stat-card accent-card">
            <span>Average attendance</span>
            <strong>{averageAttendance}%</strong>
            <small>{selectedClass ? `${selectedClass.classCode} · ${selectedClass.name}` : 'Select a class'}</small>
          </article>
        </section>

        <section className="attendance-content-grid">
          <div className="panel attendance-table-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Attendance sheet</p>
                <h2>{selectedClass ? `${selectedClass.name} roster` : 'Class roster'}</h2>
              </div>
              <div className="table-meta">
                <span className="pill neutral-pill">{formatDate(selectedDate)}</span>
                <span className="pill success-pill">{presentStudents} present</span>
              </div>
            </div>

            <div className="table-wrap sticky-table-wrap attendance-table-wrap">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Attendance Status</th>
                    <th>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5"><div className="empty-state">Loading attendance roster...</div></td>
                    </tr>
                  ) : null}

                  {!loading && visibleStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5"><div className="empty-state">No students match your filters.</div></td>
                    </tr>
                  ) : null}

                  {!loading && visibleStudents.map((student) => (
                    <tr key={student.studentId} className={`${student.present ? 'row-present' : ''} ${student.lowAttendance ? 'row-warning' : ''}`}>
                      <td>
                        <div className="student-id-stack">
                          <strong>{student.admissionNumber}</strong>
                          <small>{student.batchYear || 'Batch N/A'}</small>
                        </div>
                      </td>
                      <td>
                        <div className="student-name-stack">
                          <strong>{student.studentName}</strong>
                          <small>{student.lowAttendance ? 'Low attendance alert' : 'Attendance on track'}</small>
                        </div>
                      </td>
                      <td>{student.className || selectedClass?.name || 'N/A'}</td>
                      <td>
                        <label className="attendance-checkbox">
                          <input
                            type="checkbox"
                            checked={student.present}
                            onChange={(event) => toggleStudent(student.studentId, event.target.checked)}
                          />
                          <span>{student.present ? 'Present' : 'Absent'}</span>
                        </label>
                      </td>
                      <td>
                        <span className={`attendance-badge ${student.attendancePercentage >= 75 ? 'badge-good' : student.attendancePercentage >= 50 ? 'badge-warn' : 'badge-danger'}`}>
                          {student.attendancePercentage || 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="attendance-footer">
              <div className="pagination-summary">Page {currentPage} of {totalPages}</div>
              <div className="pagination-controls">
                <button type="button" className="secondary-button" disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                  Previous
                </button>
                <button type="button" className="secondary-button" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
                  Next
                </button>
              </div>
              <button type="button" className="primary-button submit-button" disabled={saving || loading || !selectedClassId} onClick={submitAttendance}>
                {saving ? 'Saving...' : 'Submit Attendance'}
              </button>
            </div>
          </div>

          <aside className="panel attendance-analytics-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Analytics</p>
                <h2>Attendance snapshot</h2>
              </div>
              <BellRing size={18} />
            </div>

            <div className="chart-card">
              <Pie data={statusData} options={{ plugins: { legend: { position: 'bottom' } }, cutout: '58%' }} />
            </div>

            <div className="mini-summary-list">
              <div><span>Class</span><strong>{selectedClass ? `${selectedClass.classCode}` : 'Select one'}</strong></div>
              <div><span>Session date</span><strong>{formatDate(selectedDate)}</strong></div>
              <div><span>Low-attendance</span><strong>{lowAttendanceStudents}</strong></div>
              <div><span>Auto sync</span><strong>30s refresh</strong></div>
            </div>

            <div className="warning-box">
              <strong>Real-time notes</strong>
              <p>
                The roster auto-refreshes while you are on this page, so another session marking the same date will sync back in without a full reload.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </AppLayout>
  );
};

export default AttendanceTeacher;