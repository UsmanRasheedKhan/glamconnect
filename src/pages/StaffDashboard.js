import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContainer';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { showSuccess, showWarning, showInfo } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Sample staff data (in production, this would come from authentication)
  const staffMember = {
    id: 1,
    employee_id: 'EMP001',
    full_name: 'Maria Santos',
    email: 'maria@glamconnect.com',
    role: 'stylist',
    specialization: 'Hair Coloring & Styling',
    profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    rating: 4.9,
    total_services: 342
  };

  // Sample today's appointments
  const todayAppointments = [
    { id: 1, time: '10:00 AM', customer: 'Sarah Ahmed', service: 'Hair Coloring', status: 'confirmed', duration: '2 hours' },
    { id: 2, time: '12:30 PM', customer: 'Hina Khan', service: 'Haircut & Style', status: 'confirmed', duration: '1 hour' },
    { id: 3, time: '02:00 PM', customer: 'Ayesha Malik', service: 'Hair Treatment', status: 'pending', duration: '1.5 hours' },
    { id: 4, time: '04:00 PM', customer: 'Fatima Ali', service: 'Balayage', status: 'confirmed', duration: '3 hours' },
  ];

  // Sample weekly stats
  const weeklyStats = {
    completed: 18,
    upcoming: 12,
    cancelled: 2,
    earnings: 45000
  };

  // Sample notifications
  const notifications = [
    { id: 1, type: 'booking', message: 'New appointment booked for tomorrow at 11:00 AM', time: '5 mins ago' },
    { id: 2, type: 'reminder', message: 'Staff meeting scheduled for Friday at 9:00 AM', time: '1 hour ago' },
    { id: 3, type: 'review', message: 'You received a 5-star review from Sarah Ahmed!', time: '2 hours ago' },
  ];

  // Check for staff authentication
  const staffToken = localStorage.getItem('staffToken');
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // For demo purposes, allow access without token
  // In production, uncomment the authentication check below
  /*
  if (!staffToken) {
    return (
      <div className="staff-dashboard">
        <div className="staff-access-denied">
          <div className="access-icon">🔐</div>
          <h2>Staff Login Required</h2>
          <p>Please login with your staff credentials to access this dashboard.</p>
          <button className="staff-login-btn" onClick={() => navigate('/staff-auth')}>
            Go to Staff Login
          </button>
        </div>
      </div>
    );
  }
  */

  const handleClockIn = () => {
    showSuccess('Clocked in successfully! Have a great day!');
  };

  const handleClockOut = () => {
    showInfo('Clocked out. See you next time!');
  };

  const handleStartService = (appointment) => {
    showSuccess(`Started service: ${appointment.service} for ${appointment.customer}`);
  };

  const handleCompleteService = (appointment) => {
    showSuccess(`Completed service for ${appointment.customer}. Great job!`);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="staff-dashboard">
      {/* Header Section */}
      <div className="staff-header">
        <div className="staff-welcome">
          <img src={staffMember.profile_image} alt={staffMember.full_name} className="staff-avatar" />
          <div className="welcome-text">
            <h1>Welcome back, {staffMember.full_name.split(' ')[0]}!</h1>
            <p>{formatDate(currentTime)} • {formatTime(currentTime)}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="clock-btn clock-in" onClick={handleClockIn}>
            ⏰ Clock In
          </button>
          <button className="clock-btn clock-out" onClick={handleClockOut}>
            🏠 Clock Out
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat">
          <span className="stat-icon">✅</span>
          <div className="stat-details">
            <span className="stat-number">{weeklyStats.completed}</span>
            <span className="stat-text">Completed</span>
          </div>
        </div>
        <div className="quick-stat">
          <span className="stat-icon">📅</span>
          <div className="stat-details">
            <span className="stat-number">{weeklyStats.upcoming}</span>
            <span className="stat-text">Upcoming</span>
          </div>
        </div>
        <div className="quick-stat">
          <span className="stat-icon">⭐</span>
          <div className="stat-details">
            <span className="stat-number">{staffMember.rating}</span>
            <span className="stat-text">Rating</span>
          </div>
        </div>
        <div className="quick-stat highlight">
          <span className="stat-icon">💰</span>
          <div className="stat-details">
            <span className="stat-number">Rs {weeklyStats.earnings.toLocaleString()}</span>
            <span className="stat-text">This Week</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="staff-tabs">
        <button className={`staff-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          📊 Overview
        </button>
        <button className={`staff-tab ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
          📅 My Appointments
        </button>
        <button className={`staff-tab ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
          🗓️ My Schedule
        </button>
        <button className={`staff-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          👤 Profile
        </button>
      </div>

      {/* Tab Content */}
      <div className="staff-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              {/* Today's Schedule Card */}
              <div className="overview-card today-schedule">
                <div className="card-header">
                  <h3>📋 Today's Schedule</h3>
                  <span className="badge">{todayAppointments.length} appointments</span>
                </div>
                <div className="appointments-list">
                  {todayAppointments.map((apt) => (
                    <div key={apt.id} className={`appointment-item ${apt.status}`}>
                      <div className="apt-time">{apt.time}</div>
                      <div className="apt-details">
                        <strong>{apt.customer}</strong>
                        <span>{apt.service} • {apt.duration}</span>
                      </div>
                      <div className={`apt-status ${apt.status}`}>{apt.status}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications Card */}
              <div className="overview-card notifications-card">
                <div className="card-header">
                  <h3>🔔 Notifications</h3>
                  <span className="badge">{notifications.length} new</span>
                </div>
                <div className="notifications-list">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`notification-item ${notif.type}`}>
                      <div className="notif-icon">
                        {notif.type === 'booking' && '📅'}
                        {notif.type === 'reminder' && '⏰'}
                        {notif.type === 'review' && '⭐'}
                      </div>
                      <div className="notif-content">
                        <p>{notif.message}</p>
                        <span className="notif-time">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Card */}
              <div className="overview-card performance-card">
                <div className="card-header">
                  <h3>📈 This Week's Performance</h3>
                </div>
                <div className="performance-stats">
                  <div className="perf-stat">
                    <div className="perf-bar" style={{ '--percentage': '90%' }}></div>
                    <span className="perf-label">Attendance</span>
                    <span className="perf-value">90%</span>
                  </div>
                  <div className="perf-stat">
                    <div className="perf-bar" style={{ '--percentage': '95%' }}></div>
                    <span className="perf-label">On-Time</span>
                    <span className="perf-value">95%</span>
                  </div>
                  <div className="perf-stat">
                    <div className="perf-bar" style={{ '--percentage': '98%' }}></div>
                    <span className="perf-label">Satisfaction</span>
                    <span className="perf-value">98%</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="overview-card quick-actions-card">
                <div className="card-header">
                  <h3>⚡ Quick Actions</h3>
                </div>
                <div className="actions-grid">
                  <button className="action-btn" onClick={() => showInfo('Request submitted!')}>
                    <span>📝</span>
                    <span>Request Leave</span>
                  </button>
                  <button className="action-btn" onClick={() => showInfo('Coming soon!')}>
                    <span>📊</span>
                    <span>View Reports</span>
                  </button>
                  <button className="action-btn" onClick={() => showInfo('Coming soon!')}>
                    <span>💬</span>
                    <span>Messages</span>
                  </button>
                  <button className="action-btn" onClick={() => showInfo('Coming soon!')}>
                    <span>📚</span>
                    <span>Training</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="appointments-tab">
            <div className="tab-header">
              <h3>My Appointments</h3>
              <div className="filter-buttons">
                <button className="filter-btn active">Today</button>
                <button className="filter-btn">This Week</button>
                <button className="filter-btn">This Month</button>
              </div>
            </div>
            <div className="appointments-full-list">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="appointment-card">
                  <div className="apt-card-header">
                    <span className="apt-card-time">{apt.time}</span>
                    <span className={`apt-card-status ${apt.status}`}>{apt.status}</span>
                  </div>
                  <div className="apt-card-body">
                    <h4>{apt.customer}</h4>
                    <p className="apt-service">{apt.service}</p>
                    <p className="apt-duration">⏱️ Duration: {apt.duration}</p>
                  </div>
                  <div className="apt-card-actions">
                    <button className="apt-btn start" onClick={() => handleStartService(apt)}>
                      ▶️ Start
                    </button>
                    <button className="apt-btn complete" onClick={() => handleCompleteService(apt)}>
                      ✅ Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="schedule-tab">
            <div className="tab-header">
              <h3>My Weekly Schedule</h3>
            </div>
            <div className="schedule-grid">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => (
                <div key={day} className={`schedule-day ${idx === 6 ? 'off' : ''}`}>
                  <div className="day-header">
                    <span className="day-name">{day}</span>
                    {idx === 6 ? (
                      <span className="day-status off">Day Off</span>
                    ) : (
                      <span className="day-status">Working</span>
                    )}
                  </div>
                  <div className="day-hours">
                    {idx === 6 ? (
                      <span className="off-text">Enjoy your day off! 🌴</span>
                    ) : idx === 5 ? (
                      <span>10:00 AM - 4:00 PM</span>
                    ) : (
                      <span>9:00 AM - 6:00 PM</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="schedule-actions">
              <button className="schedule-btn" onClick={() => showInfo('Request submitted to admin!')}>
                📝 Request Schedule Change
              </button>
              <button className="schedule-btn" onClick={() => showInfo('Swap request sent!')}>
                🔄 Request Day Swap
              </button>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-tab">
            <div className="profile-header">
              <img src={staffMember.profile_image} alt={staffMember.full_name} className="profile-avatar" />
              <div className="profile-info">
                <h2>{staffMember.full_name}</h2>
                <span className="employee-id">{staffMember.employee_id}</span>
                <span className="role-badge">{staffMember.role}</span>
              </div>
            </div>
            <div className="profile-details">
              <div className="detail-section">
                <h4>📧 Contact Information</h4>
                <p><strong>Email:</strong> {staffMember.email}</p>
                <p><strong>Phone:</strong> +92 300 123 4001</p>
              </div>
              <div className="detail-section">
                <h4>💼 Professional Details</h4>
                <p><strong>Specialization:</strong> {staffMember.specialization}</p>
                <p><strong>Total Services:</strong> {staffMember.total_services}</p>
                <p><strong>Rating:</strong> ⭐ {staffMember.rating}/5.0</p>
              </div>
              <div className="detail-section">
                <h4>📊 Statistics</h4>
                <p><strong>This Month:</strong> 72 services completed</p>
                <p><strong>Customer Satisfaction:</strong> 98%</p>
                <p><strong>Attendance:</strong> 95%</p>
              </div>
            </div>
            <div className="profile-actions">
              <button className="profile-btn" onClick={() => showInfo('Edit profile feature coming soon!')}>
                ✏️ Edit Profile
              </button>
              <button className="profile-btn" onClick={() => showInfo('Password change feature coming soon!')}>
                🔐 Change Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
