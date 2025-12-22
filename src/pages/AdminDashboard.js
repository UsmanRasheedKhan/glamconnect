import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import axios from '../api/axiosConfig';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, past: 0, confirmed: 0 });
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'services'
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({ service_name: '', description: '', price: '', image_url: '' });
  const [editingServiceId, setEditingServiceId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const resp = await axios.post('', { action: 'getBookings' });
      if (resp.data && resp.data.success) {
        setBookings(resp.data.bookings || []);
      } else {
        console.warn('Failed to fetch bookings', resp.data);
      }
    } catch (err) {
      console.error('Error fetching bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const resp = await axios.post('', { action: 'getServices' });
      if (resp.data && resp.data.success) {
        setServices(resp.data.services || []);
      } else {
        console.warn('Failed to fetch services', resp.data);
      }
    } catch (err) {
      console.error('Error fetching services', err);
    }
  };

  useEffect(() => { 
    fetchBookings();
    fetchServices();
  }, []);

  useEffect(() => {
    // Auto-mark past bookings as completed if not already completed
    const now = new Date();
    const total = bookings.length;
    let upcoming = 0, past = 0, confirmed = 0;
    
    bookings.forEach(b => {
      const dt = new Date(b.date + 'T' + (b.time || '00:00'));
      const isPast = dt < now;
      
      // Auto-complete if past and not already completed
      if (isPast && b.status !== 'completed') {
        adminUpdate(b.id, { status: 'completed' });
      }
      
      if (dt >= now) upcoming++; else past++;
      if (b.status === 'confirmed') confirmed++;
    });
    setStats({ total, upcoming, past, confirmed });
  }, [bookings]);

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

  const adminUpdate = async (id, fields) => {
    try {
      const payload = { action: 'adminUpdateBooking', bookingID: id, ...fields };
      const resp = await axios.post('', payload);
      if (resp.data && resp.data.success) {
        fetchBookings();
      } else {
        alert('Failed to update booking: ' + (resp.data?.message || 'unknown'));
      }
    } catch (err) {
      console.error('adminUpdate error', err);
      alert('Error updating booking');
    }
  };

  const adminDelete = async (id) => {
    if (!window.confirm('Delete booking #' + id + '?')) return;
    try {
      const resp = await axios.post('', { action: 'adminDeleteBooking', bookingID: id });
      if (resp.data && resp.data.success) fetchBookings();
      else alert('Delete failed: ' + (resp.data?.message || 'unknown'));
    } catch (err) {
      console.error('adminDelete error', err);
      alert('Error deleting booking');
    }
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.service_name || !serviceForm.description || !serviceForm.price) {
      alert('Service name, description, and price are required.');
      return;
    }
    
    try {
      const action = editingServiceId ? 'updateService' : 'createService';
      const payload = { 
        action, 
        ...serviceForm,
        ...(editingServiceId && { serviceID: editingServiceId })
      };
      const resp = await axios.post('', payload);
      if (resp.data && resp.data.success) {
        setServiceForm({ service_name: '', description: '', price: '', image_url: '' });
        setEditingServiceId(null);
        setShowServiceForm(false);
        fetchServices();
      } else {
        alert('Failed to save service: ' + (resp.data?.message || 'unknown'));
      }
    } catch (err) {
      console.error('Service save error', err);
      alert('Error saving service');
    }
  };

  const handleEditService = (service) => {
    setServiceForm({
      service_name: service.service_name,
      description: service.description,
      price: service.price,
      image_url: service.image_url || ''
    });
    setEditingServiceId(service.id);
    setShowServiceForm(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      const resp = await axios.post('', { action: 'deleteService', serviceID: serviceId });
      if (resp.data && resp.data.success) {
        fetchServices();
      } else {
        alert('Delete failed: ' + (resp.data?.message || 'unknown'));
      }
    } catch (err) {
      console.error('Service delete error', err);
      alert('Error deleting service');
    }
  };

  const resetServiceForm = () => {
    setServiceForm({ service_name: '', description: '', price: '', image_url: '' });
    setEditingServiceId(null);
    setShowServiceForm(false);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-card glass-card">
        <h1>Admin Dashboard</h1>
        <p className="muted">Manage bookings and services.</p>

        <div className="admin-widgets">
          <div className="widget">Total: <strong>{stats.total}</strong></div>
          <div className="widget">Upcoming: <strong>{stats.upcoming}</strong></div>
          <div className="widget">Past: <strong>{stats.past}</strong></div>
          <div className="widget">Confirmed: <strong>{stats.confirmed}</strong></div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </button>
          <button 
            className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Services
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <section className="bookings-section">
            <h2>Bookings</h2>
            {loading ? (
              <div className="muted">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="muted">No bookings yet.</div>
            ) : (
              <div className="bookings-list">
                {bookings.map((b, idx) => {
                  const dt = new Date(b.date + 'T' + (b.time || '00:00'));
                  const isPast = dt < new Date();
                  return (
                    <div key={b.id} className="booking-item">
                      <div className="booking-number">{idx + 1}.</div>
                      <div className="booking-main">
                        <div className="booking-header-row">
                          <div className="booking-user-info">
                            <h4 className="user-name">{b.name || `User ${b.user_id}`}</h4>
                            <p className="user-contact">{b.email || '—'}</p>
                          </div>
                          <div className="booking-datetime">
                            <span className="date-badge">{b.date}</span>
                            <span className="time-badge">{b.time}</span>
                          </div>
                          <div className={`booking-status-badge ${b.status || 'pending'} ${isPast ? 'past' : ''}`}>
                            {isPast && b.status !== 'completed' ? 'Auto-Completing...' : (b.status || 'pending')}
                          </div>
                        </div>
                        <div className="booking-service">
                          <strong>Service:</strong> {b.service_name || (b.service_id ? `Service ${b.service_id}` : '—')}
                        </div>
                        {b.notes && <div className="booking-notes"><strong>Notes:</strong> {b.notes}</div>}
                        <div className="booking-actions">
                          {b.status !== 'confirmed' && b.status !== 'completed' && (
                            <button className="btn btn-confirm" onClick={() => adminUpdate(b.id, { status: 'confirmed' })}>✓ Confirm</button>
                          )}
                          {b.status !== 'completed' && (
                            <button className="btn btn-completed" onClick={() => adminUpdate(b.id, { status: 'completed' })}>✓ Mark Completed</button>
                          )}
                          <button className="btn btn-edit" onClick={() => {
                            const newDate = prompt('New date (YYYY-MM-DD)', b.date);
                            const newTime = prompt('New time (HH:MM)', b.time);
                            if (newDate || newTime) adminUpdate(b.id, { date: newDate || b.date, time: newTime || b.time });
                          }}>✎ Edit</button>
                          <button className="btn btn-delete" onClick={() => adminDelete(b.id)}>✕ Delete</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <section className="services-section">
            <div className="services-header">
              <h2>Services</h2>
              <button className="btn btn-primary" onClick={() => {
                resetServiceForm();
                setShowServiceForm(true);
              }}>+ Add Service</button>
            </div>

            {/* Service Form */}
            {showServiceForm && (
              <div className="service-form-wrapper">
                <form className="service-form" onSubmit={handleSaveService}>
                  <h3>{editingServiceId ? 'Edit Service' : 'Create New Service'}</h3>
                  <div className="form-group">
                    <label>Service Name *</label>
                    <input 
                      type="text" 
                      value={serviceForm.service_name}
                      onChange={(e) => setServiceForm({...serviceForm, service_name: e.target.value})}
                      placeholder="e.g., Haircut, Facial, Massage"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description *</label>
                    <textarea 
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                      placeholder="Describe the service..."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Price *</label>
                    <input 
                      type="number" 
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Image URL</label>
                    <input 
                      type="text" 
                      value={serviceForm.image_url}
                      onChange={(e) => setServiceForm({...serviceForm, image_url: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-confirm">
                      {editingServiceId ? 'Update Service' : 'Create Service'}
                    </button>
                    <button type="button" className="btn btn-delete" onClick={resetServiceForm}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Services List */}
            {services.length === 0 ? (
              <div className="muted">No services yet.</div>
            ) : (
              <div className="services-list">
                {services.map((service, idx) => (
                  <div key={service.id} className="service-item">
                    <div className="service-number">{idx + 1}.</div>
                    <div className="service-main">
                      {service.image_url && (
                        <div className="service-image">
                          <img src={service.image_url} alt={service.service_name} />
                        </div>
                      )}
                      <div className="service-details">
                        <h4 className="service-name">{service.service_name}</h4>
                        <p className="service-description">{service.description}</p>
                        <div className="service-price">
                          <strong>Price:</strong> ${parseFloat(service.price).toFixed(2)}
                        </div>
                      </div>
                      <div className="service-actions">
                        <button className="btn btn-edit" onClick={() => handleEditService(service)}>✎ Edit</button>
                        <button className="btn btn-delete" onClick={() => handleDeleteService(service.id)}>✕ Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
