import React from 'react';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => (
  <div className="restaurant-card">
    <Link to={`/restaurants/${restaurant.id}`}>
      <h3>{restaurant.name}</h3>
      <img src={restaurant.imageUrl} alt={restaurant.name} width={100} />
      <p>{restaurant.address}</p>
      <p>{restaurant.promotion}</p>
    </Link>
  </div>
);

export default RestaurantCard;
