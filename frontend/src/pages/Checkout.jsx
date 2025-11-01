import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MapModal from '../components/MapModal';
import { paymentAPI, orderAPI, userAPI } from '../api/api';
import { useToast } from '../components/ToastProvider';
import '../styles/Checkout.css';

const Checkout = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [address, setAddress] = useState(user.address || '');
  const [openMap, setOpenMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  // Lấy cartItems từ React Router state
  const location = useLocation();
  const cartItems = location.state?.cart || [];
  const userId = user.id || 1;
  const userEmail = user.email || '';
  const token = localStorage.getItem('token');
  const toast = useToast();

  // Nếu giỏ hàng trống, thông báo và chuyển hướng về trang menu
  React.useEffect(() => {
    if (cartItems.length === 0) {
      try { toast.info('Giỏ hàng trống. Vui lòng chọn món trước khi thanh toán!'); } catch {}
      setTimeout(() => {
        window.location.href = '/'; // hoặc '/menu' nếu có route menu riêng
      }, 2000);
    }
  }, [cartItems]);

  if (cartItems.length === 0) {
    return (
      <div className="empty-checkout">
        <div className="empty-icon">😔</div>
        <h2 className="empty-title">Giỏ hàng trống</h2>
        <p className="empty-text">Vui lòng chọn món trước khi thanh toán. Đang chuyển về trang menu...</p>
      </div>
    );
  }

  const totalAmount = cartItems.reduce((s,it)=>s + Number(it.price || it.Menu?.price || 0) * Number(it.quantity || it.qty || 1),0);

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        {/* Header */}
        <div className="checkout-header">
          <h1 className="checkout-title">
            <span className="checkout-icon">📦</span>
            <span>Thông tin giao hàng</span>
          </h1>
          <div className="checkout-progress">
            <div className="progress-step active">
              <span className="step-number">1</span>
              <span className="step-text">Thông tin</span>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step">
              <span className="step-number">2</span>
              <span className="step-text">Thanh toán</span>
            </div>
          </div>
        </div>

        <div className="checkout-layout">
          {/* Left Column - Delivery Info */}
          <div className="delivery-section">
            <div className="section-card">
              <div className="card-header">
                <h3 className="card-title">
                  <span className="card-icon">📍</span>
                  <span>Địa chỉ giao hàng</span>
                </h3>
              </div>
              
              <div className="address-input-group">
                <input
                  type="text"
                  placeholder="Nhập địa chỉ nhận đồ ăn..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="address-input"
                />
                <button 
                  type="button" 
                  className="map-button"
                  onClick={()=>setOpenMap(true)}
                >
                  <span className="map-icon">🗺️</span>
                  <span>Bản đồ</span>
                </button>
              </div>
              
              <div className="save-address-option">
                <input 
                  id="saveAddress" 
                  type="checkbox" 
                  checked={saveAddress} 
                  onChange={e=>setSaveAddress(e.target.checked)}
                  className="save-checkbox"
                />
                <label htmlFor="saveAddress" className="save-label">
                  <span className="checkbox-icon">✓</span>
                  <span>Lưu địa chỉ này cho lần sau</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-section">
            <div className="section-card">
              <div className="card-header">
                <h3 className="card-title">
                  <span className="card-icon">📋</span>
                  <span>Đơn hàng của bạn</span>
                </h3>
                <div className="items-count">
                  {cartItems.length} món
                </div>
              </div>
              
              <div className="order-items">
                {cartItems.map((it, idx) => {
                  const name = it.name || it.Menu?.name || `Món #${it.menuId || idx+1}`;
                  const qty = Number(it.quantity || it.qty || 1);
                  const price = Number(it.price || it.Menu?.price || 0);
                  const line = price * qty;
                  const imageUrl = it.imageUrl || it.Menu?.imageUrl;
                  return (
                    <div key={idx} className="order-item">
                      <div className="item-image">
                        {imageUrl ? (
                          <img src={imageUrl} alt={name} className="order-item-img" />
                        ) : (
                          <div className="item-image-placeholder">
                            <span className="placeholder-icon">🍽️</span>
                          </div>
                        )}
                      </div>
                      <div className="item-info">
                        <div className="item-name">{name}</div>
                        <div className="item-details">
                          <span className="item-quantity">Số lượng: {qty}</span>
                        </div>
                      </div>
                      <div className="item-total">{line.toLocaleString()}₫</div>
                    </div>
                  );
                })}
              </div>
              
              <div className="order-total">
                <div className="total-row">
                  <span className="total-label">Tổng cộng</span>
                  <span className="total-value">{totalAmount.toLocaleString()}₫</span>
                </div>
              </div>
              
              <button
                className={`checkout-button ${(!address || loading) ? 'disabled' : ''}`}
                disabled={!address || loading}
                onClick={async () => {
                  setLoading(true);
                  console.log('cartItems gửi lên Stripe:', cartItems);
                  try {
                    // Optionally update user address before paying
                    if (saveAddress && userId && address && address !== (user.address || '')) {
                      try {
                        await userAPI.updateInfo(userId, { address });
                        const newUser = { ...user, address };
                        localStorage.setItem('user', JSON.stringify(newUser));
                      } catch (e) {
                        console.warn('Không thể lưu địa chỉ vào tài khoản:', e?.message || e);
                      }
                    }
                    const res = await paymentAPI.createStripeSession(cartItems, address, userId, userEmail, token);
                    window.location.href = res.data.url;
                  } catch (err) {
                    try { toast.error('Lỗi tạo session Stripe: ' + err.message); } catch {}
                  }
                  setLoading(false);
                }}
              >
                <span className="button-icon">
                  {loading ? '⏳' : '🚀'}
                </span>
                <span>
                  {loading ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <MapModal open={openMap} onClose={()=>setOpenMap(false)} onConfirm={addr=>{setAddress(addr);setOpenMap(false);}} />
    </div>
  );
};

export default Checkout;