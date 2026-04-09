import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="page-loading">Loading ERP...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some((role) => user.roles?.includes(role));
    if (!hasAllowedRole) {
      return <Navigate to={user.homeRoute || '/dashboard/admin'} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
