import BusinessAdmin from './BusinessAdmin';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RestaurantAdmin from './RestaurantAdmin';
import DroneAdmin from './DroneAdmin';
import OrderAdmin from './OrderAdmin';
import UserAdmin from './UserAdmin';
import { useToast } from '../components/ToastProvider';

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'restaurant');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      try { toast.error('Bạn không có quyền truy cập trang này!'); } catch {}
      navigate('/');
    }
  }, [navigate]);

  const changeTab = (newTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // (no-op) keep tab controlled via changeTab / URL initial param

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">Quản lý hệ thống giao hàng FoodFast</p>
      </div>
      <div className="admin-tabs">
        <button 
          onClick={()=>changeTab('restaurant')} 
          className={`admin-tab ${tab==='restaurant' ? 'admin-tab--active' : ''}`}
        >
          <span className="tab-icon">🏢</span>
          <span>Nhà hàng</span>
        </button>
        <button 
          onClick={()=>changeTab('drone')} 
          className={`admin-tab ${tab==='drone' ? 'admin-tab--active' : ''}`}
        >
          <span className="tab-icon">🚁</span>
          <span>Drone</span>
        </button>
        
        <button 
          onClick={()=>changeTab('order')} 
          className={`admin-tab ${tab==='order' ? 'admin-tab--active' : ''}`}
        >
          <span className="tab-icon">📦</span>
          <span>Đơn hàng</span>
        </button>
        <button 
          onClick={()=>changeTab('business')} 
          className={`admin-tab ${tab==='business' ? 'admin-tab--active' : ''}`}
        >
          <span className="tab-icon">🤝</span>
          <span>Đối tác</span>
        </button>
        <button 
          onClick={()=>changeTab('user')} 
          className={`admin-tab ${tab==='user' ? 'admin-tab--active' : ''}`}
        >
          <span className="tab-icon">👥</span>
          <span>Người dùng</span>
        </button>
        <a href="/drone-monitoring" className="admin-tab admin-tab--special">
          <span className="tab-icon">🗺️</span>
          <span>Bản đồ drone</span>
        </a>
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
