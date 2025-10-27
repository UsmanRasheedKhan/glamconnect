import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

// ===== NAVBAR COMPONENT =====
// This is the top navigation bar that appears on every page
// It shows the GlamConnect logo, navigation links, and login/profile button

const Navbar = () => {
  // Track if user is logged in by checking localStorage for token
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token') || !!localStorage.getItem('adminToken'));
  
  // Get user data from localStorage
  const [user, setUser] = useState(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  );
  
  // Show/hide profile dropdown menu
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Show/hide mobile navigation menu
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Hook to navigate to different pages
  const navigate = useNavigate();
  
  // Get current page location
  const location = useLocation();

  // Keep navbar state in sync with localStorage (when user logs in/out)
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token') || !!localStorage.getItem('adminToken'));
    setUser(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
    // close dropdown on route change
    setShowDropdown(false);
    setShowMobileMenu(false);
  }, [location]);

  // ===== HANDLE LOGOUT =====
  // When user clicks logout, clear localStorage and redirect to home
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setUser(null);
    setShowDropdown(false);
    navigate('/auth');
  };

  // ===== HANDLE LOGIN REDIRECT =====
  // When user clicks login button, go to auth page
  const handleLoginClick = () => {
    navigate('/auth');
  };

  // ===== HANDLE PROFILE CLICK =====
  // When user clicks their profile, go to profile page
  const handleProfileClick = () => {
    navigate('/profile');
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

  return (
    <nav className="navbar">
      {/* Left side - Logo and brand name */}
      <div className="navbar-brand">
        <Link to="/" className="brand-link">
          <span className="brand-icon">✨</span>
          <span className="brand-name">GlamConnect</span>
        </Link>
      </div>

      {/* Middle - Navigation links */}
        <div className={`navbar-links ${showMobileMenu ? 'active' : ''}`}>
        <Link 
          to="/home" 
          className={`nav-link ${(location.pathname === '/home' || location.pathname === '/') ? 'active' : ''}`}
          onClick={() => setShowMobileMenu(false)}
        >
          Home
        </Link>
        <Link 
          to="/about" 
          className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
          onClick={() => setShowMobileMenu(false)}
        >
          About Us
        </Link>
        <Link 
          to="/services" 
          className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}
          onClick={() => setShowMobileMenu(false)}
        >
          Services
        </Link>
        <Link 
          to="/gallery" 
          className={`nav-link ${location.pathname === '/gallery' ? 'active' : ''}`}
          onClick={() => setShowMobileMenu(false)}
        >
          Gallery
        </Link>
        <Link 
          to="/contact" 
          className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
          onClick={() => setShowMobileMenu(false)}
        >
          Contact
        </Link>
      </div>

      {/* Right side - Login/Profile button */}
      <div className="navbar-auth">
        {isLoggedIn ? (
          <div className="profile-section">
            {/* Profile button with user's first initial */}
            <button 
              className="profile-btn"
              onClick={() => setShowDropdown(!showDropdown)}
              title={user?.name}
            >
              <span className="profile-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </button>

            {/* Dropdown menu for logged-in users */}
            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <p className="user-name">{user?.name}</p>
                  <p className="user-email">{user?.email}</p>
                </div>
                <hr className="dropdown-divider" />
                <button 
                  className="dropdown-item"
                  onClick={handleProfileClick}
                >
                  👤 My Profile
                </button>
                <button 
                  className="dropdown-item"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          // Login button for non-logged-in users
          <button 
            className="login-btn"
            onClick={handleLoginClick}
          >
            🔐 Login / Sign Up
          </button>
        )}
      </div>

      {/* Hamburger menu for mobile */}
      <button 
        className="hamburger"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
};

export default Navbar;
