import React from 'react';
import './Profile.css';

const Profile = () => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

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
      </div>
    </div>
  );
};

export default Profile;
