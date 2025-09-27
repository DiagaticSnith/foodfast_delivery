import React from 'react';

const MenuItem = ({ item }) => (
  <div className="menu-item">
    <h4>{item.name}</h4>
    <p>{item.description || 'Món ăn nhanh, giao tận nơi!'}</p>
    <div className="price">Giá: {item.price.toLocaleString()}₫</div>
    <button>Đặt món</button>
  </div>
);

export default MenuItem;
