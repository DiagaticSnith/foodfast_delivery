import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ShipperAdmin = () => {
  const [partners, setPartners] = useState([]);
  const [pending, setPending] = useState([]);
  // ...existing code...
  const [msg, setMsg] = useState('');

  // Lấy danh sách đối tác nhà hàng và yêu cầu chờ duyệt
  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    const res = await axios.get('/api/users');
    setPartners(res.data.filter(u => u.role === 'restaurant'));
    setPending(res.data.filter(u => u.role === 'restaurantpending'));
  };
  // ...existing code...

  const handleApprove = async (userId) => {
    await axios.put(`/api/users/${userId}/role`, { role: 'restaurant' });
    setMsg('Duyệt thành công!');
    fetchPartners();
  };
  const handleReject = async (userId) => {
    await axios.put(`/api/users/${userId}/role`, { role: 'user' });
    setMsg('Đã từ chối yêu cầu!');
    fetchPartners();
  };
  // ...existing code...

  return (
    <div>
      <h2 style={{color:'#189c38'}}>Quản lý Đối tác kinh doanh</h2>
      {msg && <div style={{color:'#189c38',marginBottom:12}}>{msg}</div>}
      <div style={{display:'flex',gap:32,alignItems:'flex-start'}}>
        <div style={{flex:1}}>
          <h3>Danh sách đối tác kinh doanh</h3>
          <table style={{width:'100%',marginBottom:24}}>
            <thead><tr><th style={{textAlign:'center'}}>Tên</th><th style={{textAlign:'center'}}>Email</th><th style={{textAlign:'center'}}>Địa chỉ</th><th style={{textAlign:'center'}}>Phone</th></tr></thead>
            <tbody>
              {partners.map(s => (
                <tr key={s.id}><td style={{textAlign:'center'}}>{s.name}</td><td style={{textAlign:'center'}}>{s.email}</td><td style={{textAlign:'center'}}>{s.address}</td><td style={{textAlign:'center'}}>{s.phoneNumber}</td></tr>
              ))}
            </tbody>
          </table>
          <h3>Yêu cầu đăng ký đối tác kinh doanh</h3>
          <table style={{width:'100%'}}>
            <thead><tr><th style={{textAlign:'center'}}>Tên</th><th style={{textAlign:'center'}}>Email</th><th style={{textAlign:'center'}}>Địa chỉ</th><th style={{textAlign:'center'}}>Phone</th><th style={{textAlign:'center'}}>Thao tác</th></tr></thead>
            <tbody>
              {pending.map(u => (
                <tr key={u.id}>
                  <td style={{textAlign:'center'}}>{u.name}</td><td style={{textAlign:'center'}}>{u.email}</td><td style={{textAlign:'center'}}>{u.address}</td><td style={{textAlign:'center'}}>{u.phoneNumber}</td>
                  <td>
                    <button style={{background:'#189c38',color:'#fff',border:'none',borderRadius:6,padding:'4px 12px',marginRight:8}} onClick={()=>handleApprove(u.id)}>Duyệt</button>
                    <button style={{background:'#ff4d4f',color:'#fff',border:'none',borderRadius:6,padding:'4px 12px'}} onClick={()=>handleReject(u.id)}>Từ chối</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShipperAdmin;
