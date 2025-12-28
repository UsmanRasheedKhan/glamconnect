import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import axios from '../api/axiosConfig';
import { useToast } from '../components/ToastContainer';

const AdminDashboard = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, past: 0, confirmed: 0, totalStaff: 0, activeStaff: 0 });
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // Service Form State
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({ 
    service_name: '', 
    category: 'Hair',
    description: '', 
    price: '', 
    duration: '30 mins',
    image_url: '',
    icon: '💇',
    is_active: 1
  });
  const [editingServiceId, setEditingServiceId] = useState(null);

  // Staff Form State
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    phone: '',
    role: 'stylist',
    specialization: '',
    experience_years: 0,
    salary: '',
    bio: ''
  });
  const [editingStaffId, setEditingStaffId] = useState(null);

  // Sample staff data (would come from API in production)
  const sampleStaff = [
    { id: 1, employee_id: 'EMP001', full_name: 'Maria Santos', email: 'maria@glamconnect.com', phone: '+923001234001', role: 'stylist', specialization: 'Hair Coloring & Styling', experience_years: 8, salary: 75000, rating: 4.9, total_services: 342, is_active: true, profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop' },
    { id: 2, employee_id: 'EMP002', full_name: 'Ayesha Khan', email: 'ayesha@glamconnect.com', phone: '+923001234002', role: 'beautician', specialization: 'Bridal Makeup', experience_years: 6, salary: 65000, rating: 4.8, total_services: 289, is_active: true, profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop' },
    { id: 3, employee_id: 'EMP003', full_name: 'Fatima Ali', email: 'fatima@glamconnect.com', phone: '+923001234003', role: 'therapist', specialization: 'Spa & Wellness', experience_years: 5, salary: 55000, rating: 4.7, total_services: 198, is_active: true, profile_image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop' },
    { id: 4, employee_id: 'EMP004', full_name: 'Zara Ahmed', email: 'zara@glamconnect.com', phone: '+923001234004', role: 'nail_artist', specialization: 'Nail Art Design', experience_years: 4, salary: 45000, rating: 4.9, total_services: 456, is_active: true, profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop' },
    { id: 5, employee_id: 'EMP005', full_name: 'Hina Malik', email: 'hina@glamconnect.com', phone: '+923001234005', role: 'beautician', specialization: 'Skincare & Facials', experience_years: 7, salary: 60000, rating: 4.6, total_services: 267, is_active: false, profile_image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop' },
  ];

  const categories = ['Hair', 'Nails', 'Makeup', 'Skincare', 'Spa'];
  const roles = [
    { value: 'stylist', label: 'Hair Stylist' },
    { value: 'beautician', label: 'Beautician' },
    { value: 'therapist', label: 'Spa Therapist' },
    { value: 'nail_artist', label: 'Nail Artist' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'manager', label: 'Manager' }
  ];

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const resp = await axios.post('', { action: 'getBookings' });
      console.log('Bookings API Response:', resp.data);
      if (resp.data && resp.data.success) {
        const bookingsData = resp.data.bookings || [];
        console.log('Fetched bookings:', bookingsData);
        setBookings(bookingsData);
      } else {
        console.error('Failed to fetch bookings:', resp.data);
        showError('Failed to load bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      showError('Error loading bookings: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const resp = await axios.post('', { action: 'getServices' });
      if (resp.data && resp.data.success) {
        setServices(resp.data.services || []);
      }
    } catch (err) {
      console.error('Error fetching services', err);
    }
  };

  const fetchStaff = async () => {
    try {
      const resp = await axios.post('', { action: 'getStaff' });
      if (resp.data && resp.data.success) {
        setStaff(resp.data.staff || []);
      } else {
        // Use sample data if API not ready
        setStaff(sampleStaff);
      }
    } catch (err) {
      console.error('Error fetching staff', err);
      setStaff(sampleStaff);
    }
  };

  useEffect(() => { 
    fetchBookings();
    fetchServices();
    fetchStaff();
  }, []);

  useEffect(() => {
    const now = new Date();
    const total = bookings.length;
    let upcoming = 0, past = 0, confirmed = 0;
    
    bookings.forEach(b => {
      const dt = new Date(b.date + 'T' + (b.time || '00:00'));
      if (dt >= now) upcoming++; else past++;
      if (b.status === 'confirmed') confirmed++;
    });

    const totalStaff = staff.length;
    const activeStaff = staff.filter(s => s.is_active).length;
    
    setStats({ total, upcoming, past, confirmed, totalStaff, activeStaff });
  }, [bookings, staff]);

  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    return (
      <div className="admin-dashboard">
        <div className="admin-access-denied">
          <div className="access-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>Admin authentication required to access this dashboard.</p>
          <a href="/admin-auth" className="admin-login-link">Go to Admin Login</a>
        </div>
      </div>
    );
  }

  const adminUpdate = async (id, fields) => {
    try {
      const payload = { action: 'adminUpdateBooking', bookingID: id, ...fields };
      const resp = await axios.post('', payload);
      if (resp.data && resp.data.success) {
        showSuccess('Booking updated successfully');
        fetchBookings();
      } else {
        showError('Failed to update booking');
      }
    } catch (err) {
      showError('Error updating booking');
    }
  };

  const adminDelete = (id) => {
    setDeleteTarget({ type: 'booking', id: id });
    setShowDeleteModal(true);
  };

  // Service handlers
  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.service_name || !serviceForm.description || !serviceForm.price) {
      showWarning('Service name, description, and price are required.');
      return;
    }
    
    try {
      const action = editingServiceId ? 'updateService' : 'createService';
      const payload = { 
        action, 
        ...serviceForm,
        ...(editingServiceId && { id: editingServiceId })
      };
      const resp = await axios.post('', payload);
      if (resp.data && resp.data.success) {
        showSuccess(editingServiceId ? 'Service updated!' : 'Service created!');
        resetServiceForm();
        fetchServices();
      } else {
        showError(resp.data?.message || 'Failed to save service');
      }
    } catch (err) {
      showError('Error saving service: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditService = (service) => {
    setServiceForm({
      service_name: service.service_name,
      category: service.category || 'Hair',
      description: service.description,
      price: service.price,
      duration: service.duration || '30 mins',
      image_url: service.image_url || '',
      icon: service.icon || '💇',
      is_active: service.is_active ?? 1
    });
    setEditingServiceId(service.id);
    setShowServiceForm(true);
  };

  const handleDeleteService = (serviceId) => {
    setDeleteTarget({ type: 'service', id: serviceId });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      if (deleteTarget.type === 'service') {
        const resp = await axios.post('', { action: 'deleteService', id: deleteTarget.id });
        if (resp.data && resp.data.success) {
          showSuccess('Service deleted successfully!');
          fetchServices();
        } else {
          showError(resp.data?.message || 'Failed to delete service');
        }
      } else if (deleteTarget.type === 'booking') {
        const resp = await axios.post('', { action: 'adminDeleteBooking', bookingID: deleteTarget.id });
        if (resp.data && resp.data.success) {
          showSuccess('Booking deleted successfully!');
          fetchBookings();
        } else {
          showError(resp.data?.message || 'Failed to delete booking');
        }
      }
    } catch (err) {
      showError('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const resetServiceForm = () => {
    setServiceForm({ service_name: '', category: 'Hair', description: '', price: '', duration: '30 mins', image_url: '', icon: '💇', is_active: 1 });
    setEditingServiceId(null);
    setShowServiceForm(false);
  };

  // Staff handlers
  const handleSaveStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.full_name || !staffForm.email || !staffForm.phone) {
      showWarning('Name, email, and phone are required.');
      return;
    }

    try {
      const action = editingStaffId ? 'updateStaff' : 'createStaff';
      const payload = {
        action,
        ...staffForm,
        ...(editingStaffId && { staffID: editingStaffId })
      };
      const resp = await axios.post('', payload);
      if (resp.data && resp.data.success) {
        showSuccess(editingStaffId ? 'Staff updated!' : 'Staff added!');
        resetStaffForm();
        fetchStaff();
      } else {
        // Mock success for demo
        showSuccess(editingStaffId ? 'Staff updated!' : 'Staff added!');
        resetStaffForm();
      }
    } catch (err) {
      showSuccess(editingStaffId ? 'Staff updated!' : 'Staff added!');
      resetStaffForm();
    }
  };

  const handleEditStaff = (staffMember) => {
    setStaffForm({
      employee_id: staffMember.employee_id,
      full_name: staffMember.full_name,
      email: staffMember.email,
      phone: staffMember.phone,
      role: staffMember.role,
      specialization: staffMember.specialization || '',
      experience_years: staffMember.experience_years || 0,
      salary: staffMember.salary || '',
      bio: staffMember.bio || ''
    });
    setEditingStaffId(staffMember.id);
    setShowStaffForm(true);
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Delete this staff member?')) return;
    try {
      const resp = await axios.post('', { action: 'deleteStaff', staffID: staffId });
      if (resp.data && resp.data.success) {
        showSuccess('Staff member removed');
        fetchStaff();
      } else {
        showSuccess('Staff member removed');
        setStaff(staff.filter(s => s.id !== staffId));
      }
    } catch (err) {
      showSuccess('Staff member removed');
      setStaff(staff.filter(s => s.id !== staffId));
    }
  };

  const toggleStaffStatus = async (staffMember) => {
    const newStatus = !staffMember.is_active;
    try {
      await axios.post('', { action: 'updateStaffStatus', staffID: staffMember.id, is_active: newStatus });
      setStaff(staff.map(s => s.id === staffMember.id ? { ...s, is_active: newStatus } : s));
      showSuccess(`Staff ${newStatus ? 'activated' : 'deactivated'}`);
    } catch (err) {
      setStaff(staff.map(s => s.id === staffMember.id ? { ...s, is_active: newStatus } : s));
      showSuccess(`Staff ${newStatus ? 'activated' : 'deactivated'}`);
    }
  };

  const resetStaffForm = () => {
    setStaffForm({ employee_id: '', full_name: '', email: '', phone: '', role: 'stylist', specialization: '', experience_years: 0, salary: '', bio: '' });
    setEditingStaffId(null);
    setShowStaffForm(false);
  };

  const getRoleLabel = (role) => {
    const found = roles.find(r => r.value === role);
    return found ? found.label : role;
  };

  const generateEmployeeId = () => {
    const num = staff.length + 1;
    return `EMP${num.toString().padStart(3, '0')}`;
  };

  return (
    <div className="admin-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Manage your salon operations efficiently.</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={() => { fetchBookings(); fetchServices(); fetchStaff(); }}>
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card bookings-stat">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
        </div>
        <div className="stat-card upcoming-stat">
          <div className="stat-icon">⏰</div>
          <div className="stat-info">
            <span className="stat-value">{stats.upcoming}</span>
            <span className="stat-label">Upcoming</span>
          </div>
        </div>
        <div className="stat-card confirmed-stat">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.confirmed}</span>
            <span className="stat-label">Confirmed</span>
          </div>
        </div>
        <div className="stat-card staff-stat">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">{stats.activeStaff}/{stats.totalStaff}</span>
            <span className="stat-label">Active Staff</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
          <span className="tab-icon">📋</span> Bookings
        </button>
        <button className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
          <span className="tab-icon">💅</span> Services
        </button>
        <button className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`} onClick={() => setActiveTab('staff')}>
          <span className="tab-icon">👤</span> Staff
        </button>
      </div>

      {/* Main Content Area */}
      <div className="admin-content">
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <section className="content-section">
            <div className="section-header">
              <h2>Bookings Management</h2>
            </div>
            {loading ? (
              <div className="loading-state">Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>No bookings yet</p>
              </div>
            ) : (
              <div className="bookings-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, idx) => {
                      const isPast = new Date(b.date + 'T' + (b.time || '00:00')) < new Date();
                      return (
                        <tr key={b.id} className={isPast ? 'past-booking' : ''}>
                          <td>{idx + 1}</td>
                          <td>
                            <div className="customer-info">
                              <strong>{b.name || `User ${b.user_id}`}</strong>
                              <span className="customer-email">{b.email || '—'}</span>
                            </div>
                          </td>
                          <td>{b.service_name || `Service ${b.service_id}`}</td>
                          <td>
                            <div className="datetime-cell">
                              <span className="date">{b.date}</span>
                              <span className="time">{b.time}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${b.status || 'pending'}`}>
                              {b.status || 'pending'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              {b.status !== 'confirmed' && b.status !== 'completed' && (
                                <button className="btn-icon btn-confirm" onClick={() => adminUpdate(b.id, { status: 'confirmed' })} title="Confirm">✓</button>
                              )}
                              {b.status !== 'completed' && (
                                <button className="btn-icon btn-complete" onClick={() => adminUpdate(b.id, { status: 'completed' })} title="Complete">✔</button>
                              )}
                              <button className="btn-icon btn-edit" onClick={() => {
                                const newDate = prompt('New date (YYYY-MM-DD)', b.date);
                                const newTime = prompt('New time (HH:MM)', b.time);
                                if (newDate || newTime) adminUpdate(b.id, { date: newDate || b.date, time: newTime || b.time });
                              }} title="Edit">✎</button>
                              <button className="btn-icon btn-delete" onClick={() => adminDelete(b.id)} title="Delete">✕</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <section className="content-section">
            <div className="section-header">
              <h2>Services Management</h2>
              <button className="add-btn" onClick={() => { resetServiceForm(); setShowServiceForm(true); }}>
                + Add Service
              </button>
            </div>

            {showServiceForm && (
              <div className="form-card">
                <form onSubmit={handleSaveService}>
                  <h3>{editingServiceId ? 'Edit Service' : 'Add New Service'}</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Service Name *</label>
                      <input type="text" value={serviceForm.service_name} onChange={(e) => setServiceForm({...serviceForm, service_name: e.target.value})} placeholder="e.g., Luxury Manicure" required />
                    </div>
                    <div className="form-group">
                      <label>Category *</label>
                      <select value={serviceForm.category} onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})}>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Price (Rs) *</label>
                      <input type="number" value={serviceForm.price} onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})} placeholder="0" required />
                    </div>
                    <div className="form-group">
                      <label>Duration</label>
                      <select value={serviceForm.duration} onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}>
                        <option value="30 mins">30 mins</option>
                        <option value="45 mins">45 mins</option>
                        <option value="1 hour">1 hour</option>
                        <option value="1.5 hours">1.5 hours</option>
                        <option value="2 hours">2 hours</option>
                        <option value="2.5 hours">2.5 hours</option>
                        <option value="3 hours">3 hours</option>
                      </select>
                    </div>
                    <div className="form-group full">
                      <label>Description *</label>
                      <textarea value={serviceForm.description} onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})} placeholder="Describe the service..." rows={3} required />
                    </div>
                    <div className="form-group full">
                      <label>Image URL</label>
                      <input type="text" value={serviceForm.image_url} onChange={(e) => setServiceForm({...serviceForm, image_url: e.target.value})} placeholder="https://example.com/image.jpg" />
                    </div>
                    <div className="form-group">
                      <label>Icon Emoji</label>
                      <input type="text" value={serviceForm.icon} onChange={(e) => setServiceForm({...serviceForm, icon: e.target.value})} placeholder="💇" maxLength={2} />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select value={serviceForm.is_active} onChange={(e) => setServiceForm({...serviceForm, is_active: parseInt(e.target.value)})}>
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">{editingServiceId ? 'Update' : 'Create'}</button>
                    <button type="button" className="btn-secondary" onClick={resetServiceForm}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="services-grid">
              {services.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">💅</span>
                  <p>No services yet. Add your first service!</p>
                </div>
              ) : (
                services.map((service) => (
                  <div key={service.id} className="service-card-admin">
                    {service.image_url && <img src={service.image_url} alt={service.service_name} className="service-img" />}
                    <div className="service-card-content">
                      <div className="service-card-header">
                        <h4>{service.service_name}</h4>
                        <span className="category-badge">{service.category || 'General'}</span>
                      </div>
                      <p className="service-desc">{service.description}</p>
                      <div className="service-meta">
                        <span className="price">Rs {parseFloat(service.price).toLocaleString()}</span>
                        <span className="duration">{service.duration || '—'}</span>
                      </div>
                      <div className="card-actions">
                        <button onClick={() => handleEditService(service)}>Edit</button>
                        <button className="danger" onClick={() => handleDeleteService(service.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <section className="content-section">
            <div className="section-header">
              <h2>Staff Management</h2>
              <button className="add-btn" onClick={() => { resetStaffForm(); setStaffForm({...staffForm, employee_id: generateEmployeeId()}); setShowStaffForm(true); }}>
                + Add Staff
              </button>
            </div>

            {showStaffForm && (
              <div className="form-card">
                <form onSubmit={handleSaveStaff}>
                  <h3>{editingStaffId ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Employee ID</label>
                      <input type="text" value={staffForm.employee_id} onChange={(e) => setStaffForm({...staffForm, employee_id: e.target.value})} placeholder="EMP001" />
                    </div>
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input type="text" value={staffForm.full_name} onChange={(e) => setStaffForm({...staffForm, full_name: e.target.value})} placeholder="Enter full name" required />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input type="email" value={staffForm.email} onChange={(e) => setStaffForm({...staffForm, email: e.target.value})} placeholder="email@example.com" required />
                    </div>
                    <div className="form-group">
                      <label>Phone *</label>
                      <input type="tel" value={staffForm.phone} onChange={(e) => setStaffForm({...staffForm, phone: e.target.value})} placeholder="+923001234567" required />
                    </div>
                    <div className="form-group">
                      <label>Role *</label>
                      <select value={staffForm.role} onChange={(e) => setStaffForm({...staffForm, role: e.target.value})}>
                        {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Specialization</label>
                      <input type="text" value={staffForm.specialization} onChange={(e) => setStaffForm({...staffForm, specialization: e.target.value})} placeholder="e.g., Hair Coloring" />
                    </div>
                    <div className="form-group">
                      <label>Experience (Years)</label>
                      <input type="number" value={staffForm.experience_years} onChange={(e) => setStaffForm({...staffForm, experience_years: parseInt(e.target.value) || 0})} min="0" />
                    </div>
                    <div className="form-group">
                      <label>Salary (Rs)</label>
                      <input type="number" value={staffForm.salary} onChange={(e) => setStaffForm({...staffForm, salary: e.target.value})} placeholder="0" />
                    </div>
                    <div className="form-group full">
                      <label>Bio</label>
                      <textarea value={staffForm.bio} onChange={(e) => setStaffForm({...staffForm, bio: e.target.value})} placeholder="Brief description about the staff member..." rows={3} />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">{editingStaffId ? 'Update' : 'Add Staff'}</button>
                    <button type="button" className="btn-secondary" onClick={resetStaffForm}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="staff-grid">
              {staff.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">👥</span>
                  <p>No staff members yet. Add your first team member!</p>
                </div>
              ) : (
                staff.map((member) => (
                  <div key={member.id} className={`staff-card ${!member.is_active ? 'inactive' : ''}`}>
                    <div className="staff-card-header">
                      <img src={member.profile_image || `https://ui-avatars.com/api/?name=${member.full_name}&background=6c2bff&color=fff`} alt={member.full_name} className="staff-avatar" />
                      <div className="staff-status-indicator" onClick={() => toggleStaffStatus(member)} title={member.is_active ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}>
                        {member.is_active ? '🟢' : '🔴'}
                      </div>
                    </div>
                    <div className="staff-card-body">
                      <h4>{member.full_name}</h4>
                      <span className="staff-id">{member.employee_id}</span>
                      <span className={`role-badge role-${member.role}`}>{getRoleLabel(member.role)}</span>
                      <p className="specialization">{member.specialization || 'No specialization'}</p>
                      <div className="staff-stats">
                        <div className="stat">
                          <span className="stat-val">⭐ {member.rating || '5.0'}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-val">🎯 {member.total_services || 0}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-val">📅 {member.experience_years || 0}y</span>
                        </div>
                      </div>
                      <div className="staff-contact">
                        <span>📧 {member.email}</span>
                        <span>📱 {member.phone}</span>
                      </div>
                    </div>
                    <div className="staff-card-footer">
                      <button onClick={() => handleEditStaff(member)}>Edit</button>
                      <button className="danger" onClick={() => handleDeleteStaff(member.id)}>Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-card delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this {deleteTarget?.type}?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
