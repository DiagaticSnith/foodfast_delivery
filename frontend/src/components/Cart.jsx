import React from 'react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, updateQuantity } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart">
      <h3>Giỏ hàng của bạn</h3>
      {cart.length === 0 ? (
        <div style={{color: '#888'}}>Chưa có món nào trong giỏ hàng.</div>
      ) : (
        cart.map((item, index) => (
          <div className="cart-item" key={item.id}>
            <span>{item.name} - {item.price.toLocaleString()}₫</span>
            <input type="number" min={1} value={item.quantity} style={{width: 48, marginLeft: 8}} onChange={(e) => updateQuantity(index, Number(e.target.value))} />
          </div>
        ))
      )}
      <div className="cart-total">Tổng cộng: {total.toLocaleString()}₫</div>
    </div>
  );
};

export default Cart;