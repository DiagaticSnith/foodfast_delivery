import React, { useState, useEffect } from 'react';
import { setAuthToken } from './api/api';
import './assets/style.css';
import './styles/admin.css';
import './styles/pages.css';
import './styles/modal.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ToastProvider';
import Header from './components/Header';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DroneMonitoring from './pages/DroneMonitoring';
import MenuAdmin from './pages/MenuAdmin';


function LogoutAndRedirect({ setUser }) {
  useEffect(() => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {}
    try { setAuthToken(null); } catch {}
    setUser(null);
    // no dependencies - run once
  }, []);
  return <Navigate to="/login" replace />;
}


function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    // Nếu có token trong localStorage thì set lại cho axios
    const token = localStorage.getItem('token');
    if (token) setAuthToken(token);
  }, []);

  return (
      <ToastProvider>
        <Router>
          <Header user={user} setUser={setUser} />
          <Routes>
          {/* Mặc định khi mở root của admin, logout (clear auth) và chuyển tới trang login */}
          <Route path="/" element={<LogoutAndRedirect setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />}/>
          <Route path="/admin/menus" element={<MenuAdmin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/drone-monitoring" element={<DroneMonitoring />} />
        </Routes>
        </Router>
      </ToastProvider>
  );
}

export default App;