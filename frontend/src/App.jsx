import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'


function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        {/* <Route path="/available" element={<AvailableCourses/>} />
        <Route path="/deateals/:id" element={<DeatelsCourses/>} /> */}
      </Routes>
    </BrowserRouter>  
    </>
  )
}

export default App