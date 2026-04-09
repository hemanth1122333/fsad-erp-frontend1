import CrudPage from '../components/CrudPage';

const Submissions = () => (
  <CrudPage
    title="Submissions"
    endpoint="/submissions"
    subtitle="Track assignment submissions from students."
    initialForm={{ assignmentId: '', studentId: '', filePath: '', remarks: '', status: 'SUBMITTED' }}
    fields={[
      { name: 'assignmentId', label: 'Assignment ID', type: 'number' },
      { name: 'studentId', label: 'Student ID', type: 'number' },
      { name: 'filePath', label: 'File Path' },
      { name: 'remarks', label: 'Remarks', type: 'textarea' },
      { name: 'status', label: 'Status' },
    ]}
    columns={[
      { key: 'id', label: 'ID' },
      { key: 'assignment.title', label: 'Assignment' },
      { key: 'student.user.fullName', label: 'Student' },
      { key: 'status', label: 'Status' },
    ]}
  />
);

export default Submissions;