import React, { useState } from 'react';
import axios from 'axios';

const UserInfo = ({ user, setUser }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [address, setAddress] = useState(user.address || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [editInfo, setEditInfo] = useState(false);
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(`/api/users/${user.id}/info`, { address, phoneNumber });
      if (res.data && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      } else {
        setUser({ ...user, address, phoneNumber });
        localStorage.setItem('user', JSON.stringify({ ...user, address, phoneNumber }));
      }
      setMsg('Cập nhật thông tin thành công!');
      setEditInfo(false);
    } catch (err) {
      setMsg('Cập nhật thất bại: ' + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  if (!user) return <div>Bạn chưa đăng nhập.</div>;

  const handleRegisterShipper = async () => {
    setLoading(true);
    try {
      await axios.put(`/api/users/${user.id}/role`, { role: 'shipperpending' });
      setUser({ ...user, role: 'shipperpending' });
      localStorage.setItem('user', JSON.stringify({ ...user, role: 'shipperpending' }));
      setMsg('Đăng ký shipper thành công! Vui lòng chờ admin duyệt.');
    } catch (err) {
      setMsg('Đăng ký thất bại: ' + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  return (
    <div style={{maxWidth:400,margin:'40px auto',background:'#fff',borderRadius:12,boxShadow:'0 2px 8px #eee',padding:32}}>
      <h2 style={{color:'#189c38',marginBottom:24}}>Thông tin tài khoản</h2>
      <div><b>Tên đăng nhập:</b> {user.username}</div>
      <div><b>Email:</b> {user.email || '(chưa có)'}</div>
      <div><b>Vai trò:</b> {user.role}</div>
      <form onSubmit={handleUpdateInfo} style={{marginTop:16}}>
        <div style={{marginBottom:10}}>
          <b>Địa chỉ:</b>
          <input
            type="text"
            placeholder="Địa chỉ"
            value={address}
            onChange={e => setAddress(e.target.value)}
            style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ccc',marginTop:4}}
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
          />
        </div>
        <button type="submit" style={{background:'#189c38',color:'#fff',border:'none',borderRadius:8,padding:'8px 24px',fontWeight:600,fontSize:16,cursor:loading?'not-allowed':'pointer'}} disabled={loading}>
          Lưu thông tin
        </button>
      </form>
      {user.role === 'user' && (
        <button style={{marginTop:24,background:'#189c38',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:600,fontSize:16,cursor:loading?'not-allowed':'pointer'}} disabled={loading} onClick={handleRegisterShipper}>
          Đăng ký trở thành Shipper
        </button>
      )}
      {msg && <div style={{marginTop:16,color:msg.includes('thành công')?'#189c38':'#ff4d4f'}}>{msg}</div>}
    </div>
  );
};

export default UserInfo;
