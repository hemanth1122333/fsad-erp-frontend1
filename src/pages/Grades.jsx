import { useContext } from 'react';
import CrudPage from '../components/CrudPage';
import { AuthContext } from '../context/AuthContext';

const gradeForMarks = (marks) => {
  const score = Number(marks || 0);
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
};

const remarkForMarks = (marks) => {
  const score = Number(marks || 0);
  if (score >= 85) return 'Excellent work. Keep the same consistency.';
  if (score >= 70) return 'Good progress. Strengthen revision before exams.';
  if (score >= 55) return 'Satisfactory. Needs more practice for higher accuracy.';
  if (score >= 40) return 'Needs improvement. Revise basics and submit practice work.';
  return 'Poor performance. Meet the teacher for a recovery plan.';
};

const Grades = () => {
  const { user } = useContext(AuthContext);
  const isStudent = user?.roles?.includes('ROLE_STUDENT');

  return (
    <CrudPage
      title="Grades"
      endpoint="/grades"
      subtitle="Record marks, grade letters, and assessment notes."
      readOnly={isStudent}
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
        ...(!isStudent ? [{ key: 'id', label: 'ID' }, { key: 'student.user.fullName', label: 'Student' }] : []),
        { key: 'subject', label: 'Subject' },
        { key: 'assessmentType', label: 'Type' },
        { key: 'assessmentName', label: 'Assessment' },
        { key: 'marksObtained', label: 'Marks' },
        { key: 'maxMarks', label: 'Max Marks' },
        { key: 'gradeLetter', label: 'Grade', formatter: (item) => gradeForMarks(item.marksObtained) },
        { key: 'remark', label: 'Remark', formatter: (item) => remarkForMarks(item.marksObtained) },
      ]}
    />
  );
};

export default Grades;
