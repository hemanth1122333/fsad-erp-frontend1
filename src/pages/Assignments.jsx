import CrudPage from '../components/CrudPage';

const Assignments = () => (
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

export default Assignments;