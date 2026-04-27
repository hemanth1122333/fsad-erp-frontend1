import { useContext, useEffect, useState } from 'react';
import CrudPage from '../components/CrudPage';
import AppLayout from '../components/AppLayout';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const StudentMessages = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [form, setForm] = useState({ recipientId: '', subject: '', body: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [messageResponse, recipientResponse] = await Promise.all([
      api.get('/messages'),
      api.get('/message-recipients').catch(async () => {
        const teachersResponse = await api.get('/teachers');
        return {
          data: teachersResponse.data.map((teacher) => ({
            ...teacher.user,
            role: { name: 'ROLE_TEACHER' },
          })),
        };
      }),
    ]);
    setMessages(messageResponse.data);
    setRecipients(recipientResponse.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData().catch((loadError) => {
      setError(loadError.response?.data?.message || 'Unable to load messages');
      setLoading(false);
    });
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');
    try {
      await api.post('/messages', { ...form, senderId: user?.id });
      setForm({ recipientId: '', subject: '', body: '' });
      setStatus('Message sent');
      await loadData();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to send message');
    }
  };

  return (
    <AppLayout title="Messages">
      <div className="page-grid">
        <section className="panel panel-form">
          <div className="panel-header">
            <div>
              <p className="eyebrow">New message</p>
              <h2>Contact teacher or admin</h2>
              <p className="muted">Send questions or updates to school staff.</p>
            </div>
          </div>

          {error ? <div className="alert error">{error}</div> : null}
          {status ? <div className="alert success">{status}</div> : null}

          <form className="stack-form" onSubmit={onSubmit}>
            <label className="field">
              <span>Recipient</span>
              <select name="recipientId" value={form.recipientId} onChange={onChange} required>
                <option value="">Select...</option>
                {recipients.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.fullName} ({recipient.role?.name?.replace('ROLE_', '')})
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Subject</span>
              <input name="subject" value={form.subject} onChange={onChange} />
            </label>
            <label className="field">
              <span>Message</span>
              <textarea name="body" value={form.body} onChange={onChange} rows={5} required />
            </label>
            <div className="form-actions">
              <button type="submit" className="primary-button">Send</button>
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Inbox</p>
              <h2>Your messages</h2>
            </div>
            <button type="button" className="ghost-button" onClick={loadData}>Refresh</button>
          </div>

          {loading ? <div className="empty-state">Loading messages...</div> : null}
          {!loading && messages.length === 0 ? <div className="empty-state">No messages yet.</div> : null}
          {!loading && messages.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Subject</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message.id}>
                      <td>{message.sender?.fullName}</td>
                      <td>{message.recipient?.fullName}</td>
                      <td>{message.subject || 'No subject'}</td>
                      <td>{message.body}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </AppLayout>
  );
};

const Messages = () => {
  const { user } = useContext(AuthContext);
  const isStudent = user?.roles?.includes('ROLE_STUDENT');

  if (isStudent) {
    return <StudentMessages />;
  }

  return (
    <CrudPage
      title="Messages"
      endpoint="/messages"
      subtitle="Send simple student-teacher messages."
      initialForm={{ senderId: '', recipientId: '', subject: '', body: '' }}
      fields={[
        { name: 'senderId', label: 'Sender ID', type: 'number' },
        { name: 'recipientId', label: 'Recipient ID', type: 'number' },
        { name: 'subject', label: 'Subject' },
        { name: 'body', label: 'Message', type: 'textarea' },
      ]}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'sender.fullName', label: 'Sender' },
        { key: 'recipient.fullName', label: 'Recipient' },
        { key: 'subject', label: 'Subject' },
      ]}
    />
  );
};

export default Messages;
