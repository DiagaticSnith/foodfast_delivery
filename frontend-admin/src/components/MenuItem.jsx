import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../api/api';
import { useToast } from './ToastProvider';
import '../styles/MenuItem.css';

const MenuItem = ({ item }) => {
  const navigate = useNavigate();
  const [msg, setMsg] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const toast = useToast();
  const handleClick = () => {
    navigate(`/menu/${item.id}`);
  };
  const handleOrder = async (e) => {
    e.stopPropagation();
    if (!user) {
      try { toast.info('Vui lòng đăng nhập để đặt món'); } catch {}
      return;
    }
    if (item.inStock === false || item.status !== 'active') {
      try { toast.info('Món hiện không thể đặt (hết hàng hoặc đã ẩn)'); } catch {}
      return;
    }
    try {
      await cartAPI.addToCart(item.id, 1);
      try { toast.success('Đã thêm vào giỏ hàng!'); } catch {}
    } catch (err) {
      try { toast.error('Có lỗi khi thêm vào giỏ hàng!'); } catch {}
    }
  };
  return (
    <div className="menu-item-card" onClick={handleClick}>
      <div className="menu-item-image-container">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="menu-item-image" />
        ) : (
          <div className="menu-item-image-placeholder">
            <span className="placeholder-icon">🍽️</span>
          </div>
        )}
        <div className="menu-item-overlay">
          <span className="view-details">👁️ Xem chi tiết</span>
        </div>
      </div>
      
      <div className="menu-item-content">
        <h4 className="menu-item-title">{item.name}</h4>
        <p className="menu-item-description">
          {item.description || 'Món ăn nhanh, giao tận nơi!'}
        </p>
        
        <div className="menu-item-footer">
          <div className="menu-item-price">
            <span className="price-label">💰</span>
            <span className="price-value">{item.price.toLocaleString()}₫</span>
          </div>
          
          <div className="menu-item-actions">
            {item.inStock === false ? (
              <button disabled className="menu-btn menu-btn--disabled">
                ❌ Hết hàng
              </button>
            ) : item.status !== 'active' ? (
              <button disabled className="menu-btn menu-btn--disabled">
                🚫 Không khả dụng
              </button>
            ) : (
              <button onClick={handleOrder} className="menu-btn menu-btn--primary">
                🛒 Đặt món
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
