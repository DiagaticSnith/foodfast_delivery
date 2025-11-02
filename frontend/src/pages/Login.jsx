import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, setAuthToken } from '../api/api';
import { useToast } from '../components/ToastProvider';

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await userAPI.login({ username, password });
      // Disallow admin accounts from logging in via the user frontend
      if (res.data.user?.role === 'admin') {
        // Show generic 'invalid credentials' style message so admin cannot use user login
        try { toast.error('Tên đăng nhập hoặc mật khẩu không đúng'); } catch {}
        return;
      }

      setAuthToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      try { toast.success('Đăng nhập thành công!'); } catch {}
      if (res.data.user?.role === 'restaurant') {
        navigate('/restaurant-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      try { toast.error(err.response?.data?.message || 'Đăng nhập thất bại!'); } catch {}
    }
  };

  return (
    <div className="auth-page">
      <form className="order-form auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <div className="logo">FF</div>
          <div>
            <div className="title">FoodFast</div>
            <div className="auth-subtitle">Giao nhanh, ngon miệng — đăng nhập để tiếp tục</div>
          </div>
        </div>

        <h3>Đăng nhập</h3>

        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          autoFocus
          aria-label="Tên đăng nhập"
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          aria-label="Mật khẩu"
        />

        <div style={{display:'flex',justifyContent:'center',marginTop:6}}>
          <button type="submit" className="auth-cta">Đăng nhập</button>
        </div>

        <div className="auth-actions">
          <div style={{fontSize:12,color:'#6b7280'}}>Chưa có tài khoản?</div>
          <button type="button" className="auth-link" onClick={() => navigate('/register')}>Đăng ký ngay</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
