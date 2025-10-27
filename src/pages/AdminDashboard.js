import React, { useState } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([
    { id: 1, name: 'Aisha Khan', service: 'Haircut', date: '2025-10-28', time: '11:00', status: 'pending' },
    { id: 2, name: 'Sara Malik', service: 'Facial', date: '2025-10-29', time: '14:30', status: 'confirmed' },
    { id: 3, name: 'Zara Ali', service: 'Manicure', date: '2025-10-30', time: '09:00', status: 'completed' }
  ]);

  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    return (
      <div className="admin-dashboard">
        <div className="admin-card">
          <h2>Access denied</h2>
          <p>Admin access required. Login at <code>/admin-auth</code></p>
        </div>
      </div>
    );
  }

  const updateStatus = (id, status) => {
    setBookings((prev) => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const removeBooking = (id) => {
    if (!window.confirm('Delete booking #' + id + '?')) return;
    setBookings((prev) => prev.filter(b => b.id !== id));
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-card glass-card">
        <h1>Admin Dashboard</h1>
        <p className="muted">Basic admin panel (demo). Protect routes server-side in production.</p>

        <div className="admin-widgets">
          <div className="widget">Users: <strong>—</strong></div>
          <div className="widget">Bookings: <strong>{bookings.length}</strong></div>
          <div className="widget">Reports: <strong>—</strong></div>
        </div>

        <section className="bookings-section">
          <h2>Bookings</h2>
          {bookings.length === 0 ? (
            <div className="muted">No bookings yet.</div>
          ) : (
            <div className="bookings-table">
              {bookings.map(b => (
                <div key={b.id} className="booking-row">
                  <div className="booking-info">
                    <div className="booking-name">#{b.id} — {b.name}</div>
                    <div className="booking-meta">{b.service} • {b.date} @ {b.time}</div>
                  </div>
                  <div className="booking-status">{b.status}</div>
                  <div className="booking-actions">
                    {b.status !== 'confirmed' && b.status !== 'completed' && (
                      <button className="btn" onClick={() => updateStatus(b.id, 'confirmed')}>Confirm</button>
                    )}
                    {b.status !== 'completed' && (
                      <button className="btn" onClick={() => updateStatus(b.id, 'completed')}>Mark Completed</button>
                    )}
                    <button className="btn danger" onClick={() => removeBooking(b.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
