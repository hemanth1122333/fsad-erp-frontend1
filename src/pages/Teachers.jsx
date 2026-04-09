import CrudPage from '../components/CrudPage';

const Teachers = () => (
  <CrudPage
    title="Teachers"
    endpoint="/teachers"
    subtitle="Create teacher accounts and profiles."
    initialForm={{ name: '', email: '', password: '', employeeCode: '', department: '', phone: '', officeRoom: '' }}
    fields={[
      { name: 'name', label: 'Name' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'password', label: 'Password', type: 'password' },
      { name: 'employeeCode', label: 'Employee Code' },
      { name: 'department', label: 'Department' },
      { name: 'phone', label: 'Phone' },
      { name: 'officeRoom', label: 'Office Room' },
    ]}
    columns={[
      { key: 'id', label: 'ID' },
      { key: 'employeeCode', label: 'Employee Code' },
      { key: 'user.fullName', label: 'Name' },
      { key: 'user.email', label: 'Email' },
      { key: 'department', label: 'Department' },
    ]}
  />
);

export default Teachers;