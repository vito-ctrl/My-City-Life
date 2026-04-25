import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  return <Navigate to="/admin/activities" replace />;
};

export default AdminDashboard;
