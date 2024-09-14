import { useState } from "react";
import axios from 'axios'
import {toast} from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import './Login.css'; // Adjust the path as necessary



export default function Login() {
  const navigate = useNavigate()
  const [data,setData] = useState({
    email: '',
    password: '',
  })


  const loginUser = async (e) => {
    e.preventDefault()
    const {email, password} = data
    try {
      const {data} = await axios.post('auth/login', {
        email,
        password
      });
      if(data.error){
        toast.error(data.error)
      }else{
        setData({});
        toast.success('login Succesfull!!')
        navigate('/dashboard')
      }
    } catch (error) {
      if (error.response && error.response.data) {
        // Handle specific error from the server
        toast.error(error.response.data.error || 'An error occurred during login');
      } else {
        // Handle network or other errors
        toast.error(error.message || 'An error occurred');
      }
    }
  }

  return (
    <div className='wrapper'>
      <form onSubmit={loginUser}>
        <h1>Login</h1>
      <div className="input-box">
        <input type='email' placeholder='Email' autoComplete="email" required value={data.email} onChange={(e) => setData({...data, email: e.target.value})}/>
        <MdEmail className="icon"/>
      </div>
      <div className="input-box">
        <input type='password' placeholder='Password' autoComplete="new-password" required value={data.password} onChange={(e) => setData({...data, password: e.target.value})} />
        <RiLockPasswordFill className="icon"/>
      </div>
      <div className="remember-forget">
        <label><input type="checkbox" />Remember me</label>
        <a href="#">Forgot Password??</a>
      </div>
      <button type="submit">Login</button>
      <div className="register-link">
        <p>Don't have an account? <a href="/register">Register</a></p>
      </div>
      </form>
    </div>
  )
}

