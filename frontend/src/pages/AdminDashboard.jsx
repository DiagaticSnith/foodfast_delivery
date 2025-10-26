import BusinessAdmin from './BusinessAdmin';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RestaurantAdmin from './RestaurantAdmin';
import MenuAdmin from './MenuAdmin';
import DroneAdmin from './DroneAdmin';
import OrderAdmin from './OrderAdmin';
import UserAdmin from './UserAdmin';

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'restaurant');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
    }
  }, [navigate]);

  const changeTab = (newTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
  };

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 32 }}>
      <h1 style={{ color: '#ff4d4f', marginBottom: 32 }}>Admin Dashboard</h1>
      <div style={{display:'flex',gap:16,marginBottom:32,flexWrap:'wrap'}}>
        <button onClick={()=>changeTab('restaurant')} style={{padding:'10px 24px',borderRadius:8,border:'none',background:tab==='restaurant'?'#ff4d4f':'#eee',color:tab==='restaurant'?'#fff':'#333',fontWeight:600,fontSize:16}}>🏢 Nhà hàng</button>
        <button onClick={()=>changeTab('drone')} style={{padding:'10px 24px',borderRadius:8,border:'none',background:tab==='drone'?'#ff4d4f':'#eee',color:tab==='drone'?'#fff':'#333',fontWeight:600,fontSize:16}}>🚁 Drone</button>
        <button onClick={()=>changeTab('order')} style={{padding:'10px 24px',borderRadius:8,border:'none',background:tab==='order'?'#ff4d4f':'#eee',color:tab==='order'?'#fff':'#333',fontWeight:600,fontSize:16}}>📦 Đơn hàng</button>
        <button onClick={()=>changeTab('business')} style={{padding:'10px 24px',borderRadius:8,border:'none',background:tab==='business'?'#ff4d4f':'#eee',color:tab==='business'?'#fff':'#333',fontWeight:600,fontSize:16}}>🤝 Đối tác</button>
        <button onClick={()=>changeTab('user')} style={{padding:'10px 24px',borderRadius:8,border:'none',background:tab==='user'?'#ff4d4f':'#eee',color:tab==='user'?'#fff':'#333',fontWeight:600,fontSize:16}}>👥 Người dùng</button>
      </div>
      {tab === 'restaurant' && <RestaurantAdmin />}
      {tab === 'drone' && <DroneAdmin />}
      {tab === 'order' && <OrderAdmin />}
      {tab === 'business' && <BusinessAdmin />}
      {tab === 'user' && <UserAdmin />}
    </div>
  );
};

export default AdminDashboard;
