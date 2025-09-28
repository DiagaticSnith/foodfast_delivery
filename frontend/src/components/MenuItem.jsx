import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../api/api';

const MenuItem = ({ item }) => {
  const navigate = useNavigate();
  const [msg, setMsg] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const handleClick = () => {
    navigate(`/menu/${item.id}`);
  };
  const handleOrder = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await cartAPI.addToCart(item.id, 1);
      setMsg('Đã thêm vào giỏ hàng!');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg('Có lỗi khi thêm vào giỏ hàng!');
      setTimeout(() => setMsg(''), 2000);
    }
  };
  return (
    <div className="menu-item" style={{ cursor: 'pointer', position: 'relative' }} onClick={handleClick}>
      <h4>{item.name}</h4>
      <p>{item.description || 'Món ăn nhanh, giao tận nơi!'}</p>
      <div className="price">Giá: {item.price.toLocaleString()}₫</div>
      <button onClick={handleOrder}>Đặt món</button>
      {msg && <div style={{position:'absolute',top:8,right:8,color:'#52c41a',background:'#fff',padding:'4px 12px',borderRadius:8,boxShadow:'0 2px 8px #eee',fontWeight:'bold'}}>{msg}</div>}
    </div>
  );
};

export default MenuItem;
