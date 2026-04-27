import { useContext } from 'react';
import CrudPage from '../components/CrudPage';
import { AuthContext } from '../context/AuthContext';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const isStudent = user?.roles?.includes('ROLE_STUDENT');

  return (
    <CrudPage
      title="Notifications"
      endpoint="/notifications"
      subtitle="Publish notices for all users or a single role."
      readOnly={isStudent}
      initialForm={{ title: '', messageBody: '', audienceRole: 'ALL', active: true }}
      fields={[
        { name: 'title', label: 'Title' },
        { name: 'messageBody', label: 'Message', type: 'textarea' },
        { name: 'audienceRole', label: 'Audience Role' },
        { name: 'active', label: 'Active', type: 'checkbox' },
      ]}
      columns={[
        ...(!isStudent ? [{ key: 'id', label: 'ID' }] : []),
        { key: 'title', label: 'Title' },
        { key: 'messageBody', label: 'Message' },
        { key: 'audienceRole', label: 'Audience' },
        ...(!isStudent ? [{ key: 'active', label: 'Active' }] : []),
      ]}
    />
  );
};

export default Notifications;
