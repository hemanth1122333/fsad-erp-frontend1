import CrudPage from '../components/CrudPage';

const Grades = () => (
  <CrudPage
    title="Grades"
    endpoint="/grades"
    subtitle="Record marks, grade letters, and assessment notes."
    initialForm={{ studentId: '', classId: '', subject: '', assessmentName: '', marksObtained: '', maxMarks: '', gradeLetter: '', remark: '' }}
    fields={[
      { name: 'studentId', label: 'Student ID', type: 'number' },
      { name: 'classId', label: 'Class ID', type: 'number' },
      { name: 'subject', label: 'Subject' },
      { name: 'assessmentName', label: 'Assessment Name' },
      { name: 'marksObtained', label: 'Marks Obtained', type: 'number' },
      { name: 'maxMarks', label: 'Max Marks', type: 'number' },
      { name: 'gradeLetter', label: 'Grade Letter' },
      { name: 'remark', label: 'Remark', type: 'textarea' },
    ]}
    columns={[
      { key: 'id', label: 'ID' },
      { key: 'student.user.fullName', label: 'Student' },
      { key: 'subject', label: 'Subject' },
      { key: 'assessmentName', label: 'Assessment' },
      { key: 'marksObtained', label: 'Marks' },
      { key: 'gradeLetter', label: 'Grade' },
    ]}
  />
);

export default Grades;