import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Services.css';

// ===== SERVICES PAGE COMPONENT =====
// This page displays all available salon services
// Users can click on a service to see details in a modal and book it

const Services = () => {
  // Hook to navigate to different pages
  const navigate = useNavigate();

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('token');

  // Get user data from localStorage
  const user = localStorage.getItem('user') 
    ? JSON.parse(localStorage.getItem('user')) 
    : null;

  // Show/hide service details modal
  const [showModal, setShowModal] = useState(false);

  // Store selected service for modal display
  const [selectedService, setSelectedService] = useState(null);

  // Store booking date and time
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
  });

  // ===== HARDCODED SERVICES DATA =====
  // List of all salon services with details
  const services = [
    {
      id: 1,
      name: 'Basic Haircut',
      category: 'Hair',
      price: 30,
      duration: '30 mins',
      description: 'Professional haircut with basic styling',
      icon: '✂️',
    },
    {
      id: 2,
      name: 'Hair Coloring',
      category: 'Hair',
      price: 75,
      duration: '2 hours',
      description: 'Full hair color with premium products',
      icon: '🎨',
    },
    {
      id: 3,
      name: 'Hair Styling',
      category: 'Hair',
      price: 50,
      duration: '1 hour',
      description: 'Professional styling for special occasions',
      icon: '💇‍♀️',
    },
    {
      id: 4,
      name: 'Manicure',
      category: 'Nails',
      price: 25,
      duration: '45 mins',
      description: 'Professional manicure with nail art options',
      icon: '💅',
    },
    {
      id: 5,
      name: 'Pedicure',
      category: 'Nails',
      price: 30,
      duration: '1 hour',
      description: 'Relaxing pedicure with spa treatment',
      icon: '👣',
    },
    {
      id: 6,
      name: 'Nail Art Design',
      category: 'Nails',
      price: 40,
      duration: '1 hour',
      description: 'Custom nail art design with premium finishes',
      icon: '✨',
    },
    {
      id: 7,
      name: 'Makeup Application',
      category: 'Makeup',
      price: 60,
      duration: '1 hour',
      description: 'Professional makeup for any occasion',
      icon: '💄',
    },
    {
      id: 8,
      name: 'Bridal Makeup',
      category: 'Makeup',
      price: 120,
      duration: '2 hours',
      description: 'Complete bridal makeup package with trials',
      icon: '👰',
    },
    {
      id: 9,
      name: 'Facial Treatment',
      category: 'Facials',
      price: 55,
      duration: '1 hour',
      description: 'Professional facial with premium skincare',
      icon: '🧖‍♀️',
    },
    {
      id: 10,
      name: 'Deep Cleansing Facial',
      category: 'Facials',
      price: 75,
      duration: '1.5 hours',
      description: 'Deep cleanse with extractions and mask',
      icon: '✨',
    },
    {
      id: 11,
      name: 'Full Body Massage',
      category: 'Massage',
      price: 80,
      duration: '1 hour',
      description: 'Relaxing full body massage with oils',
      icon: '💆‍♂️',
    },
    {
      id: 12,
      name: 'Head & Neck Massage',
      category: 'Massage',
      price: 45,
      duration: '45 mins',
      description: 'Therapeutic head and neck massage',
      icon: '🧘‍♀️',
    },
  ];

  // ===== HANDLE SERVICE CLICK =====
  // When user clicks on a service, open modal with details
  const handleServiceClick = (service) => {
    if (!isLoggedIn) {
      // If not logged in, redirect to login
      navigate('/auth');
      return;
    }
    // Show modal with service details
    setSelectedService(service);
    setShowModal(true);
  };

  // ===== HANDLE BOOKING =====
  // When user clicks book in modal, save booking to localStorage
  const handleBooking = () => {
    if (!bookingData.date || !bookingData.time) {
      alert('Please select both date and time');
      return;
    }

    // Get existing bookings from localStorage
    let bookings = localStorage.getItem('bookings')
      ? JSON.parse(localStorage.getItem('bookings'))
      : [];

    // Create new booking object
    const newBooking = {
      id: Date.now(), // Unique ID based on timestamp
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      price: selectedService.price,
      date: bookingData.date,
      time: bookingData.time,
      duration: selectedService.duration,
      bookedAt: new Date().toLocaleDateString(),
    };

    // Add booking to array
    bookings.push(newBooking);

    // Save back to localStorage
    localStorage.setItem('bookings', JSON.stringify(bookings));

    // Show success message
    alert(`✅ Booking confirmed! Service: ${selectedService.name} on ${bookingData.date} at ${bookingData.time}`);

    // Reset modal
    setShowModal(false);
    setBookingData({ date: '', time: '' });
    setSelectedService(null);
  };

  // ===== GET AVAILABLE TIMES =====
  // Generate time slots for the day
  const generateTimeSlots = () => {
    const times = [];
    for (let i = 10; i < 18; i++) {
      times.push(`${i.toString().padStart(2, '0')}:00`);
      times.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return times;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="services-page">
      {/* Header section */}
      <div className="services-header">
        <h1>Our Services</h1>
        <p>Discover our complete range of professional salon services</p>
      </div>

      {/* Services grid */}
      <div className="services-container">
        <div className="services-grid">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="service-item"
              onClick={() => handleServiceClick(service)}
            >
              <div className="service-icon-large">{service.icon}</div>
              <h3>{service.name}</h3>
              <p className="service-category">{service.category}</p>
              <p className="service-description">{service.description}</p>
              <div className="service-details">
                <span className="service-price">${service.price}</span>
                <span className="service-duration">{service.duration}</span>
              </div>
              <button className="book-btn">Book Now</button>
            </div>
          ))}
        </div>
      </div>

      {/* Service Details Modal */}
      {showModal && selectedService && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button 
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            {/* Modal header */}
            <div className="modal-header">
              <div className="modal-icon">{selectedService.icon}</div>
              <h2>{selectedService.name}</h2>
              <p className="modal-category">{selectedService.category}</p>
            </div>

            {/* Modal body */}
            <div className="modal-body">
              <div className="service-info">
                <div className="info-row">
                  <span className="info-label">Description:</span>
                  <span className="info-value">{selectedService.description}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Duration:</span>
                  <span className="info-value">{selectedService.duration}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Price:</span>
                  <span className="info-value price">${selectedService.price}</span>
                </div>
              </div>

              {/* Booking form */}
              <div className="booking-form">
                <h3>Select Date & Time</h3>
                
                {/* Date input */}
                <div className="form-group">
                  <label htmlFor="booking-date">Date:</label>
                  <input
                    type="date"
                    id="booking-date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      date: e.target.value
                    })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Time input */}
                <div className="form-group">
                  <label htmlFor="booking-time">Time:</label>
                  <select
                    id="booking-time"
                    value={bookingData.time}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      time: e.target.value
                    })}
                  >
                    <option value="">-- Select Time --</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                {/* User info preview */}
                <div className="user-info">
                  <p><strong>Booking for:</strong> {user?.name}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={handleBooking}
              >
                ✓ Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
