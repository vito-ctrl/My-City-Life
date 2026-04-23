import './App.css'
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ── Auth pages (always public) ─────────────────────────────────────────────
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import OAuthSuccess from './pages/auth/OAuthSuccess'
import ForgetPassword from './pages/auth/ResetPassword/ForgetPassword';
import ResetPassword from './pages/auth/ResetPassword/ResetPassword';

// ── Route guards ───────────────────────────────────────────────────────────
// ProtectedRoute: requires a token (user must be logged in)
import ProtectedRoute from './components/auth/ProtectedRoute';

// ── Regular (user-facing) pages ────────────────────────────────────────────
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ActivityForm from './pages/activities/ActivityForm';
import ActivitiesDeatels from './pages/activities/ActivitiesDeatels';
import ManageActivities from './pages/activities/ManageActivities';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import ActivitiesFavorites from './pages/activities/ActivitiesFavorites';
import TestBooking from './pages/TestBooking/TestBooking';

// ── Organizer pages ────────────────────────────────────────────────────────
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import OrganizerBookings from './pages/organizer/OrganizerBookings';

// ── Social/Match pages ─────────────────────────────────────────────────────
import MatchNotification from './pages/Match/MatchNotification';
import ChatRoom from './pages/Match/ChatRoom';
import { refreshEchoAuth } from './services/Echo/echo';
import BusinessManager from './pages/organizer/BusinessManager';
import BusinessDetails from './pages/organizer/BusinessDetails';
import BusinessEdit from './pages/organizer/BusinessEdit';

import MessagesPage from './pages/chat/MessagesPage';

function App() {
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });

  useEffect(() => {
    // Initial echo auth if user exists
    if (user) refreshEchoAuth();
  }, []);

  useEffect(() => {
    // Interval to detect storage changes (e.g. after login/logout in other components)
    const interval = setInterval(() => {
      const currentUserStr = localStorage.getItem('user');
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      
      // Only update if the content has actually changed
      if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
        setUser(currentUser);
        if (currentUser) refreshEchoAuth();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <>
      <BrowserRouter>
        {user && <MatchNotification currentUserId={user.id} />}
        <Routes>

          {/* ── Public routes (no login required) ───────────────────────── */}
          <Route path="/"               element={<Home />} />
          <Route path="/landing"        element={<LandingPage />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/oauth-success"  element={<OAuthSuccess />} />
          <Route path="/ForgetPassword" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Activity detail page is public so anyone can browse */}
          <Route path="/:type/:id"      element={<ActivitiesDeatels />} />

          {/* ── Protected routes (must be logged in) ────────────────────── */}
          <Route path="/Dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/activity/create" element={
            <ProtectedRoute><ActivityForm /></ProtectedRoute>
          } />
          <Route path="/activity/manage" element={
            <ProtectedRoute><ManageActivities /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/organizer/details/:id" element={
            <ProtectedRoute><BusinessDetails /></ProtectedRoute>
          } />


          {/* ── Organizer-only routes (must be logged in as Organizer) ───── */}
          <Route path="/organizer/dashboard" element={
            <ProtectedRoute><OrganizerDashboard /></ProtectedRoute>
          } />
          <Route path="/organizer/bookings" element={
            <ProtectedRoute><OrganizerBookings /></ProtectedRoute>
          } />

          <Route path="/business/Manage" element={
            <ProtectedRoute><BusinessManager /></ProtectedRoute>
          } />

          <Route path="/business/edit/:id" element={
            <ProtectedRoute><BusinessEdit /></ProtectedRoute>
          } />

          {/* ── Social routes ───────────────────────────────────────────────── */}
          <Route path="/messages" element={
            <ProtectedRoute><MessagesPage /></ProtectedRoute>
          } />
          
          <Route path="/chat/:slug" element={
            <ProtectedRoute><ChatRoom /></ProtectedRoute>
          } />

          {/* Test route (development only) */}
          <Route path="/test-booking" element={<TestBooking />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App