import React, { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { api } from '../api/api';
import '../styles/CheckoutSuccess.css';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [details, setDetails] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError('Missing session_id');
      setLoading(false);
      return;
    }
    // Gọi API backend để lấy order theo sessionId, nếu chưa có thử lại sau 1s
    let cancelled = false;
    const fetchOrder = async (retry = false) => {
      try {
        const res = await axios.get(`/api/orders/by-session/${sessionId}`);
        if (!res.data || !res.data.id) throw new Error('Không tìm thấy đơn hàng');
        setOrder(res.data);
        const detailRes = await axios.get(`/api/order-details/${res.data.id}`);
        setDetails(detailRes.data);
        setError(null);
      } catch (err) {
        if (!retry) {
          // Đợi 1s rồi thử lại 1 lần nữa
          setTimeout(() => { if (!cancelled) fetchOrder(true); }, 1200);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
    return () => { cancelled = true; };
  }, [searchParams]);

  useEffect(() => {
    if (!order) return;
    // Prefer name from the order if present
    if (order.name) {
      setCustomerName(order.name);
      return;
    }
    // If order has userId, try to fetch user to show readable name
    if (order.userId) {
      let cancelled = false;
      (async () => {
        try {
          const res = await api.get(`/api/users/${order.userId}`);
          if (cancelled) return;
          const user = res.data || {};
          setCustomerName(user.name || user.username || `#${order.userId}`);
        } catch (err) {
          if (cancelled) return;
          setCustomerName(`#${order.userId}`);
        }
      })();
      return () => { cancelled = true; };
    }
  }, [order]);

  if (loading) return (
    <div className="site-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div className="loading-spinner">🔄</div>
      <p>Đang xử lý đơn hàng...</p>
    </div>
  );
  
  if (error) return (
    <div className="site-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ color: '#ff4d4f', fontSize: '48px', marginBottom: '16px' }}>❌</div>
      <h2 style={{ color: '#ff4d4f', marginBottom: '16px' }}>Có lỗi xảy ra</h2>
      <p>{error}</p>
      <a href="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Về trang chủ</a>
    </div>
  );
  
  if (!order) return null;
  
  return (
    <div className="site-container">
      <div className="success-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">✅</div>
          <h1 className="success-title">Đặt hàng thành công!</h1>
          <p className="success-subtitle">Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.</p>
        </div>

        {/* Order Details Card */}
        <div className="order-card">
          <div className="order-header">
            <h2>📋 Chi tiết đơn hàng</h2>
            <div className="order-id">#{order.id}</div>
          </div>
          
          <div className="order-info">
            <div className="info-row">
              <span className="info-label">👤 Khách hàng:</span>
              <span className="info-value">{customerName || (order.userId ? `#${order.userId}` : '')}</span>
            </div>
            <div className="info-row">
              <span className="info-label">📍 Địa chỉ:</span>
              <span className="info-value">{order.address}</span>
            </div>
            <div className="info-row">
              <span className="info-label">📊 Trạng thái:</span>
              <StatusBadge status={order.status} />
            </div>
          </div>

          <div className="order-items">
            <h3>🍽️ Món đã đặt</h3>
            <div className="items-list">
              {details.map(item => (
                <div key={item.id} className="order-item">
                  <img 
                    src={item.Menu?.imageUrl} 
                    alt={item.Menu?.name} 
                    className="item-image"
                  />
                  <div className="item-details">
                    <div className="item-name">{item.Menu?.name}</div>
                    <div className="item-quantity">Số lượng: {item.quantity}</div>
                  </div>
                  <div className="item-price">{item.price.toLocaleString()}₫</div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-total">
            <div className="total-row">
              <span>Tổng cộng:</span>
              <span className="total-amount">{order.total.toLocaleString()}₫</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {(order.status === 'Delivering' || order.status === 'Accepted') && (
            <a href={`/order-tracking?orderId=${order.id}`} className="btn btn-primary">
              🗺️ Theo dõi đơn hàng
            </a>
          )}
          <a href="/order-history" className="btn btn-outline">
            📄 Lịch sử đơn hàng
          </a>
          <a href="/" className="btn btn-outline">
            🏠 Về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;