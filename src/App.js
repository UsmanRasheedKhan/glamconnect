import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './screens/Auth';
import Home from './screens/Home';

// ===== APP COMPONENT =====
// This is the main app component that handles routing (page navigation)
// Think of it as the "traffic controller" that decides which page to show

function App() {
  // ===== HELPER FUNCTION: Check if user is logged in =====
  // This function checks if there's a token in localStorage
  // If yes = user is logged in, if no = user needs to login
  const isLoggedIn = () => {
    // localStorage.getItem gets data saved in browser storage
    // Returns null if token doesn't exist
    const token = localStorage.getItem('token');
    return token !== null;  // true if token exists, false if not
  };

  // ===== PROTECTED ROUTE COMPONENT =====
  // This component wraps pages that only logged-in users should see
  // If user is not logged in, redirect them to login page
  const ProtectedRoute = ({ children }) => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      // If not logged in, redirect to login page
      return <Navigate to="/" replace />;
    }
    // If logged in, show the page
    return children;
  };

  // ===== PUBLIC ROUTE LOGIC =====
  // If user is already logged in and visits login page,
  // redirect them to home page
  const PublicRoute = ({ children }) => {
    // Check if user is logged in
    if (isLoggedIn()) {
      // If logged in, redirect to home (dashboard)
      return <Navigate to="/home" replace />;
    }
    // If not logged in, show the login page
    return children;
  };

  // ===== RENDER (What gets shown on screen) =====
  return (
    // BrowserRouter enables routing in the app
    <Router>
      <div className="App">
        {/* Routes: Set up all the pages and their paths */}
        <Routes>
          {/* 
            Route 1: Login/Signup Page
            Path: "/" (the root/home URL)
            Access: Public (anyone can see)
            Shows: Auth component (login/signup forms)
          */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            }
          />

          {/* 
            Route 2: Home/Dashboard Page
            Path: "/home"
            Access: Protected (only logged-in users)
            Shows: Home component (user profile, dashboard)
            If not logged in: redirects to "/"
          */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* 
            Route 3: Fallback for unknown URLs
            Path: "*" (any path not matching above)
            Action: Redirect to home page
            This prevents blank pages if user goes to wrong URL
          */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
