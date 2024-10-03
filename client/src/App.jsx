import './App.css';
import {Routes, Route,useLocation} from 'react-router-dom';
import Navbar from '../src/components/Navbar';
import Home from '../src/pages/Home';
import Register from '../src/pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Login from '../src/pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import axios from 'axios';
import {Toaster} from 'react-hot-toast';
import  UserContextProvider  from '../context/userContext';
import Dashboard from './pages/Dashboard';
import ScrapedFiles from './pages/ScrapedFiles';
import FileDetail from './pages/FileDetail';


axios.defaults.baseURL='http://localhost:8000';
axios.defaults.withCredentials=true

function App() {
  const location = useLocation(); 

  return (
    <UserContextProvider>

      {location.pathname !== '/dashboard' && location.pathname.indexOf('/reset-password') === -1 && <Navbar />}
      <Toaster position='top-center' toastOptions={{ duration: 2000 }} />

      <Routes>
         <Route path='/' element={<Home />}/>
         <Route path='/register' element={<Register />}/>
         <Route path="/verify-otp" element={<VerifyOTP />} />
         <Route path='/login' element={<Login />}/>
         <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
         <Route path='/dashboard' element={<Dashboard />}/>
         <Route path="/file-detail/:filename" element={<FileDetail />} />
         <Route path="/scraped-files" element={<ScrapedFiles />} />

      </Routes>
    </UserContextProvider>
  );
}

export default App;