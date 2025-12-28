import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { useToast } from '../components/ToastContainer';
import './Services.css';

const Services = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const isLoggedIn = !!localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookingData, setBookingData] = useState({ date: '', time: '', notes: '' });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch services from database
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const resp = await axios.post('', { action: 'getServices' });
      console.log('Services API Response:', resp.data);
      
      if (resp.data && resp.data.success) {
        const dbServices = resp.data.services || [];
        console.log('Database services:', dbServices);
        
        // Map database services to UI format - show all active services
        const mappedServices = dbServices
          .filter(s => {
            // Accept if is_active is 1, '1', true, or undefined (for backwards compatibility)
            const isActive = s.is_active === 1 || s.is_active === '1' || s.is_active === true || s.is_active === undefined;
            console.log(`Service ${s.service_name}: is_active=${s.is_active}, showing=${isActive}`);
            return isActive;
          })
          .map(service => ({
            id: service.id,
            name: service.service_name,
            category: service.category || 'Hair',
            price: parseFloat(service.price),
            duration: service.duration || '30 mins',
            description: service.description,
            image: service.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop',
            rating: 4.8, // Default rating since it's not in DB
            reviews: Math.floor(Math.random() * 200) + 20, // Random reviews for now
          }));
        
        console.log('Mapped services to display:', mappedServices);
        setServices(mappedServices);
        
        if (mappedServices.length === 0) {
          showWarning('No active services found. Please add services in admin panel.');
        }
      } else {
        console.error('API returned success=false:', resp.data);
        showWarning('No services available');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      console.error('Error details:', err.response?.data || err.message);
      showError('Failed to load services: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Hair', 'Nails', 'Makeup', 'Skincare', 'Spa'];
  
  const filteredServices = activeCategory === 'All' 
    ? services 
    : services.filter(s => s.category === activeCategory);

  const handleServiceClick = (service) => {
    // Allow both regular users and admin users to book
    const hasToken = !!localStorage.getItem('token') || !!localStorage.getItem('adminToken');
    if (!hasToken) {
      navigate('/auth');
      return;
    }
    setSelectedService(service);
    setShowModal(true);
  };

  const handleBooking = async () => {
    if (!bookingData.date || !bookingData.time) {
      showWarning('Please select both date and time');
      return;
    }

    try {
      // Support both regular users and admin users
      let userId = null;
      if (user && user.userID) {
        userId = user.userID;
      } else if (user && user.id) {
        // Admin users have 'id' instead of 'userID'
        userId = user.id;
      }

      if (!userId) {
        showError('Please login again to continue');
        return;
      }

      const payload = {
        action: 'createBooking',
        userID: userId,
        serviceId: selectedService.id,
        date: bookingData.date,
        time: bookingData.time,
        notes: bookingData.notes || ''
      };

      const resp = await axios.post('', payload);
      if (resp.data && resp.data.success) {
        showSuccess(`Booking confirmed for ${selectedService.name}!`);
        setShowModal(false);
        setBookingData({ date: '', time: '', notes: '' });
        setSelectedService(null);
      } else {
        showError(resp.data?.message || 'Failed to create booking');
      }
    } catch (err) {
      showError('Network error. Please try again.');
    }
  };

  const generateTimeSlots = () => {
    const times = [];
    for (let i = 9; i <= 20; i++) {
      times.push(`${i.toString().padStart(2, '0')}:00`);
      if (i < 20) times.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return times;
  };

  return (
    <div className="services-page">
      {/* Hero Header */}
      <div className="services-hero">
        <div className="services-hero-overlay"></div>
        <div className="services-hero-content">
          <span className="services-hero-badge">Premium Services</span>
          <h1>Our Services</h1>
          <p>Discover our premium range of beauty and wellness services tailored just for you</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter-section">
        <div className="category-container">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'All' && '✨'} 
              {cat === 'Hair' && '💇‍♀️'} 
              {cat === 'Nails' && '💅'} 
              {cat === 'Makeup' && '💄'} 
              {cat === 'Skincare' && '🧴'} 
              {cat === 'Spa' && '🧖‍♀️'} 
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="services-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="no-services">
            <p>No services available in this category</p>
          </div>
        ) : (
          <div className="services-grid">
          {filteredServices.map((service) => (
            <div key={service.id} className="service-card">
              {/* Service Image */}
              <div className="service-image-wrapper">
                <img 
                  src={service.image} 
                  alt={service.name}
                  className="service-image"
                  loading="lazy"
                />
                <div className="service-category-tag">{service.category}</div>
                {service.rating >= 4.9 && (
                  <div className="service-popular-tag">⭐ Popular</div>
                )}
              </div>

              {/* Service Content */}
              <div className="service-content">
                <div className="service-header">
                  <h3 className="service-name">{service.name}</h3>
                  <div className="service-rating">
                    <span className="rating-star">★</span>
                    <span className="rating-value">{service.rating}</span>
                    <span className="rating-count">({service.reviews})</span>
                  </div>
                </div>

                <p className="service-description">{service.description}</p>

                <div className="service-meta">
                  <div className="meta-item">
                    <span className="meta-icon">⏱️</span>
                    <span>{service.duration}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📍</span>
                    <span>In-Salon</span>
                  </div>
                </div>

                <div className="service-footer">
                  <div className="service-price">
                    <span className="price-label">Starting from</span>
                    <span className="price-value">Rs {service.price.toLocaleString()}</span>
                  </div>
                  <button 
                    className="book-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServiceClick(service);
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && selectedService && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>×</button>
            
            <div className="modal-image-section">
              <img src={selectedService.image} alt={selectedService.name} />
              <div className="modal-image-overlay">
                <span className="modal-category-badge">{selectedService.category}</span>
              </div>
            </div>

            <div className="modal-content-section">
              <div className="modal-header">
                <h2>{selectedService.name}</h2>
                <div className="modal-rating">
                  <span className="star">★</span> 
                  <span>{selectedService.rating}</span>
                  <span className="reviews">({selectedService.reviews} reviews)</span>
                </div>
              </div>

              <p className="modal-description">{selectedService.description}</p>

              <div className="modal-details-grid">
                <div className="detail-card">
                  <span className="detail-icon">⏱️</span>
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">{selectedService.duration}</span>
                </div>
                <div className="detail-card">
                  <span className="detail-icon">📍</span>
                  <span className="detail-label">Location</span>
                  <span className="detail-value">In-Salon</span>
                </div>
                <div className="detail-card highlight">
                  <span className="detail-icon">💰</span>
                  <span className="detail-label">Price</span>
                  <span className="detail-value">Rs {selectedService.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="booking-form-section">
                <h3>📅 Schedule Your Appointment</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Select Date</label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label>Select Time</label>
                    <select
                      value={bookingData.time}
                      onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                    >
                      <option value="">Choose a time slot</option>
                      {generateTimeSlots().map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Special Requests (Optional)</label>
                  <textarea
                    placeholder="Any specific preferences or requirements..."
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>

              <div className="booking-summary">
                <div className="summary-item">
                  <span>Service</span>
                  <span>{selectedService.name}</span>
                </div>
                <div className="summary-item">
                  <span>Duration</span>
                  <span>{selectedService.duration}</span>
                </div>
                <div className="summary-item total">
                  <span>Total Amount</span>
                  <span>Rs {selectedService.price.toLocaleString()}</span>
                </div>
              </div>

              <button className="confirm-btn" onClick={handleBooking}>
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
