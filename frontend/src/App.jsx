import './App.css'
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import OAuthSuccess from './pages/auth/OAuthSuccess'
import ForgetPassword from './pages/auth/ResetPassword/ForgetPassword';
import ResetPassword from './pages/auth/ResetPassword/ResetPassword';

import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import OrganizerRoute from './components/auth/OrganizerRoute';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ActivityForm from './pages/activities/ActivityForm';
import ActivitiesDeatels from './pages/activities/ActivitiesDeatels';
import ManageActivities from './pages/activities/ManageActivities';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import ActivitiesFavorites from './pages/activities/ActivitiesFavorites';

import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import OrganizerBookings from './pages/organizer/OrganizerBookings';

import { refreshEchoAuth } from './services/Echo/echo';
import BusinessManager from './pages/organizer/BusinessManager';
import BusinessDetails from './pages/organizer/BusinessDetails';
import MyBookings from './pages/bookings/MyBookings';
import BusinessEdit from './pages/organizer/BusinessEdit';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminActivities from './pages/admin/AdminActivities';
import AdminBusinesses from './pages/admin/AdminBusinesses';
import AdminUsers from './pages/admin/AdminUsers';
import { AUTH_CHANGE_EVENT, getStoredToken } from './utils/auth';



function App() {
  useEffect(() => {
    const syncEchoAuth = () => {
      if (getStoredToken()) {
        refreshEchoAuth();
      }
    };

    syncEchoAuth();

    window.addEventListener('storage', syncEchoAuth);
    window.addEventListener(AUTH_CHANGE_EVENT, syncEchoAuth);

    return () => {
      window.removeEventListener('storage', syncEchoAuth);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncEchoAuth);
    };
  }, []);

  return (
    <>
      <BrowserRouter>

        <Routes>

          <Route path="/"               element={<Home />} />
          <Route path="/landing"        element={<LandingPage />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/oauth-success"  element={<OAuthSuccess />} />
          <Route path="/ForgetPassword" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/:type/:id"      element={<ActivitiesDeatels />} />

          {/*logged in*/}
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
          <Route path="/favorites" element={
            <ProtectedRoute><ActivitiesFavorites /></ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute><MyBookings /></ProtectedRoute>
          } />
          <Route path="/organizer/details/:id" element={
            <ProtectedRoute><BusinessDetails /></ProtectedRoute>
          } />


          {/*be logged in as Organizer*/}
          <Route path="/organizer/dashboard" element={
            <OrganizerRoute><OrganizerDashboard /></OrganizerRoute>
          } />

          <Route path="/organizer/bookings" element={
            <OrganizerRoute><OrganizerBookings /></OrganizerRoute>
          } />

          <Route path="/business/Manage" element={
            <OrganizerRoute><BusinessManager /></OrganizerRoute>
          } />

          <Route path="/business/edit/:id" element={
            <OrganizerRoute><BusinessEdit /></OrganizerRoute>
          } />

          <Route path="/admin/dashboard" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/admin/activities" element={
            <AdminRoute><AdminActivities /></AdminRoute>
          } />
          <Route path="/admin/businesses" element={
            <AdminRoute><AdminBusinesses /></AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute><AdminUsers /></AdminRoute>
          } />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
