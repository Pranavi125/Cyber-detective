import { useState } from "react";
import axios from 'axios';
import {toast} from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import './Register.css';
import { FaUser } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import { RiLockPasswordFill } from "react-icons/ri";

export default function Register() {
  const navigate = useNavigate()
  const [data,setData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const registerUser = async (e) => {
    e.preventDefault()
    const {name, email, password} = data
    try {
      const {data} = await axios.post('/register',{
        name, email, password
      })
      if(data.error) {
        toast.error(data.error)
      }else{
        setData({})
        toast.success('Registration Succesfull. Welcome!!')
        navigate('/login')
      }
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="wrapper">
      <form onSubmit={registerUser}>
        <h1>Register</h1>
        <div className="input-box">
        <input type='text' placeholder='Username' value={data.name} required onChange={(e) => setData({...data, name: e.target.value})}/>
        <FaUser className="icon"/>
        </div>
        <div className="input-box">
        <input type='email' placeholder='Email' value={data.email} required onChange={(e) => setData({...data, email: e.target.value})}/>
        <IoIosMail className="icon"/>
        </div>
        <div className="input-box">
        <input type='password' placeholder='Password' value={data.password} onChange={(e) => setData({...data, password: e.target.value})}/>
        <RiLockPasswordFill className="icon"/>
        </div>
        <button type='submit'>Register</button>
        <div className="login-link">
        <p>already have an account? <a href="/login">Login</a></p>
      </div>
      </form>
    </div>
  )
}
