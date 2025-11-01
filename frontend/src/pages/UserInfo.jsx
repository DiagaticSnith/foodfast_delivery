import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import { api } from '../api/api';
import { useToast } from '../components/ToastProvider';
import '../styles/admin.css';

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

  if (!user) return <div>Bạn chưa đăng nhập.</div>;

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

  return (
    <div style={{maxWidth:400,margin:'40px auto',background:'#fff',borderRadius:12,boxShadow:'0 2px 8px #eee',padding:32}}>
      <h2 style={{color:'#189c38',marginBottom:24}}>Thông tin tài khoản</h2>
      <div><b>Tên đăng nhập:</b> {user.username}</div>
      <form onSubmit={handleUpdateInfo} style={{marginTop:16}}>
        <div style={{marginBottom:10}}>
          <b>Họ tên:</b>
          <input
            type="text"
            placeholder="Họ tên"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ccc',marginTop:4}}
            required
          />
        </div>
        <div style={{marginBottom:10}}>
          <b>Email:</b>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ccc',marginTop:4}}
            required
          />
        </div>
        <div style={{marginBottom:10}}>
          <b>Địa chỉ:</b>
          <input
            type="text"
            placeholder="Địa chỉ"
            value={address}
            onChange={e => setAddress(e.target.value)}
            style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ccc',marginTop:4}}
            required
          />
        </div>
        <div style={{marginBottom:10}}>
          <b>Số điện thoại:</b>
          <input
            type="text"
            placeholder="Số điện thoại"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ccc',marginTop:4}}
            required
          />
        </div>
        <button type="submit" style={{background:'#189c38',color:'#fff',border:'none',borderRadius:8,padding:'8px 24px',fontWeight:600,fontSize:16,cursor:loading?'not-allowed':'pointer'}} disabled={loading}>
          Lưu thông tin
        </button>
      </form>
      {user.role === 'user' && !showRestaurantForm && (
        <button style={{marginTop:24,background:'#189c38',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:600,fontSize:16,cursor:loading?'not-allowed':'pointer'}} disabled={loading} onClick={handleRegisterRestaurant}>
          Đăng ký trở thành đối tác nhà hàng
        </button>
      )}
      {/* Modal đăng ký đối tác nhà hàng */}
      <Modal
        open={showRestaurantForm}
        title="Đăng ký đối tác nhà hàng"
        onClose={()=>setShowRestaurantForm(false)}
        footer={null}
        size="xl"
      >
  <form onSubmit={handleSubmitRestaurant} className="ff-form ff-2col-xl">
          {/* Left: Upload + Preview */}
          <div className="ff-stack">
            {restaurantImageUrl ? (
              <img src={restaurantImageUrl} alt="preview-restaurant" className="ff-img--preview-xl" onError={(e)=>{e.currentTarget.style.display='none';}} />
            ) : (
              <div className="ff-imgbox-xl">📷</div>
            )}
            <input type="file" accept="image/*" onChange={async (e)=>{
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
                try { toast.error(m); } catch {}
              } finally {
                setUploadingRestaurantImage(false);
              }
            }} />
            {uploadingRestaurantImage && <span className="ff-muted">Đang tải ảnh...</span>}
          </div>

          {/* Right: Fields in tidy grid */}
          <div className="ff-formgrid">
            <input className="ff-input" type="text" value={restaurantName} onChange={e=>setRestaurantName(e.target.value)} required placeholder="Tên nhà hàng" />
            <input className="ff-input" type="text" value={restaurantAddress} onChange={e=>setRestaurantAddress(e.target.value)} required placeholder="Địa chỉ nhà hàng" />
            <input className="ff-input" type="text" value={restaurantPromotion} onChange={e=>setRestaurantPromotion(e.target.value)} placeholder="Khuyến mãi (nếu có)" />
            <textarea className="ff-textarea ff-colspan-2" value={restaurantDescription} onChange={e=>setRestaurantDescription(e.target.value)} placeholder="Mô tả" rows={6} />
            <div className="ff-actions ff-colspan-2">
              <button type="button" onClick={()=>setShowRestaurantForm(false)} className="ff-btn ff-btn--ghost">Hủy</button>
              <button type="submit" disabled={loading||uploadingRestaurantImage} className="ff-btn ff-btn--success">Gửi đăng ký</button>
            </div>
          </div>
        </form>
      </Modal>
      {msg && <div style={{marginTop:16,color:msg.includes('thành công')?'#189c38':'#ff4d4f'}}>{msg}</div>}
    </div>
  );
};

export default UserInfo;
