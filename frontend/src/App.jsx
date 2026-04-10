import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import OAuthSuccess from './pages/auth/OAuthSuccess'
import Home from './pages/Home';
import ForgetPassword from './pages/auth/ResetPassword/ForgetPassword';
import ResetPassword from './pages/auth/ResetPassword/ResetPassword';
// import ActivityForm from './pages/activities/ActivityForm';
// import ActivitiesPage from './pages/activities/ActivitiesPage';


import TestBooking from './pages/TestBooking/TestBooking';
import Dashboard from './pages/Dashboard';
import ActivityForm from './pages/activities/ActivityForm';
// import ActivitiesPage from './pages/activities/ActivitiesPage';
import ActivitiesDeatels from './pages/activities/ActivitiesDeatels';
import ManageActivities from './pages/activities/ManageActivities';


function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/ForgetPassword" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/activity/create" element={<ActivityForm />} />
        {/* <Route path="/activitie/pay" element={<ActivitiesPage />} /> */}
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/:type/:id" element={<ActivitiesDeatels />} />
        <Route path="/activity/manage" element={<ManageActivities />} />

        
        {/* Test Route */}
        <Route path="/test-booking" element={<TestBooking />} />
      </Routes>
    </BrowserRouter>  
    </>
  )
}

export default App