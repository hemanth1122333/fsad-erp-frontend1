import CrudPage from '../components/CrudPage';

const Notifications = () => (
  <CrudPage
    title="Notifications"
    endpoint="/notifications"
    subtitle="Publish notices for all users or a single role."
    initialForm={{ title: '', messageBody: '', audienceRole: 'ALL', active: true }}
    fields={[
      { name: 'title', label: 'Title' },
      { name: 'messageBody', label: 'Message', type: 'textarea' },
      { name: 'audienceRole', label: 'Audience Role' },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ]}
    columns={[
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'audienceRole', label: 'Audience' },
      { key: 'active', label: 'Active' },
    ]}
  />
);

export default Notifications;