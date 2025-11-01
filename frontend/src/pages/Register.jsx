import React, { useState } from 'react';
import { userAPI } from '../api/api';
import { useToast } from '../components/ToastProvider';

const Register = ({ setUser, backToLogin }) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      try { toast.error('Mật khẩu xác nhận không khớp!'); } catch {}
      return;
    }
    try {
      const res = await userAPI.register({ username, password, email, name });
      try { toast.success('Đăng ký thành công!'); } catch {}
      window.location.href = '/login';
    } catch (err) {
      try { toast.error(err.response?.data?.message || 'Đăng ký thất bại!'); } catch {}
    }
  };

  return (
    <div className="auth-page">
      <form className="order-form auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <div className="logo">FF</div>
          <div>
            <div className="title">FoodFast</div>
            <div className="auth-subtitle">Tạo tài khoản để đặt món và nhận ưu đãi</div>
          </div>
        </div>

        <h3>Đăng ký</h3>

        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          aria-label="Tên đăng nhập"
        />
        <input
          type="text"
          placeholder="Tên hiển thị"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          aria-label="Tên hiển thị"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          aria-label="Email"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          aria-label="Mật khẩu"
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          aria-label="Xác nhận mật khẩu"
        />

        <div style={{display:'flex',justifyContent:'center',marginTop:6}}>
          <button type="submit" className="auth-cta">Đăng ký</button>
        </div>

        {backToLogin && (
          <div className="auth-actions">
            <div style={{fontSize:12,color:'#6b7280'}}>Đã có tài khoản?</div>
            <button type="button" className="auth-link" onClick={backToLogin}>Quay lại đăng nhập</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Register;
