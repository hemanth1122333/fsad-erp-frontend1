import CrudPage from '../components/CrudPage';

const Classes = () => (
  <CrudPage
    title="Classes"
    endpoint="/classes"
    subtitle="Assign teachers and schedule class sessions."
    initialForm={{ classCode: '', name: '', description: '', scheduleDay: '', startTime: '', endTime: '', room: '', teacherId: '' }}
    fields={[
      { name: 'classCode', label: 'Class Code' },
      { name: 'name', label: 'Class Name' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'scheduleDay', label: 'Schedule Day' },
      { name: 'startTime', label: 'Start Time', placeholder: '09:00' },
      { name: 'endTime', label: 'End Time', placeholder: '10:30' },
      { name: 'room', label: 'Room' },
      { name: 'teacherId', label: 'Teacher ID', type: 'number' },
    ]}
    columns={[
      { key: 'id', label: 'ID' },
      { key: 'classCode', label: 'Code' },
      { key: 'name', label: 'Name' },
      { key: 'scheduleDay', label: 'Day' },
      { key: 'room', label: 'Room' },
      { key: 'teacher.user.fullName', label: 'Teacher' },
    ]}
  />
);

export default Classes;