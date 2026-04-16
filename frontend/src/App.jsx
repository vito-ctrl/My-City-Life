import './App.css'
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
// OrganizerRoute: requires a token AND role === 'Organizer'
import OrganizerRoute from './components/auth/OrganizerRoute';

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

function App() {
  return (
    <>
      <BrowserRouter>
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
          <Route path="/Favorites" element={
            <ProtectedRoute><ActivitiesFavorites /></ProtectedRoute>
          } />

          {/* ── Organizer-only routes (must be logged in as Organizer) ───── */}
          <Route path="/organizer/dashboard" element={
            <OrganizerRoute><OrganizerDashboard /></OrganizerRoute>
          } />
          <Route path="/organizer/bookings" element={
            <OrganizerRoute><OrganizerBookings /></OrganizerRoute>
          } />

          {/* Test route (development only) */}
          <Route path="/test-booking" element={<TestBooking />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App