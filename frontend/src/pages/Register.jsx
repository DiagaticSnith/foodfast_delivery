import React, { useState } from 'react';
import { userAPI } from '../api/api';

const Register = ({ setUser, backToLogin }) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    try {
      const res = await userAPI.register({ username, password, email, name });
      alert('Đăng ký thành công!');
      window.location.href = '/login';
    } catch (err) {
      alert(err.response?.data?.message || 'Đăng ký thất bại!');
    }
  };

  return (
    <div style={{maxWidth: 400, margin: '48px auto'}}>
      <form className="order-form" onSubmit={handleSubmit}>
        <h3>Đăng ký tài khoản mới</h3>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Tên hiển thị"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
        <button type="submit">Đăng ký</button>
        {backToLogin && (
          <div style={{marginTop: 16, textAlign: 'center'}}>
            <button type="button" style={{background: 'none', color: '#ff4d4f', border: 'none', cursor: 'pointer', textDecoration: 'underline'}} onClick={backToLogin}>Quay lại đăng nhập</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Register;
