import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import OAuthSuccess from './pages/auth/OAuthSuccess'
import Home from './pages/Home';
import ForgetPassword from './pages/auth/ResetPassword/ForgetPassword';
import ResetPassword from './pages/auth/ResetPassword/ResetPassword';
import Dashboard from './pages/admin/Dashboard';
import ActivityForm from './pages/activities/ActivityForm';


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
        <Route path="/hhh" element={<Dashboard />} />
        <Route path="/activity/create" element={<ActivityForm />} />
      </Routes>
    </BrowserRouter>  
    </>
  )
}

export default App