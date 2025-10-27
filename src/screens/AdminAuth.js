import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminAuth.css';

const AdminAuth = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple demo auth using hardcoded credentials (for demo/test only)
    // Accepted admin credentials: email: laraib@gmail.com  password: 1234567
    if (form.email === 'laraib@gmail.com' && form.password === '1234567') {
      // set admin token and also a user object so Navbar shows the admin profile
      const adminUser = { name: 'Laraib', email: 'laraib@gmail.com', role: 'admin' };
      localStorage.setItem('adminToken', 'admintoken-demo');
      localStorage.setItem('user', JSON.stringify(adminUser));
      // set token too so existing Navbar logic (which checks token) treats admin as logged in
      localStorage.setItem('token', 'admintoken-demo');
      navigate('/admin');
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card glass-card">
        <h2>Admin Login</h2>
        <p className="muted">This login is for administrators only. Access via /admin-auth</p>

        <form onSubmit={handleSubmit} className="admin-form">
          {error && <div className="error">{error}</div>}
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} />
          </div>
          <button className="btn btn-primary" type="submit">Login as Admin</button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuth;
