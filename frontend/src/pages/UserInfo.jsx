import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import { api } from '../api/api';
import { useToast } from '../components/ToastProvider';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';
import '../styles/UserInfo.css';

const UserInfo = ({ user, setUser }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [address, setAddress] = useState(user.address || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [editInfo, setEditInfo] = useState(false);
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [restaurantDescription, setRestaurantDescription] = useState('');
  const [restaurantImageUrl, setRestaurantImageUrl] = useState('');
  const [restaurantPromotion, setRestaurantPromotion] = useState('');
  const [uploadingRestaurantImage, setUploadingRestaurantImage] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(`/api/users/${user.id}/info`, { name, email, address, phoneNumber });
      if (res.data && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      } else {
        setUser({ ...user, name, email, address, phoneNumber });
        localStorage.setItem('user', JSON.stringify({ ...user, name, email, address, phoneNumber }));
      }
      setMsg('Cập nhật thông tin thành công!');
      setEditInfo(false);
    } catch (err) {
      setMsg('Cập nhật thất bại: ' + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  if (!user) return (
    <div className="site-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
      <h2>Bạn chưa đăng nhập</h2>
      <p>Vui lòng đăng nhập để xem thông tin tài khoản</p>
      <button onClick={() => navigate('/login')} className="btn btn-primary">Đăng nhập</button>
    </div>
  );

  const handleRegisterRestaurant = () => {
    setShowRestaurantForm(true);
  };

  const handleSubmitRestaurant = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      // 1. Gửi thông tin nhà hàng
      await axios.post('/api/restaurants', {
        name: restaurantName,
        address: restaurantAddress,
        description: restaurantDescription,
        imageUrl: restaurantImageUrl,
        promotion: restaurantPromotion,
        userId: user.id
      });
      // 2. Đăng ký role restaurantpending
      await axios.put(`/api/users/${user.id}/role`, { role: 'restaurantpending' });
      setUser({ ...user, role: 'restaurantpending' });
      localStorage.setItem('user', JSON.stringify({ ...user, role: 'restaurantpending' }));
      setMsg('Đăng ký đối tác nhà hàng thành công! Vui lòng chờ admin duyệt.');
      setShowRestaurantForm(false);
    } catch (err) {
      setMsg('Đăng ký thất bại: ' + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  const getRoleDisplay = (role) => {
    switch(role) {
      case 'user': return { text: '👤 Khách hàng', color: '#1890ff' };
      case 'restaurant': return { text: '🏪 Đối tác nhà hàng', color: '#52c41a' };
      case 'restaurantpending': return { text: '⏳ Chờ duyệt đối tác', color: '#faad14' };
      case 'admin': return { text: '👑 Quản trị viên', color: '#722ed1' };
      case 'shipper': return { text: '🚚 Shipper', color: '#13c2c2' };
      default: return { text: role, color: '#666' };
    }
  };

  const roleInfo = getRoleDisplay(user.role);

  return (
    <div className="site-container">
      <div className="user-info-container">
        {/* Header */}
        <div className="user-info-header">
          <div className="user-info-left">
            <div className="user-basic-info">
              <h1 className="user-name">{user.name || user.username}</h1>
              <div className="user-role" style={{ color: roleInfo.color }}>
                {roleInfo.text}
              </div>
              <div className="user-username">@{user.username}</div>
            </div>
          </div>
          <div className="user-info-right">
            <button onClick={() => navigate('/')} className="btn btn-ghost">← Trang chủ</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="user-info-content">
          <div className="info-card">
            <div className="card-header">
              <h2>📋 Thông tin cá nhân</h2>
            </div>
            
            <form onSubmit={handleUpdateInfo} className="user-form">
              <div className="form-grid">
                <div className="form-field">
                  <label className="field-label">👤 Họ và tên</label>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="ff-input"
                    required
                  />
                </div>
                
                <div className="form-field">
                  <label className="field-label">📧 Email</label>
                  <input
                    type="email"
                    placeholder="Nhập email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="ff-input"
                    required
                  />
                </div>
                
                <div className="form-field form-field-full">
                  <label className="field-label">📍 Địa chỉ</label>
                  <input
                    type="text"
                    placeholder="Nhập địa chỉ"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="ff-input"
                    required
                  />
                </div>
                
                <div className="form-field">
                  <label className="field-label">📱 Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className="ff-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? '⏳ Đang lưu...' : '💾 Lưu thông tin'}
                </button>
              </div>
            </form>
          </div>

          {/* Restaurant Registration */}
          {user.role === 'user' && (
            <div className="info-card">
              <div className="card-header">
                <h2>🏪 Trở thành đối tác</h2>
              </div>
              <div className="partner-info">
                <p>Đăng ký trở thành đối tác nhà hàng để bán món ăn trên nền tảng của chúng tôi!</p>
                <div className="partner-benefits">
                  <div className="benefit-item">✅ Quản lý menu dễ dàng</div>
                  <div className="benefit-item">✅ Nhận đơn hàng tự động</div>
                  <div className="benefit-item">✅ Theo dõi doanh thu</div>
                </div>
                <button 
                  className="btn btn-success"
                  disabled={loading} 
                  onClick={handleRegisterRestaurant}
                  style={{ marginTop: '16px' }}
                >
                  🚀 Đăng ký ngay
                </button>
              </div>
            </div>
          )}

          {user.role === 'restaurantpending' && (
            <div className="info-card">
              <div className="card-header">
                <h2>⏳ Chờ duyệt đối tác</h2>
              </div>
              <div className="pending-info">
                <p>Đăng ký đối tác của bạn đang được xem xét. Chúng tôi sẽ thông báo kết quả sớm nhất!</p>
              </div>
            </div>
          )}
        </div>

        {/* Message */}
        {msg && (
          <div className={`message ${msg.includes('thành công') ? 'message-success' : 'message-error'}`}>
            {msg}
          </div>
        )}
      </div>

      {/* Modal đăng ký đối tác nhà hàng */}
      <Modal
        open={showRestaurantForm}
        title="🏪 Đăng ký đối tác nhà hàng"
        onClose={() => setShowRestaurantForm(false)}
        footer={null}
        size="xl"
      >
        <form onSubmit={handleSubmitRestaurant} className="ff-form ff-2col-xl">
          {/* Left: Upload + Preview */}
          <div className="ff-stack">
            {restaurantImageUrl ? (
              <img src={restaurantImageUrl} alt="preview-restaurant" className="ff-img--preview-xl" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <div className="ff-imgbox-xl">📷</div>
            )}
            <input type="file" accept="image/*" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadingRestaurantImage(true);
              try {
                const fd = new FormData();
                fd.append('image', file);
                const res = await api.post(`/api/upload?folder=restaurants`, fd, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
                setRestaurantImageUrl(res.data.url);
              } catch (err) {
                const m = err?.response?.data?.message || err?.message || 'Upload ảnh thất bại';
                try { toast.error(m); } catch { }
              } finally {
                setUploadingRestaurantImage(false);
              }
            }} />
            {uploadingRestaurantImage && <span className="ff-muted">Đang tải ảnh...</span>}
          </div>

          {/* Right: Fields in tidy grid */}
          <div className="ff-formgrid">
            <div className="form-field">
              <label className="field-label">🏠 Tên nhà hàng *</label>
              <input className="ff-input" type="text" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} required placeholder="Nhập tên nhà hàng" />
            </div>
            <div className="form-field">
              <label className="field-label">📍 Địa chỉ *</label>
              <input className="ff-input" type="text" value={restaurantAddress} onChange={e => setRestaurantAddress(e.target.value)} required placeholder="Nhập địa chỉ" />
            </div>
            <div className="form-field ff-colspan-2">
              <label className="field-label">🎁 Khuyến mãi</label>
              <input className="ff-input" type="text" value={restaurantPromotion} onChange={e => setRestaurantPromotion(e.target.value)} placeholder="Khuyến mãi (để trống nếu không có)" />
            </div>
            <div className="form-field ff-colspan-2">
              <label className="field-label">📝 Mô tả</label>
              <textarea className="ff-textarea" value={restaurantDescription} onChange={e => setRestaurantDescription(e.target.value)} placeholder="Mô tả về nhà hàng, món ăn đặc trưng..." rows={4} />
            </div>
            <div className="ff-actions ff-colspan-2">
              <button type="button" onClick={() => setShowRestaurantForm(false)} className="btn btn-outline">Hủy</button>
              <button type="submit" disabled={loading || uploadingRestaurantImage} className="btn btn-success">
                {loading || uploadingRestaurantImage ? '⏳ Đang xử lý...' : '🚀 Gửi đăng ký'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserInfo;