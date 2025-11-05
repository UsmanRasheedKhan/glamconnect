import React, { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import './Profile.css';

// Local mapping of service IDs to names (kept in sync with Services.js hardcoded list)
const SERVICE_NAMES = {
  1: 'Basic Haircut',
  2: 'Hair Coloring',
  3: 'Hair Styling',
  4: 'Manicure',
  5: 'Pedicure',
  6: 'Nail Art Design',
  7: 'Makeup Application',
  8: 'Bridal Makeup',
  9: 'Facial Treatment',
  10: 'Deep Cleansing Facial',
  11: 'Full Body Massage',
  12: 'Head & Neck Massage'
};

const Profile = () => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' }); // type: 'success' | 'error'

  useEffect(() => {
    if (!user) return;
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const resp = await axios.post('', { action: 'getBookings', userID: user.userID });
      if (resp.data && resp.data.success) {
        setBookings(resp.data.bookings || []);
      } else {
        console.error('Error fetching bookings', resp.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (bookingID) => {
    if (!window.confirm('Delete booking #' + bookingID + '?')) return;
    try {
      const resp = await axios.post('', { action: 'deleteBooking', bookingID, userID: user.userID });
      if (resp.data && resp.data.success) {
        setBookings((prev) => prev.filter(b => b.id !== bookingID));
        setStatusMessage({ text: `Booking #${bookingID} deleted`, type: 'success' });
        console.log(`Booking ${bookingID} deleted`);
      } else {
        const msg = resp.data && resp.data.message ? resp.data.message : 'Unknown';
        setStatusMessage({ text: `Error deleting booking: ${msg}`, type: 'error' });
        console.error('Error deleting booking', resp.data);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: 'Network error while deleting booking', type: 'error' });
    }
  };

  const startEdit = (booking) => {
    setEditingId(booking.id);
    setEditDate(booking.date || '');
    setEditTime(booking.time || '');
    setEditNotes(booking.notes || '');
    setStatusMessage({ text: '', type: '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDate('');
    setEditTime('');
    setEditNotes('');
  };

  const saveEdit = async (bookingID) => {
    // basic validation
    if (!editDate || !editTime) {
      setStatusMessage({ text: 'Date and time are required', type: 'error' });
      console.error('Validation failed: date/time required');
      return;
    }

    try {
      const resp = await axios.post('', { action: 'updateBooking', bookingID, userID: user.userID, date: editDate, time: editTime, notes: editNotes });
      if (resp.data && resp.data.success) {
        setBookings((prev) => prev.map(b => b.id === bookingID ? { ...b, date: editDate, time: editTime, notes: editNotes } : b));
        setStatusMessage({ text: `Booking #${bookingID} updated`, type: 'success' });
        console.log(`Booking ${bookingID} updated`, { date: editDate, time: editTime, notes: editNotes });
        cancelEdit();
      } else {
        const msg = resp.data && resp.data.message ? resp.data.message : 'Unknown';
        setStatusMessage({ text: `Error updating booking: ${msg}`, type: 'error' });
        console.error('Error updating booking', resp.data);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: 'Network error while updating booking', type: 'error' });
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <h2>No user data</h2>
          <p>Please login to see your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card glass-card">
        <div className="profile-avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-email">{user.email}</p>

        <div className="profile-details">
          <div className="detail">
            <strong>Contact:</strong>
            <span>{user.contact || 'N/A'}</span>
          </div>
          <div className="detail">
            <strong>Member since:</strong>
            <span>{user.created_at || 'N/A'}</span>
          </div>
        </div>

        <div className="my-bookings">
          <h3>My Bookings</h3>
          {statusMessage.text && (
            <div className={`status ${statusMessage.type}`}>{statusMessage.text}</div>
          )}
          {loading ? (
            <p>Loading...</p>
          ) : bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <div className="bookings-list">
              {bookings.map(b => (
                <div key={b.id} className="booking-card">
                  <div className="booking-header">
                    <h4>Booking #{b.id}</h4>
                    <div className="booking-status">{b.date} @ {b.time}</div>
                  </div>
                  <div className="booking-details">
                    {editingId === b.id ? (
                      <div className="edit-form">
                        <label>
                          Date:
                          <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                        </label>
                        <label>
                          Time:
                          <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
                        </label>
                        <label>
                          Notes:
                          <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
                        </label>
                        <div className="booking-actions">
                          <button className="btn" onClick={() => saveEdit(b.id)}>Save</button>
                          <button className="btn" onClick={cancelEdit}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {b.service_id !== undefined && (
                          <p><strong>Service:</strong> {SERVICE_NAMES[b.service_id] || `ID ${b.service_id}`}</p>
                        )}
                        {b.notes && <p><strong>Notes:</strong> {b.notes}</p>}
                        <div className="booking-actions">
                          <button className="btn" onClick={() => startEdit(b)}>Edit</button>
                          <button className="btn danger" onClick={() => handleDelete(b.id)}>Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;