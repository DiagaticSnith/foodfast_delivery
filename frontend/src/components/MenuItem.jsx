import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../api/api';
import { useToast } from './ToastProvider';

const MenuItem = ({ item }) => {
  const navigate = useNavigate();
  const [msg, setMsg] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const toast = useToast();
  const handleClick = () => {
    navigate(`/menu/${item.id}`);
  };
  const handleOrder = async (e) => {
    e.stopPropagation();
    if (!user) {
      try { toast.info('Vui lòng đăng nhập để đặt món'); } catch {}
      return;
    }
    if (item.inStock === false || item.status !== 'active') {
      try { toast.info('Món hiện không thể đặt (hết hàng hoặc đã ẩn)'); } catch {}
      return;
    }
    try {
      await cartAPI.addToCart(item.id, 1);
      try { toast.success('Đã thêm vào giỏ hàng!'); } catch {}
    } catch (err) {
      try { toast.error('Có lỗi khi thêm vào giỏ hàng!'); } catch {}
    }
  };
  return (
    <div className="menu-item" style={{ cursor: 'pointer', position: 'relative', background:'#fff', borderRadius:12, boxShadow:'0 2px 8px #eee', padding:24, margin:12, minWidth:240, maxWidth:320, display:'inline-block', verticalAlign:'top' }} onClick={handleClick}>
      {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 12}} />}
      <h4 style={{margin:'8px 0', color:'#ff4d4f', fontSize:20}}>{item.name}</h4>
      <p style={{minHeight:40}}>{item.description || 'Món ăn nhanh, giao tận nơi!'}</p>
      <div className="price" style={{fontWeight:'bold', color:'#ff4d4f', margin:'8px 0 16px'}}>
        Giá: {item.price.toLocaleString()}₫
      </div>
  {item.inStock === false ? (
    <button disabled style={{background:'#f3f4f6',color:'#9ca3af',border:'none',borderRadius:8,padding:'10px 28px',fontWeight:600,fontSize:16,cursor:'not-allowed'}}>Hết hàng</button>
  ) : item.status !== 'active' ? (
    <button disabled style={{background:'#f3f4f6',color:'#9ca3af',border:'none',borderRadius:8,padding:'10px 28px',fontWeight:600,fontSize:16,cursor:'not-allowed'}}>Không khả dụng</button>
  ) : (
    <button onClick={handleOrder} style={{background:'#ff4d4f',color:'#fff',border:'none',borderRadius:8,padding:'10px 28px',fontWeight:600,fontSize:16,cursor:'pointer'}}>Đặt món</button>
  )}
    </div>
  );
};

export default MenuItem;
