import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * OrganizerRoute
 *
 * Wraps pages that only Organizers should see.
 * How it works:
 *   1. If there is NO token → redirect to /login (not logged in at all).
 *   2. If there IS a token but the user's role is NOT 'Organizer' → redirect to /
 *      (logged in, but as a regular user, guide, etc.)
 *   3. If role IS 'Organizer' → show the page.
 *
 * The user object is read from localStorage where it was saved during login.
 *
 * Usage in App.jsx:
 *   <Route path="/organizer/dashboard" element={<OrganizerRoute><OrganizerDashboard /></OrganizerRoute>} />
 */
const OrganizerRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Parse the user object saved during login
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  if (!user || user.role !== 'Organizer') {
    // Logged in but not an Organizer → send to homepage
    return <Navigate to="/" replace />;
  }

  return children;
};

export default OrganizerRoute;
