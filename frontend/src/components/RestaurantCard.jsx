import React from 'react';
import { Link } from 'react-router-dom';

const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  background: '#fff',
  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
  overflow: 'hidden',
  height: '100%'
};

const imgWrapStyle = {
  width: '100%',
  height: 140,
  overflow: 'hidden',
  background: '#f2f2f2'
};

const imgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block'
};

const bodyStyle = {
  padding: 12,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  flex: 1
};

const nameStyle = {
  fontSize: 16,
  fontWeight: 800,
  color: '#2b2b2b',
  margin: 0,
  lineHeight: 1.3
};

const addressStyle = {
  fontSize: 13,
  color: '#666',
  margin: 0,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden'
};

const promoStyle = {
  fontSize: 12,
  color: '#ff4d4f',
  marginTop: 'auto'
};

const RestaurantCard = ({ restaurant }) => {
  const src = restaurant.imageUrl || 'https://via.placeholder.com/600x400?text=Restaurant';
  return (
    <Link to={`/restaurants/${restaurant.id}`} style={{ textDecoration: 'none' }}>
      <div style={cardStyle} className="restaurant-card">
        <div style={imgWrapStyle}>
          <img src={src} alt={restaurant.name} style={imgStyle} />
        </div>
        <div style={bodyStyle}>
          <h3 style={nameStyle}>{restaurant.name}</h3>
          {restaurant.address && <p style={addressStyle}>{restaurant.address}</p>}
          {restaurant.promotion && <p style={promoStyle}>{restaurant.promotion}</p>}
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
