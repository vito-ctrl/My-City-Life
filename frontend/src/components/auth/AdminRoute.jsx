import React from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredToken, getStoredUser } from '../../utils/auth';

const AdminRoute = ({ children }) => {
  const token = getStoredToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user = getStoredUser();

  if (!user || user.role?.toLowerCase() !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
