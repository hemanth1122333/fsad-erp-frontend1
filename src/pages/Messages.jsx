import CrudPage from '../components/CrudPage';

const Messages = () => (
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

export default Messages;