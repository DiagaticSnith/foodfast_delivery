import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, setAuthToken } from '../api/api';

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const res = await userAPI.login({ username, password });
    setAuthToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.setItem('token', res.data.token);
    if (res.data.user?.role === 'admin') {
      navigate('/admin-dashboard');
    } else if (res.data.user?.role === 'restaurant') {
      navigate('/restaurant-dashboard');
    } else {
      navigate('/');
    }
    } catch (err) {
      alert(err.response?.data?.message || 'Đăng nhập thất bại!');
    }
  };

  return (
    <div style={{maxWidth: 400, margin: '48px auto'}}>
      <form className="order-form" onSubmit={handleSubmit}>
        <h3>Đăng nhập tài khoản</h3>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Đăng nhập</button>
        <div style={{marginTop: 16, textAlign: 'center'}}>
          <span>Bạn chưa có tài khoản? </span>
          <button type="button" style={{background: 'none', color: '#ff4d4f', border: 'none', cursor: 'pointer', textDecoration: 'underline'}} onClick={() => navigate('/register')}>Đăng ký ngay</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
