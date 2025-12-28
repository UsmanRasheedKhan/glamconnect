import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { useToast } from '../components/ToastContainer';
import './AdminAuth.css';

const AdminAuth = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      showWarning('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      // Call API to authenticate admin user from admin_users table
      const response = await axios.post('', {
        action: 'adminLogin',
        email: form.email,
        password: form.password
      });

      if (response.data && response.data.success) {
        const { user, token } = response.data;
        
        // Store authentication data
        localStorage.setItem('adminToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);

        // Role-based redirect
        if (user.role === 'super_admin' || user.role === 'admin') {
          showSuccess(`Welcome back, ${user.full_name || user.username}!`);
          navigate('/admin');
        } else if (user.role === 'staff') {
          showSuccess(`Welcome back, ${user.full_name || user.username}!`);
          navigate('/staff');
        } else {
          showError('Invalid user role');
        }
      } else {
        showError(response.data?.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      
      // Fallback: Check with hardcoded credentials for demo purposes
      // Remove this in production
      if (form.email === 'admin@glamconnect.com' && form.password === 'admin123') {
        const adminUser = { 
          name: 'System Administrator', 
          email: 'admin@glamconnect.com', 
          role: 'super_admin',
          username: 'admin'
        };
        localStorage.setItem('adminToken', 'admin-demo-token');
        localStorage.setItem('user', JSON.stringify(adminUser));
        localStorage.setItem('token', 'admin-demo-token');
        showSuccess('Welcome back, Administrator!');
        navigate('/admin');
      } else if (form.email === 'staff@glamconnect.com' && form.password === 'staff123') {
        const staffUser = { 
          name: 'Staff Member', 
          email: 'staff@glamconnect.com', 
          role: 'staff',
          username: 'staff1'
        };
        localStorage.setItem('adminToken', 'staff-demo-token');
        localStorage.setItem('user', JSON.stringify(staffUser));
        localStorage.setItem('token', 'staff-demo-token');
        showSuccess('Welcome back, Staff Member!');
        navigate('/staff');
      } else {
        showError('Invalid credentials. Please check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
        <div className="admin-auth-header">
          <span className="admin-icon">🔐</span>
          <h2>Admin Portal</h2>
          <p>Sign in to access the management dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Email Address</label>
            <input 
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              value={form.password} 
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          <button className="admin-login-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="admin-auth-footer">
          <p className="demo-credentials">
            <strong>Demo Credentials:</strong><br />
            Admin: admin@glamconnect.com / admin123<br />
            Staff: staff@glamconnect.com / staff123
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
