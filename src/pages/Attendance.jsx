import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AttendanceTeacher from './AttendanceTeacher';

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const roles = user?.roles || [];

  if (roles.includes('ROLE_STUDENT')) {
    return <Navigate to="/attendance/student" replace />;
  }

  return <AttendanceTeacher />;
};

export default Attendance;