import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { signup, login, resetPassword } from '../api/authService';

// ========== AUTH COMPONENT ==========
// This component handles all authentication: Login, Signup, and Forgot Password
// Think of it as three pages that users can switch between

const Auth = () => {
  // ===== STATE VARIABLES (Data that can change) =====
  
  // Which form tab is currently showing (login, signup, or forgot)
  const [activeTab, setActiveTab] = useState('login');
  
  // Stores all form input values from the user
  const [formData, setFormData] = useState({
    phone: '',              // Used for login (but actually stores email)
    password: '',           // User's password
    newPassword: '',        // New password for reset
    name: '',               // User's full name (for signup)
    email: '',              // User's email (for signup and forgot)
    contact: '',            // User's phone number
    confirmPassword: '',    // For confirming password matches (signup)
  });
  
  // Stores error messages to show to the user
  const [errors, setErrors] = useState({});
  
  // Tracks if a request is being sent to the server
  const [loading, setLoading] = useState(false);
  
  // Hook to navigate to different pages
  const navigate = useNavigate();

  // ===== HELPER FUNCTION: Handle input changes =====
  // When user types in a form field, this function updates the formData
  const handleChange = (e) => {
    // Get the input field's name and value
    const { name, value } = e.target;
    
    // Update formData with the new value
    // ...formData means "keep all existing data, but update this one field"
    setFormData({
      ...formData,
      [name]: value,  // Update the field that was typed in
    });
  };

  // ===== VALIDATION FUNCTIONS =====
  // These functions check if data is valid before sending to server
  
  // Check if email format is correct (example@domain.com)
  const validateEmail = (email) => {
    // Regex pattern: must have @ and . in right places
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Check if phone number is valid (at least 10 digits)
  const validatePhone = (phone) => {
    // Regex pattern: numbers, spaces, dashes, plus sign allowed
    return /^[\d\s\-\+\(\)]{10,}$/.test(phone);
  };

  // ===== LOGIN HANDLER =====
  // This function runs when user submits the login form
  const handleLogin = async (e) => {
    // Prevent page refresh on form submit
    e.preventDefault();
    
    // Create an object to store error messages
    let newErrors = {};
    
    // Check 1: Is email field filled?
    if (!formData.phone) {
      newErrors.phone = 'Email is required';
    }
    
    // Check 2: Is password field filled?
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    // Check 3: Is email format valid?
    if (formData.phone && !validateEmail(formData.phone)) {
      newErrors.phone = 'Invalid email';
    }

    // If there are any errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // ===== SEND LOGIN REQUEST TO SERVER =====
    setLoading(true);      // Show "logging in..." message
    setErrors({});         // Clear any previous errors

    try {
      // Call the login function from authService
      // Pass email (stored in phone field) and password
      const response = await login(formData.phone, formData.password);
      
      // Check if login was successful
      if (response.success) {
        // Save the token (for verifying user is logged in)
        localStorage.setItem('token', response.token);
        
        // Save user information to localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Show success message
        alert('Login successful!');
        
        // Redirect to home/dashboard page
        navigate('/home');
      } else {
        // Show error message from server
        setErrors({ api: response.message });
      }
    } catch (error) {
      // If something goes wrong, show error
      setErrors({ api: error.message || 'Login failed. Please try again.' });
    } finally {
      // After trying to login, stop loading
      setLoading(false);
    }
  };

  // ===== SIGNUP HANDLER =====
  // This function runs when user submits the signup form
  const handleSignup = async (e) => {
    // Prevent page refresh
    e.preventDefault();
    
    // Create object to store errors
    let newErrors = {};
    
    // Validation checks
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    if (!formData.contact) newErrors.contact = 'Contact is required';
    if (formData.contact && !validatePhone(formData.contact)) {
      newErrors.contact = 'Invalid contact number';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // If errors found, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // ===== SEND SIGNUP REQUEST TO SERVER =====
    setLoading(true);
    setErrors({});

    try {
      // Call signup function from authService with user's data
      const response = await signup(
        formData.name,
        formData.email,
        formData.contact,
        formData.password
      );
      
      // Check if signup was successful
      if (response.success) {
        // Show success message
        alert('Signup successful! Please login with your credentials.');
        
        // Clear the form
        setFormData({
          phone: '',
          password: '',
          newPassword: '',
          name: '',
          email: '',
          contact: '',
          confirmPassword: '',
        });
        
        // Switch to login tab so user can log in
        setActiveTab('login');
      } else {
        // Show error from server
        setErrors({ api: response.message });
      }
    } catch (error) {
      // Show error if signup fails
      setErrors({ api: error.message || 'Signup failed. Please try again.' });
    } finally {
      // Stop loading after trying signup
      setLoading(false);
    }
  };

  // ===== FORGOT PASSWORD HANDLER =====
  // This function runs when user submits the forgot password form
  const handleForgotPassword = async (e) => {
    // Prevent page refresh
    e.preventDefault();
    
    // Create object to store errors
    let newErrors = {};
    
    // Validation checks
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    if (!formData.contact) newErrors.contact = 'Contact is required';
    if (formData.contact && !validatePhone(formData.contact)) {
      newErrors.contact = 'Invalid contact number';
    }
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';

    // If errors found, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // ===== SEND PASSWORD RESET REQUEST TO SERVER =====
    setLoading(true);
    setErrors({});

    try {
      // Call resetPassword function from authService
      const response = await resetPassword(
        formData.email,
        formData.contact,
        formData.newPassword
      );
      
      // Check if reset was successful
      if (response.success) {
        // Show success message
        alert('Password reset successful! Please login with your new password.');
        
        // Clear the form
        setFormData({
          phone: '',
          password: '',
          newPassword: '',
          name: '',
          email: '',
          contact: '',
          confirmPassword: '',
        });
        
        // Go back to login tab
        setActiveTab('login');
      } else {
        // Show error from server
        setErrors({ api: response.message });
      }
    } catch (error) {
      // Show error if reset fails
      setErrors({ api: error.message || 'Password reset failed. Please try again.' });
    } finally {
      // Stop loading after trying reset
      setLoading(false);
    }
  };

  // ===== RENDER (What user sees on screen) =====
  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header with GlamConnect title */}
        <div className="auth-header">
          <h1 className="glamconnect-logo">GlamConnect</h1>
          <p className="tagline">Your Premium Salon Experience</p>
        </div>

        {/* Tab buttons to switch between login and signup (hidden on forgot page) */}
        <div className={`auth-tabs ${activeTab === 'forgot' ? 'hidden' : ''}`}>
          <button
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setErrors({});  // Clear errors when switching tabs
            }}
          >
            Login
          </button>
          <button
            className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('signup');
              setErrors({});  // Clear errors when switching tabs
            }}
          >
            Sign Up
          </button>
        </div>

        {/* ===== LOGIN FORM ===== */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="auth-form tab-panel">
            {/* Show error banner if there's an API error */}
            {errors.api && <div className="error-banner">{errors.api}</div>}
            
            {/* Email input field */}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={loading}  // Disable input while sending request
              />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>
            
            {/* Password input field */}
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
            
            {/* Forgot password link */}
            <div className="form-meta">
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setActiveTab('forgot');
                  setErrors({});
                }}
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>
            
            {/* Submit button */}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {/* ===== SIGNUP FORM ===== */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignup} className="auth-form tab-panel">
            {/* Show error banner if there's an API error */}
            {errors.api && <div className="error-banner">{errors.api}</div>}
            
            {/* Name input field */}
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                disabled={loading}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
            
            {/* Email input field */}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={loading}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            
            {/* Contact input field */}
            <div className="form-group">
              <label>Contact</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Enter your contact number"
                disabled={loading}
              />
              {errors.contact && <span className="error">{errors.contact}</span>}
            </div>
            
            {/* Password input field */}
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                disabled={loading}
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
            
            {/* Confirm password input field */}
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={loading}
              />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>
            
            {/* Submit button */}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        )}

        {/* ===== FORGOT PASSWORD FORM ===== */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="auth-form tab-panel">
            {/* Show error banner if there's an API error */}
            {errors.api && <div className="error-banner">{errors.api}</div>}
            
            {/* Instructions */}
            <p className="forgot-text">Reset your password with your email and contact</p>
            
            {/* Email input field */}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={loading}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            
            {/* Contact input field */}
            <div className="form-group">
              <label>Contact</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Enter your contact number"
                disabled={loading}
              />
              {errors.contact && <span className="error">{errors.contact}</span>}
            </div>
            
            {/* New password input field */}
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
                disabled={loading}
              />
              {errors.newPassword && <span className="error">{errors.newPassword}</span>}
            </div>
            
            {/* Submit button */}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            
            {/* Back to login link */}
            <div className="form-meta center">
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setActiveTab('login');
                  setErrors({});
                }}
                disabled={loading}
              >
                Back to login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;