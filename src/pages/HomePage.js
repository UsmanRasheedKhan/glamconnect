import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';

// ===== HOME PAGE COMPONENT =====
// This is the main landing page users see when they visit the website
// It has hero section, featured services, testimonials, and call-to-action

const HomePage = () => {
  // Hook to navigate to different pages
  const navigate = useNavigate();

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('token');

  // ===== HANDLE BROWSE SERVICES =====
  // If user is logged in, go to services page
  // If not, redirect to login first
  const handleBrowseServices = () => {
    if (isLoggedIn) {
      navigate('/services');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="home-page">
      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        {/* background visual area (image / illustration) */}
        <div className="hero-bg" aria-hidden="true">
          {/* currently decorative — can be replaced with an <img> or background-image */}
          <div className="hero-visual">💇‍♀️</div>
        </div>

        {/* central glass card with title and CTA */}
        <div className="hero-card">
          <h1 className="hero-title"><span className="script-font">Glam</span>Connect</h1>
          <p className="hero-subtitle">Luxury Unisex Salon & Wellness</p>
          <p className="hero-description">
            Discover luxury beauty and wellness services tailored to your unique style.
          </p>
          <div className="hero-cta">
            <button className="hero-btn" onClick={handleBrowseServices}>
              ✨ Explore Services
            </button>
            <Link to="/contact" className="hero-secondary">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURED SERVICES SECTION ===== */}
      {/* Quick preview of popular services */}
      <section className="featured-services">
        <h2 className="section-title">Our Featured Services</h2>
        <div className="services-grid">
          {/* Service 1: Hair Styling */}
          <div className="service-card">
            <div className="service-icon">💇‍♀️</div>
            <h3>Hair Styling</h3>
            <p>Professional haircuts and styling for all hair types</p>
            <Link to="/services" className="service-link">
              View Services →
            </Link>
          </div>

          {/* Service 2: Nail Care */}
          <div className="service-card">
            <div className="service-icon">💅</div>
            <h3>Nail Care</h3>
            <p>Manicures, pedicures, and nail art designs</p>
            <Link to="/services" className="service-link">
              View Services →
            </Link>
          </div>

          {/* Service 3: Makeup */}
          <div className="service-card">
            <div className="service-icon">💄</div>
            <h3>Makeup & Facials</h3>
            <p>Makeup application and professional facials</p>
            <Link to="/services" className="service-link">
              View Services →
            </Link>
          </div>

          {/* Service 4: Massage & Spa */}
          <div className="service-card">
            <div className="service-icon">🧖‍♀️</div>
            <h3>Massage & Spa</h3>
            <p>Relaxing massages and spa treatments</p>
            <Link to="/services" className="service-link">
              View Services →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US SECTION ===== */}
      {/* Highlights of what makes our salon special */}
      <section className="why-choose-us">
        <h2 className="section-title">Why Choose GlamConnect?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">⭐</div>
            <h3>Expert Professionals</h3>
            <p>Highly trained and certified beauty experts</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🌿</div>
            <h3>Premium Products</h3>
            <p>Using only high-quality and organic products</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">💆</div>
            <h3>Personalized Service</h3>
            <p>Customized treatments for your unique needs</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🎯</div>
            <h3>Best Prices</h3>
            <p>Affordable luxury beauty services</p>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      {/* Happy customers share their experiences */}
      <section className="testimonials">
        <h2 className="section-title">What Our Clients Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-header">
              <div className="testimonial-avatar">A</div>
              <div>
                <p className="testimonial-name">Amira Khan</p>
                <p className="testimonial-title">Happy Customer</p>
              </div>
            </div>
            <p className="testimonial-text">
              "GlamConnect gave me the best haircut I've ever had. The staff is so professional and friendly!"
            </p>
            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-header">
              <div className="testimonial-avatar">R</div>
              <div>
                <p className="testimonial-name">Ravi Singh</p>
                <p className="testimonial-title">Loyal Client</p>
              </div>
            </div>
            <p className="testimonial-text">
              "The spa services at GlamConnect are absolutely amazing. I feel so relaxed and rejuvenated!"
            </p>
            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-header">
              <div className="testimonial-avatar">S</div>
              <div>
                <p className="testimonial-name">Sarah Ahmed</p>
                <p className="testimonial-title">Regular Client</p>
              </div>
            </div>
            <p className="testimonial-text">
              "Love the makeup artistry services! The team is so skilled and creative. Highly recommended!"
            </p>
            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
          </div>
        </div>
      </section>

      {/* ===== CALL TO ACTION SECTION ===== */}
      {/* Final push to get users to book a service */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Glow?</h2>
          <p>Book your appointment today and experience luxury beauty like never before!</p>
          <button className="cta-btn" onClick={handleBrowseServices}>
            🎯 Book Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
