import React from 'react';
import './Gallery.css';

// ===== GALLERY COMPONENT =====
// This page displays a gallery of salon services and team work
// Shows before/after transformations and team photos

const Gallery = () => {
  // Hardcoded gallery images with categories
  const galleryItems = [
    { id: 1, category: 'Hair', title: 'Modern Haircut', emoji: '✂️' },
    { id: 2, category: 'Hair', title: 'Color Treatment', emoji: '🎨' },
    { id: 3, category: 'Hair', title: 'Styling', emoji: '💇‍♀️' },
    { id: 4, category: 'Hair', title: 'Hair Extensions', emoji: '✨' },
    { id: 5, category: 'Nails', title: 'Manicure Design', emoji: '💅' },
    { id: 6, category: 'Nails', title: 'Pedicure Art', emoji: '👣' },
    { id: 7, category: 'Nails', title: 'Nail Art', emoji: '🎨' },
    { id: 8, category: 'Nails', title: 'Gel Nails', emoji: '✨' },
    { id: 9, category: 'Makeup', title: 'Bridal Makeup', emoji: '👰' },
    { id: 10, category: 'Makeup', title: 'Party Makeup', emoji: '💄' },
    { id: 11, category: 'Makeup', title: 'Makeup Artist', emoji: '🎭' },
    { id: 12, category: 'Makeup', title: 'Eye Makeup', emoji: '👁️' },
    { id: 13, category: 'Facials', title: 'Facial Treatment', emoji: '🧖‍♀️' },
    { id: 14, category: 'Facials', title: 'Skin Glow', emoji: '✨' },
    { id: 15, category: 'Facials', title: 'Spa Facial', emoji: '💆‍♀️' },
    { id: 16, category: 'Massage', title: 'Relaxation Massage', emoji: '💆‍♂️' },
  ];

  // State for filter
  const [filter, setFilter] = React.useState('All');

  // Get filtered items
  const filteredItems = filter === 'All' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === filter);

  // Get unique categories
  const categories = ['All', ...new Set(galleryItems.map(item => item.category))];

  return (
    <div className="gallery-page">
      {/* Header */}
      <div className="gallery-header">
        <h1>Our Gallery</h1>
        <p>Explore our salon's beautiful transformations and services</p>
      </div>

      {/* Filter buttons */}
      <div className="gallery-filters">
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-btn ${filter === category ? 'active' : ''}`}
            onClick={() => setFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      <div className="gallery-container">
        <div className="gallery-grid">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="gallery-item"
            >
              <div className="gallery-image">
                <span>{item.emoji}</span>
              </div>
              <div className="gallery-info">
                <p className="gallery-category">{item.category}</p>
                <h3>{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats section */}
      <section className="gallery-stats">
        <h2>Why Our Gallery Matters</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">5000+</span>
            <p>Happy Clients</p>
          </div>
          <div className="stat-card">
            <span className="stat-number">1000+</span>
            <p>Transformations</p>
          </div>
          <div className="stat-card">
            <span className="stat-number">15+</span>
            <p>Expert Professionals</p>
          </div>
          <div className="stat-card">
            <span className="stat-number">4.9★</span>
            <p>Average Rating</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
