import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine if the Login and Register links should be hidden
  const hideAuthLinks = currentPath === '/login' || currentPath === '/register';

  return (
    <div className="navbar">
      <nav className="navbar-container">
        {/* Home link aligned to the left */}
        <div className="navbar-left">
          <Link to='/'>Home</Link>
        </div>

        <div className="navbar-right">
          <div className={`login-navbar-right ${hideAuthLinks ? 'hidden' : ''}`}>
            <Link to='/login'>Login</Link>
          </div>
          <div className={`register-navbar-right ${hideAuthLinks ? 'hidden' : ''}`}>
            <Link to='/register'>Register</Link>
          </div>
        </div>
      </nav>
    </div>
  );
}