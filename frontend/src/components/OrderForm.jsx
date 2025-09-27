import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';

const OrderForm = () => {
  const { cart, clearCart } = useCart();
  const [address, setAddress] = useState('');
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await orderAPI.createOrder({ userId: 1, total, address, items: cart }); // Mock userId
    clearCart();
    navigate('/order-history');
  };

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <h3>Thông tin giao hàng</h3>
      <input
        type="text"
        placeholder="Nhập địa chỉ nhận đồ ăn..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
      />
      <button type="submit">Đặt hàng ngay</button>
    </form>
  );
};

export default OrderForm;