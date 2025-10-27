
import React, { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [details, setDetails] = useState([]);
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

  if (loading) return <div>Đang xử lý đơn hàng...</div>;
  if (error) return <div style={{ color: 'red' }}>Lỗi: {error}</div>;
  if (!order) return null;
  return (
    <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 32 }}>
      <h2 style={{ color: '#ff4d4f', marginBottom: 24 }}>Hóa đơn thanh toán</h2>
      <div style={{ marginBottom: 16 }}><b>Mã đơn hàng:</b> #{order.id}</div>
  <div style={{ marginBottom: 16 }}><b>Khách hàng:</b> {order.name || order.userId}</div>
      <div style={{ marginBottom: 16 }}><b>Địa chỉ:</b> {order.address}</div>
      <div style={{ marginBottom: 16 }}>
        <b>Trạng thái:</b> <span style={{ marginLeft: 8 }}><StatusBadge status={order.status} /></span>
      </div>
      <div style={{ marginBottom: 16 }}><b>Chi tiết đơn hàng:</b></div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {details.map(item => (
          <li key={item.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src={item.Menu?.imageUrl} alt={item.Menu?.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
            <span>{item.Menu?.name}</span> x <b>{item.quantity}</b> - <span style={{ color: '#ff4d4f' }}>{item.price.toLocaleString()}₫</span>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 24, fontWeight: 'bold', fontSize: 20, color: '#ff4d4f' }}>Tổng cộng: {order.total.toLocaleString()}₫</div>

      {/* Actions */}
      <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {(order.status === 'Delivering' || order.status === 'Accepted') && (
          <a
            href={`/order-tracking?orderId=${order.id}`}
            style={{
              background: '#1890ff', color: '#fff', border: 'none', borderRadius: 8,
              padding: '10px 16px', textDecoration: 'none', fontWeight: 600
            }}
          >
            🗺️ Theo dõi đơn
          </a>
        )}
        <a
          href="/order-history"
          style={{
            background: '#f0f0f0', color: '#333', border: 'none', borderRadius: 8,
            padding: '10px 16px', textDecoration: 'none', fontWeight: 600
          }}
        >
          Lịch sử đơn
        </a>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
