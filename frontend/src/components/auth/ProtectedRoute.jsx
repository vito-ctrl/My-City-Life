import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute
 *
 * Wraps any page that requires the user to be logged in.
 * How it works:
 *   - It looks in localStorage for a "token" (saved at login).
 *   - If there is NO token, the user is redirected to /login.
 *   - If there IS a token, the page is shown normally.
 *
 * Usage in App.jsx:
 *   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // No token = not logged in → send to login page
    return <Navigate to="/login" replace />;
  }

  // Token exists → render the actual page
  return children;
};

export default ProtectedRoute;
