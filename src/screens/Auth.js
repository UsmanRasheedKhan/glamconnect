import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { signup } from '../api/authService';
import { auth, sendVerificationToUser, sendPasswordReset, firebaseConfig } from '../firebase';
import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import axios from '../api/axiosConfig';
import { useToast } from '../components/ToastContainer';

// ========== AUTH COMPONENT ==========
// This component handles all authentication: Login, Signup, and Forgot Password
// Think of it as three pages that users can switch between

const Auth = () => {
  // ===== STATE VARIABLES (Data that can change) =====
  
  // Toast notifications
  const { showSuccess, showError, showInfo } = useToast();
  
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
  // When a user is signed in but not verified, keep the firebase user here so we can resend verification
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  
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
    setLoading(true);
    setErrors({});
    try {
      // Sign in with Firebase
      const userCred = await signInWithEmailAndPassword(auth, formData.phone, formData.password);
      const fbUser = userCred.user;

      // If not verified keep session and allow resend
      if (!fbUser.emailVerified) {
        setUnverifiedUser(fbUser);
        setErrors({ api: 'Email not verified. You can resend the verification email below.' });
        setLoading(false);
        return;
      }

      // Now fetch backend user record by email
      console.log('Firebase user on login:', fbUser);
      const emailForLookup = fbUser.email || formData.phone || formData.email;
      if (!emailForLookup) {
        setErrors({ api: 'Email not available from Firebase. Cannot complete login.' });
        try { await signOut(auth); } catch (e) {}
        setLoading(false);
        return;
      }

      const payload = { action: 'getUserByEmail', email: emailForLookup };
      try {
        const resp = await axios.post('', payload);
        if (resp.data && resp.data.success && resp.data.user) {
          // Attempt to get a Firebase ID token to mark the session as "logged in"
          try {
            const idToken = await fbUser.getIdToken();
            localStorage.setItem('token', idToken);
          } catch (tokenErr) {
            console.warn('Could not get Firebase ID token:', tokenErr);
            // Fallback: store a lightweight flag so ProtectedRoute works
            localStorage.setItem('token', 'firebase-session');
          }

          localStorage.setItem('user', JSON.stringify(resp.data.user));
          showSuccess('Login successful!');
          navigate('/home');
        } else {
          console.error('Backend getUserByEmail response:', resp.data);
          setErrors({ api: resp.data?.message || 'No account found in backend. Please complete signup.' });
          try { await signOut(auth); } catch (e) {}
        }
      } catch (axErr) {
        console.error('Backend request failed', axErr);
        const serverMsg = axErr?.response?.data?.message || axErr?.response?.data || axErr.message;
        setErrors({ api: `Server error: ${serverMsg}` });
        try { await signOut(auth); } catch (e) {}
      }
    } catch (err) {
      console.error('Login error', err);
      setErrors({ api: err.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  // If user lands on the app after clicking the Firebase verification link,
  // Firebase will include an oobCode in the URL. Automatically apply that
  // code via the backend so the DB is updated without requiring "I verified".
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oobCode = params.get('oobCode') || params.get('oobcode');
    if (oobCode) {
      (async () => {
        setLoading(true);
        try {
          const resp = await axios.post('', { action: 'applyOobCode', oobCode, apiKey: firebaseConfig.apiKey });
          if (resp.data && resp.data.success) {
            showSuccess('Email verified successfully. You may now log in.');
            // Clean up URL so user doesn't re-run the action
            const clean = window.location.pathname + (window.location.hash || '');
            window.history.replaceState({}, document.title, clean);
            setActiveTab('login');
          } else {
            console.warn('applyOobCode response', resp.data);
            setErrors({ api: resp.data?.message || 'Failed to apply verification code' });
          }
        } catch (err) {
          console.error('applyOobCode failed', err);
          setErrors({ api: err?.response?.data?.message || err.message || 'Verification failed' });
        } finally {
          setLoading(false);
        }
      })();
    }
  }, []);

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



    // Use Firebase to create an auth account and send verification email first.
    // We will finalize the backend user creation only after the user verifies their email.
    try {
      // Create a Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      // Send verification email via helper
      const sendResp = await sendVerificationToUser(userCredential.user);

      // Persist backend user record immediately (is_verified defaults to 0)
      try {
        const resp = await signup(formData.name, formData.email, formData.contact, formData.password);
        if (resp && resp.success) {
          // Persisted in backend
          console.log('Backend signup created:', resp.user);
        } else {
          console.warn('Backend signup returned unexpected response', resp);
        }
      } catch (backendErr) {
        console.error('Backend signup error', backendErr);
        // We do not block the Firebase flow; inform dev via console and UI
        setErrors({ api: backendErr.message || 'Failed to save user to backend' });
      }

      // Inform user to verify
      if (sendResp.success) {
        showInfo('Signup created. A verification email was sent to your address. Please verify your email before logging in.');
      } else {
        showInfo('Signup created but verification email could not be sent automatically. Please check your email or use the verification link provided by Firebase.');
      }

      // Clear sensitive fields but keep email/name for convenience
      setFormData({
        phone: '',
        password: '',
        newPassword: '',
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Firebase signup error', error);
      setErrors({ api: error.message || 'Signup failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // unneeded pendingSignup/finalize flow: we now persist backend user at signup time.

  // Resend verification email for an unverified firebase user
  const resendVerification = async () => {
    if (!unverifiedUser) return;
    setLoading(true);
    try {
      const r = await sendVerificationToUser(unverifiedUser);
      if (r.success) {
        showSuccess('Verification email resent. Please check your inbox.');
      } else {
        showError('Could not resend verification email automatically. Please check your email provider.');
      }
    } catch (err) {
      console.error('Resend verification error', err);
      setErrors({ api: err.message || 'Failed to resend verification email' });
    } finally {
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

    // Use Firebase to send password reset email
    setLoading(true);
    setErrors({});
    try {
      const r = await sendPasswordReset(formData.email);
      if (r.success) {
        showSuccess('Password reset email sent. Please check your inbox.');
        setActiveTab('login');
      } else {
        setErrors({ api: r.message || 'Failed to send reset email' });
      }
    } catch (err) {
      console.error('Password reset error', err);
      setErrors({ api: err.message || 'Password reset failed' });
    } finally {
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
            {unverifiedUser && (
              <div className="form-meta">
                <p className="info">Your email is not verified yet.</p>
                <button type="button" className="auth-btn" onClick={resendVerification} disabled={loading}>Resend verification email</button>
              </div>
            )}
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
            {/* verification is handled by Firebase; backend record is created at signup time */}
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