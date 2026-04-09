import CrudPage from '../components/CrudPage';

const Students = () => (
  <CrudPage
    title="Students"
    endpoint="/students"
    subtitle="Create a user account and student profile together."
    initialForm={{ name: '', email: '', password: '', admissionNumber: '', className: '', batchYear: '', phone: '', address: '', guardianName: '' }}
    fields={[
      { name: 'name', label: 'Name' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'password', label: 'Password', type: 'password' },
      { name: 'admissionNumber', label: 'Admission Number' },
      { name: 'className', label: 'Class Name' },
      { name: 'batchYear', label: 'Batch Year', type: 'number' },
      { name: 'phone', label: 'Phone' },
      { name: 'address', label: 'Address' },
      { name: 'guardianName', label: 'Guardian Name' },
    ]}
    columns={[
      { key: 'id', label: 'ID' },
      { key: 'admissionNumber', label: 'Admission No.' },
      { key: 'user.fullName', label: 'Name' },
      { key: 'user.email', label: 'Email' },
      { key: 'className', label: 'Class' },
      { key: 'batchYear', label: 'Batch' },
    ]}
  />
);

export default Students;