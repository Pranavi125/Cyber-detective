import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '../src/components/Navbar';
import Home from '../src/pages/Home';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP'; // Import your VerifyOTP page
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword'; 
import ResetPassword from './pages/ResetPassword';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import  UserContextProvider  from '../context/userContext';
import Dashboard from './pages/Dashboard';

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

function App() {
  const location = useLocation();  // Get the current location (URL path)
  

  return (
    <UserContextProvider>
      {/* Conditionally render the Navbar based on the current route */}
      {/* Navbar will not appear on reset-password page */}
      {location.pathname !== '/dashboard' && location.pathname.indexOf('/reset-password') === -1 && <Navbar />}
      
      <Toaster position='top-center' toastOptions={{ duration: 2000 }} />
      
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register' element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path='/login' element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </UserContextProvider>
  );
}

export default App;