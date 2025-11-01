import React from 'react';
import { Link } from 'react-router-dom';

const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 16,
  background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
  border: '1px solid rgba(255,255,255,0.8)',
  overflow: 'hidden',
  height: '100%',
  transition: 'all 0.3s ease',
  position: 'relative'
};

const imgWrapStyle = {
  width: '100%',
  height: 180,
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #f8f9fa, #f2f2f2)',
  position: 'relative'
};

const imgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
  transition: 'transform 0.3s ease'
};

const bodyStyle = {
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  flex: 1,
  background: 'rgba(255, 255, 255, 0.9)'
};

const nameStyle = {
  fontSize: 18,
  fontWeight: 700,
  color: '#1f2937',
  margin: 0,
  lineHeight: 1.3,
  marginBottom: 4
};

const addressStyle = {
  fontSize: 14,
  color: '#6b7280',
  margin: 0,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  lineHeight: 1.4
};

const promoStyle = {
  fontSize: 13,
  color: '#ff4d4f',
  marginTop: 'auto',
  fontWeight: 600,
  background: 'rgba(255, 77, 79, 0.08)',
  padding: '4px 8px',
  borderRadius: 6,
  alignSelf: 'flex-start'
};

const RestaurantCard = ({ restaurant }) => {
  const src = restaurant.imageUrl || 'https://via.placeholder.com/600x400?text=Restaurant';
  
  const handleMouseEnter = (e) => {
    const card = e.currentTarget;
    const img = card.querySelector('img');
    card.style.transform = 'translateY(-4px)';
    card.style.boxShadow = '0 12px 40px rgba(255,77,79,0.15), 0 4px 16px rgba(0,0,0,0.08)';
    if (img) img.style.transform = 'scale(1.05)';
  };
  
  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    const img = card.querySelector('img');
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)';
    if (img) img.style.transform = 'scale(1)';
  };
  
  return (
    <Link to={`/restaurants/${restaurant.id}`} style={{ textDecoration: 'none' }}>
      <div 
        style={cardStyle} 
        className="restaurant-card"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div style={imgWrapStyle}>
          <img src={src} alt={restaurant.name} style={imgStyle} />
          <div style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 20,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            color: '#ff4d4f',
            backdropFilter: 'blur(10px)'
          }}>
            🍽️ Nhà hàng
          </div>
        </div>
        <div style={bodyStyle}>
          <h3 style={nameStyle}>{restaurant.name}</h3>
          {restaurant.address && <p style={addressStyle}>📍 {restaurant.address}</p>}
          {restaurant.promotion && <p style={promoStyle}>🎉 {restaurant.promotion}</p>}
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
