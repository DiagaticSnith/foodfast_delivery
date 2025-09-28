import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    axios.get(`/api/restaurants/${id}`)
      .then(res => setRestaurant(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!restaurant) return <div>Loading...</div>;

  return (
    <div>
      <h2>{restaurant.name}</h2>
      <p>{restaurant.address}</p>
      <img src={restaurant.imageUrl} alt={restaurant.name} width={200} />
      <p>{restaurant.promotion}</p>
      <p>{restaurant.description}</p>
      <h3>Menu</h3>
      <ul>
        {restaurant.Menus?.map(menu => (
          <li key={menu.id}>
            <strong>{menu.name}</strong> - {menu.price}đ
            <br />
            <span>{menu.description}</span>
            <br />
            <img src={menu.imageUrl} alt={menu.name} width={100} />
          </li>
        ))}
      </ul>
      <h4>Các món liên quan cùng nhà hàng</h4>
      <ul>
        {restaurant.Menus?.map(menu => (
          <li key={menu.id + '-related'}>{menu.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default RestaurantDetail;
