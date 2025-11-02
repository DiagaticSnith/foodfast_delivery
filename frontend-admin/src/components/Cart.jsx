import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../api/api';
import '../styles/Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    cartAPI.getCart().then(res => {
      const items = res.data?.CartItems?.map(ci => ({
        id: ci.menuId,
        name: ci.Menu?.name,
        price: ci.Menu?.price,
        imageUrl: ci.Menu?.imageUrl,
        quantity: ci.quantity
      })) || [];
      setCart(items);
      setTotal(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
    });
  }, []);

  const handleQuantity = async (id, qty) => {
    // TODO: Gọi API cập nhật số lượng nếu cần
    setCart(cart.map(item => item.id === id ? { ...item, quantity: qty > 0 ? qty : 1 } : item));
    setTotal(cart.reduce((sum, item) => sum + item.price * (item.id === id ? (qty > 0 ? qty : 1) : item.quantity), 0));
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1 className="cart-title">
          <span className="cart-icon">🛒</span>
          <span>Giỏ hàng của bạn</span>
        </h1>
        {cart.length > 0 && (
          <div className="cart-count">
            <span className="count-number">{cart.length}</span>
            <span className="count-text">món</span>
          </div>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-icon">😔</div>
          <h3 className="empty-title">Giỏ hàng trống</h3>
          <p className="empty-text">Hãy thêm món ăn yêu thích vào giỏ hàng!</p>
          <button 
            className="browse-menu-btn"
            onClick={() => navigate('/')}
          >
            🍽️ Khám phá menu
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item-card" key={item.id}>
                <div className="item-image">
                  <img 
                    src={item.imageUrl || 'https://via.placeholder.com/120x120?text=Food'} 
                    alt={item.name} 
                  />
                </div>
                
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <div className="item-price">
                    <span className="price-icon">💰</span>
                    <span className="price-value">{item.price.toLocaleString()}₫</span>
                  </div>
                  
                  <div className="quantity-controls">
                    <label className="quantity-label">Số lượng:</label>
                    <div className="quantity-input-group">
                      <button 
                        className="quantity-btn decrease"
                        onClick={() => handleQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        min={1} 
                        value={item.quantity}
                        className="quantity-input"
                        onChange={e => handleQuantity(item.id, Number(e.target.value))}
                      />
                      <button 
                        className="quantity-btn increase"
                        onClick={() => handleQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="item-subtotal">
                    <span>Thành tiền: </span>
                    <span className="subtotal-value">
                      {(item.price * item.quantity).toLocaleString()}₫
                    </span>
                  </div>
                </div>
                
                <button 
                  className="remove-btn"
                  onClick={async () => {
                    await cartAPI.removeFromCart(item.id);
                    setCart(cart.filter(i => i.id !== item.id));
                    setTotal(cart.filter(i => i.id !== item.id).reduce((sum, i) => sum + i.price * i.quantity, 0));
                  }}
                  title="Xóa khỏi giỏ hàng"
                >
                  <span className="remove-icon">🗑️</span>
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <div className="summary-header">
                <h3 className="summary-title">📊 Tổng kết đơn hàng</h3>
              </div>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Số lượng món:</span>
                  <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} món</span>
                </div>
                <div className="summary-row">
                  <span>Tạm tính:</span>
                  <span>{total.toLocaleString()}₫</span>
                </div>
                <div className="summary-row total">
                  <span>Tổng cộng:</span>
                  <span className="total-value">{total.toLocaleString()}₫</span>
                </div>
              </div>
              
              <button 
                className="checkout-btn"
                onClick={() => navigate('/checkout', { state: { cart } })}
              >
                <span className="checkout-icon">🚀</span>
                <span>Tiến hành đặt hàng</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;