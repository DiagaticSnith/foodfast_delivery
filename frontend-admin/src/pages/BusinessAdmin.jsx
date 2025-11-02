import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BusinessAdmin = () => {
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

  const card = (u, actions) => (
    <div key={u.id} style={{
      border:'1px solid #eee', borderRadius:12, padding:16, background:'#fff',
      boxShadow:'0 2px 8px rgba(0,0,0,0.04)', display:'flex', gap:12
    }}>
      <div style={{
        width:48, height:48, borderRadius:12, background:'#f6faff',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, color:'#1677ff', flexShrink:0
      }}>
        🍽️
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
          <div style={{fontWeight:700, fontSize:16}}>{u.name || '(Chưa có tên)'}</div>
          <span style={{fontSize:12, color:'#888', background:'#f5f5f5', padding:'2px 8px', borderRadius:999}}>{u.role}</span>
        </div>
        <div style={{marginTop:6, color:'#555'}}>
          <div><strong>Email:</strong> {u.email || '-'}</div>
          <div><strong>Địa chỉ:</strong> {u.address || '-'}</div>
          <div><strong>Điện thoại:</strong> {u.phoneNumber || '-'}</div>
        </div>
      </div>
      {actions && (
        <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end'}}>
          {actions}
        </div>
      )}
    </div>
  );

  const gridStyle = {
    display:'grid',
    gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',
    gap:16
  };

  return (
    <div>
      {msg && <div style={{color:'#189c38',marginBottom:12}}>{msg}</div>}

      <div style={{marginBottom:24}}>
        <h3 style={{margin:'8px 0 12px'}}>Danh sách đối tác kinh doanh</h3>
        {partners.length === 0 ? (
          <div style={{color:'#888',padding:'12px 0'}}>Chưa có đối tác nào.</div>
        ) : (
          <div style={gridStyle}>
            {partners.map(u => card(u))}
          </div>
        )}
      </div>

      <div>
        <h3 style={{margin:'8px 0 12px'}}>Yêu cầu đăng ký đối tác kinh doanh</h3>
        {pending.length === 0 ? (
          <div style={{color:'#888',padding:'12px 0'}}>Không có yêu cầu chờ duyệt.</div>
        ) : (
          <div style={gridStyle}>
            {pending.map(u => card(u, (
              <>
                <button style={{background:'#189c38',color:'#fff',border:'none',borderRadius:8,padding:'8px 14px',fontWeight:600,cursor:'pointer'}} onClick={()=>handleApprove(u.id)}>Duyệt</button>
                <button style={{background:'#ff4d4f',color:'#fff',border:'none',borderRadius:8,padding:'8px 14px',fontWeight:600,cursor:'pointer'}} onClick={()=>handleReject(u.id)}>Từ chối</button>
              </>
            )))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessAdmin;
