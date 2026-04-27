import { useContext, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { AuthContext } from '../context/AuthContext';

const periods = [
  '09:00 - 09:50',
  '09:50 - 10:40',
  '10:50 - 11:40',
  '11:40 - 12:30',
  '01:20 - 02:10',
  '02:10 - 03:00',
  '03:10 - 04:00',
];

const subjects = [
  { code: 'DSA', name: 'Data Structures', ltps: '1-1-1-0', room: 'B-204', teacherEmail: 'teacher@erp.com' },
  { code: 'MATH', name: 'Discrete Mathematics', ltps: '1-1-0-0', room: 'A-102', teacherEmail: 'teacher2@erp.com' },
  { code: 'DBMS', name: 'Database Systems', ltps: '2-0-1-0', room: 'B-301' },
  { code: 'OS', name: 'Operating Systems', ltps: '1-0-1-0', room: 'C-210' },
  { code: 'WEB', name: 'Web Technology', ltps: '1-0-1-0', room: 'Lab-3' },
  { code: 'ENG', name: 'Technical Communication', ltps: '0-0-0-2', room: 'A-305' },
];

const sectionSchedules = {
  '10-A': {
    Monday: { 1: { code: 'DSA', type: 'Lecture' }, 2: { code: 'MATH', type: 'Lecture' }, 5: { code: 'WEB', type: 'Practical', room: 'Lab-3' } },
    Tuesday: { 2: { code: 'DBMS', type: 'Lecture' }, 3: { code: 'OS', type: 'Lecture' }, 6: { code: 'ENG', type: 'Skill' } },
    Wednesday: { 1: { code: 'MATH', type: 'Tutorial' }, 4: { code: 'DSA', type: 'Practical', room: 'Lab-1' } },
    Thursday: { 2: { code: 'WEB', type: 'Lecture' }, 5: { code: 'DBMS', type: 'Practical', room: 'Lab-2' }, 6: { code: 'OS', type: 'Practical', room: 'Lab-4' } },
    Friday: { 1: { code: 'ENG', type: 'Skill' }, 3: { code: 'DSA', type: 'Tutorial' }, 5: { code: 'DBMS', type: 'Lecture' } },
  },
  '10-B': {
    Monday: { 2: { code: 'DBMS', type: 'Lecture' }, 4: { code: 'DSA', type: 'Lecture' }, 6: { code: 'ENG', type: 'Skill' } },
    Tuesday: { 1: { code: 'MATH', type: 'Lecture' }, 3: { code: 'WEB', type: 'Lecture' }, 5: { code: 'OS', type: 'Practical', room: 'Lab-4' } },
    Wednesday: { 2: { code: 'DSA', type: 'Practical', room: 'Lab-1' }, 5: { code: 'DBMS', type: 'Practical', room: 'Lab-2' } },
    Thursday: { 1: { code: 'OS', type: 'Lecture' }, 4: { code: 'MATH', type: 'Tutorial' }, 6: { code: 'WEB', type: 'Practical', room: 'Lab-3' } },
    Friday: { 2: { code: 'ENG', type: 'Skill' }, 3: { code: 'DBMS', type: 'Lecture' }, 5: { code: 'DSA', type: 'Tutorial' } },
  },
};

const sections = Object.keys(sectionSchedules);
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const holidayDays = ['Saturday', 'Sunday'];

const subjectByCode = subjects.reduce((map, subject) => ({ ...map, [subject.code]: subject }), {});

const primarySubjectForTeacher = (user) => {
  if (!user?.roles?.includes('ROLE_TEACHER')) return null;
  return subjects.find((s) => s.teacherEmail === user.email) || subjects[0];
};

const StudentGrid = ({ section, schedule }) => (
  <section className="panel timetable-panel">
    <h2>Student timetable - Section {section}</h2>
    <table className="timetable-table">
      <thead>
        <tr>
          <th>Day</th>
          {periods.map((p, i) => <th key={i}>P{i + 1}<small>{p}</small></th>)}
        </tr>
      </thead>
      <tbody>
        {days.map(day => (
          <tr key={day}>
            <td><strong>{day}</strong></td>
            {periods.map((_, i) => {
              const slot = schedule[day][i + 1];
              const subject = slot ? subjectByCode[slot.code] : null;
              return (
                <td key={i}>
                  {subject ? (
                    <>
                      <strong>{subject.code}</strong>
                      <div>{subject.name}</div>
                      <div>{slot.type}</div>
                      <div>Room {slot.room || subject.room}</div>
                      <small>{subject.ltps}</small>
                    </>
                  ) : "Free"}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);

const TeacherGrid = ({ assignedSubject, section, schedule }) => (
  <section className="panel timetable-panel">
    <h2>{assignedSubject.name} - Section {section}</h2>
    <table className="timetable-table">
      <thead>
        <tr>
          <th>Day</th>
          {periods.map((p, i) => <th key={i}>P{i + 1}<small>{p}</small></th>)}
        </tr>
      </thead>
      <tbody>
        {days.map(day => (
          <tr key={day}>
            <td><strong>{day}</strong></td>
            {periods.map((_, i) => {
              const slot = schedule[day][i + 1];
              if (slot && slot.code === assignedSubject.code) {
                return (
                  <td key={i}>
                    <strong>{assignedSubject.code}</strong>
                    <div>{slot.type}</div>
                    <div>Room {slot.room || assignedSubject.room}</div>
                  </td>
                );
              }
              return <td key={i}>Free</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);

const Timetable = () => {
  const { user } = useContext(AuthContext);
  const [selectedSection, setSelectedSection] = useState('10-A');

  const isStudent = user?.roles?.includes('ROLE_STUDENT');
  const assignedSubject = primarySubjectForTeacher(user);

  const selectedSchedule = isStudent
    ? sectionSchedules['10-A']   // ✅ ONLY 10-A FOR STUDENTS
    : sectionSchedules[selectedSection];

  return (
    <AppLayout title="Timetable">
      <h2>{isStudent ? "Student Timetable" : "Teacher Timetable"}</h2>

      {/* 👨‍🏫 Teacher can switch */}
      {!isStudent && (
        <div>
          {sections.map(sec => (
            <button key={sec} onClick={() => setSelectedSection(sec)}>
              {sec}
            </button>
          ))}
        </div>
      )}

      {isStudent
        ? <StudentGrid section="10-A" schedule={selectedSchedule} />
        : <TeacherGrid assignedSubject={assignedSubject} section={selectedSection} schedule={selectedSchedule} />
      }
    </AppLayout>
  );
};

export default Timetable;