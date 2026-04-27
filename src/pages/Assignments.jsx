import { useContext, useEffect, useState } from 'react';
import CrudPage from '../components/CrudPage';
import AppLayout from '../components/AppLayout';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const formatDate = (value) => (value ? new Date(value).toLocaleString() : 'N/A');

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [assignmentResponse, submissionResponse] = await Promise.all([
      api.get('/assignments'),
      api.get('/submissions'),
    ]);
    setAssignments(assignmentResponse.data);
    setSubmissions(submissionResponse.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData().catch((loadError) => {
      setError(loadError.response?.data?.message || 'Unable to load assignments');
      setLoading(false);
    });
  }, []);

  const submissionByAssignment = submissions.reduce((map, submission) => {
    map[submission.assignment?.id] = submission;
    return map;
  }, {});

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');

    try {
      const payload = new FormData();
      payload.append('assignmentId', selectedId);
      payload.append('remarks', remarks);
      if (file) {
        payload.append('file', file);
      }

      await api.post('/submissions/upload', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSelectedId('');
      setRemarks('');
      setFile(null);
      event.target.reset();
      setStatus('Assignment submitted');
      await loadData();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to submit assignment');
    }
  };

  return (
    <AppLayout title="Assignments">
      <div className="page-grid">
        <section className="panel panel-form">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Submit work</p>
              <h2>Upload assignment</h2>
              <p className="muted">Choose a teacher assignment, attach a PDF or file, and add your written answer.</p>
            </div>
          </div>

          {error ? <div className="alert error">{error}</div> : null}
          {status ? <div className="alert success">{status}</div> : null}

          <form className="stack-form" onSubmit={onSubmit}>
            <label className="field">
              <span>Assignment</span>
              <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} required>
                <option value="">Select...</option>
                {assignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>{assignment.title}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>PDF / File</span>
              <input type="file" accept=".pdf,.doc,.docx,.txt,.zip,image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            </label>
            <label className="field">
              <span>Written Assignment</span>
              <textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} rows={6} placeholder="Write your answer or notes here." />
            </label>
            <div className="form-actions">
              <button type="submit" className="primary-button">Submit</button>
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Teacher assignments</p>
              <h2>Available work</h2>
            </div>
            <button type="button" className="ghost-button" onClick={loadData}>Refresh</button>
          </div>

          {loading ? <div className="empty-state">Loading assignments...</div> : null}
          {!loading && assignments.length === 0 ? <div className="empty-state">No assignments available.</div> : null}
          {!loading && assignments.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Teacher</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => {
                    const submission = submissionByAssignment[assignment.id];
                    return (
                      <tr key={assignment.id}>
                        <td>{assignment.title}</td>
                        <td>{assignment.teacher?.user?.fullName || 'Teacher'}</td>
                        <td>{formatDate(assignment.dueDate)}</td>
                        <td>{submission ? submission.status || 'SUBMITTED' : 'Pending'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </AppLayout>
  );
};

const Assignments = () => {
  const { user } = useContext(AuthContext);
  const isStudent = user?.roles?.includes('ROLE_STUDENT');

  if (isStudent) {
    return <StudentAssignments />;
  }

  return (
    <CrudPage
      title="Assignments"
      endpoint="/assignments"
      subtitle="Publish class work and due dates."
      initialForm={{ classId: '', teacherId: '', title: '', description: '', dueDate: '', filePath: '' }}
      fields={[
        { name: 'classId', label: 'Class ID', type: 'number' },
        { name: 'teacherId', label: 'Teacher ID', type: 'number' },
        { name: 'title', label: 'Title' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'dueDate', label: 'Due Date', type: 'datetime-local' },
        { name: 'filePath', label: 'File Path' },
      ]}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Title' },
        { key: 'classEntity.name', label: 'Class' },
        { key: 'teacher.user.fullName', label: 'Teacher' },
        { key: 'dueDate', label: 'Due Date' },
      ]}
    />
  );
};

export default Assignments;
