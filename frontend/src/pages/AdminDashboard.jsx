import ShipperAdmin from './ShipperAdmin';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantAdmin from './RestaurantAdmin';
import MenuAdmin from './MenuAdmin';
import DroneAdmin from './DroneAdmin';
import OrderAdmin from './OrderAdmin';

const AdminDashboard = () => {
  const [tab, setTab] = useState('manage');
  const [subTab, setSubTab] = useState('restaurant');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
    }
  }, [navigate]);

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 32 }}>
      <h1 style={{ color: '#ff4d4f', marginBottom: 32 }}>Admin Dashboard</h1>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <button onClick={() => setTab('manage')} style={{ padding: '10px 32px', borderRadius: 8, border: 'none', background: tab === 'manage' ? '#ff4d4f' : '#eee', color: tab === 'manage' ? '#fff' : '#333', fontWeight: 600, fontSize: 18 }}>Quản trị dữ liệu</button>
        <button onClick={() => setTab('monitor')} style={{ padding: '10px 32px', borderRadius: 8, border: 'none', background: tab === 'monitor' ? '#ff4d4f' : '#eee', color: tab === 'monitor' ? '#fff' : '#333', fontWeight: 600, fontSize: 18 }}>Monitoring Dashboard</button>
      </div>
      {tab === 'manage' && (
        <div>
          <h2>Quản lý Nhà hàng, Menu, Session giao hàng, Drone</h2>
          <div style={{display:'flex',gap:16,margin:'24px 0'}}>
            <button onClick={()=>setSubTab('restaurant')} style={{padding:'10px 32px',borderRadius:8,border:'none',background:subTab==='restaurant'?'#ff4d4f':'#eee',color:subTab==='restaurant'?'#fff':'#333',fontWeight:600,fontSize:16}}>Quản lý Nhà hàng</button>
            <button onClick={()=>setSubTab('menu')} style={{padding:'10px 32px',borderRadius:8,border:'none',background:subTab==='menu'?'#189c38':'#eee',color:subTab==='menu'?'#fff':'#333',fontWeight:600,fontSize:16}}>Quản lý Menu</button>
            <button onClick={()=>setSubTab('drone')} style={{padding:'10px 32px',borderRadius:8,border:'none',background:subTab==='drone'?'#189c38':'#eee',color:subTab==='drone'?'#fff':'#333',fontWeight:600,fontSize:16}}>Quản lý Drone</button>
            <button onClick={()=>setSubTab('order')} style={{padding:'10px 32px',borderRadius:8,border:'none',background:subTab==='order'?'#ff4d4f':'#eee',color:subTab==='order'?'#fff':'#333',fontWeight:600,fontSize:16}}>Quản lý Đơn hàng</button>
            <button onClick={()=>setSubTab('shipper')} style={{padding:'10px 32px',borderRadius:8,border:'none',background:subTab==='shipper'?'#189c38':'#eee',color:subTab==='shipper'?'#fff':'#333',fontWeight:600,fontSize:16}}>Quản lý Shipper</button>
          </div>
          {subTab === 'restaurant' && <RestaurantAdmin />}
          {subTab === 'menu' && <MenuAdmin />}
          {subTab === 'drone' && <DroneAdmin />}
          {subTab === 'order' && <OrderAdmin />}
          {subTab === 'shipper' && <ShipperAdmin />}
        </div>
      )}
      {tab === 'monitor' && (
        <div>
          <h2>Theo dõi hệ thống & Metrics real-time</h2>
          {/* TODO: Thêm các component hiển thị metrics, health, trạng thái drone, đơn hàng... */}
          <div style={{marginTop:24, color:'#888'}}>Đang phát triển module monitoring...</div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
