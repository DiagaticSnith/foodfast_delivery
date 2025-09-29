import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ShipperAdmin = () => {
  const [shippers, setShippers] = useState([]);
  const [pending, setPending] = useState([]);
  // ...existing code...
  const [msg, setMsg] = useState('');

  // Lấy danh sách shipper và shipperpending
  useEffect(() => {
    fetchShippers();
  // ...existing code...
  }, []);

  const fetchShippers = async () => {
    const res = await axios.get('/api/users/shippers');
    setShippers(res.data.filter(u => u.role === 'shipper'));
    setPending(res.data.filter(u => u.role === 'shipperpending'));
  };
  // ...existing code...

  const handleApprove = async (userId) => {
    await axios.put(`/api/users/${userId}/role`, { role: 'shipper' });
    setMsg('Duyệt thành công!');
    fetchShippers();
  };
  const handleReject = async (userId) => {
    await axios.put(`/api/users/${userId}/role`, { role: 'user' });
    setMsg('Đã từ chối yêu cầu!');
    fetchShippers();
  };
  // ...existing code...

  return (
    <div>
      <h2 style={{color:'#189c38'}}>Quản lý Shipper</h2>
      {msg && <div style={{color:'#189c38',marginBottom:12}}>{msg}</div>}
      <div style={{display:'flex',gap:32,alignItems:'flex-start'}}>
        <div style={{flex:1}}>
          <h3>Danh sách Shipper</h3>
          <table style={{width:'100%',marginBottom:24}}>
            <thead><tr><th style={{textAlign:'center'}}>Tên</th><th style={{textAlign:'center'}}>Email</th><th style={{textAlign:'center'}}>Địa chỉ</th><th style={{textAlign:'center'}}>Phone</th></tr></thead>
            <tbody>
              {shippers.map(s => (
                <tr key={s.id}><td style={{textAlign:'center'}}>{s.username}</td><td style={{textAlign:'center'}}>{s.email}</td><td style={{textAlign:'center'}}>{s.address}</td><td style={{textAlign:'center'}}>{s.phoneNumber}</td></tr>
              ))}
            </tbody>
          </table>
          <h3>Yêu cầu đăng ký Shipper</h3>
          <table style={{width:'100%'}}>
            <thead><tr><th style={{textAlign:'center'}}>Tên</th><th style={{textAlign:'center'}}>Email</th><th style={{textAlign:'center'}}>Địa chỉ</th><th style={{textAlign:'center'}}>Phone</th><th style={{textAlign:'center'}}>Thao tác</th></tr></thead>
            <tbody>
              {pending.map(u => (
                <tr key={u.id}>
                  <td style={{textAlign:'center'}}>{u.username}</td><td style={{textAlign:'center'}}>{u.email}</td><td style={{textAlign:'center'}}>{u.address}</td><td style={{textAlign:'center'}}>{u.phoneNumber}</td>
                  <td>
                    <button style={{background:'#189c38',color:'#fff',border:'none',borderRadius:6,padding:'4px 12px',marginRight:8}} onClick={()=>handleApprove(u.id)}>Duyệt</button>
                    <button style={{background:'#ff4d4f',color:'#fff',border:'none',borderRadius:6,padding:'4px 12px'}} onClick={()=>handleReject(u.id)}>Từ chối</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Đã bỏ phần gán đơn cho shipper */}
      </div>
    </div>
  );
};

export default ShipperAdmin;
