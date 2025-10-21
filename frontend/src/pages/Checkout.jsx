import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MapModal from '../components/MapModal';
import { paymentAPI, orderAPI } from '../api/api';

const Checkout = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [address, setAddress] = useState(user.address || '');
  const [openMap, setOpenMap] = useState(false);
  const [loading, setLoading] = useState(false);
  // Lấy cartItems từ React Router state
  const location = useLocation();
  const cartItems = location.state?.cart || [];
  const userId = JSON.parse(localStorage.getItem('user') || '{}').id || 1;
  const token = localStorage.getItem('token');

  // Nếu giỏ hàng trống, thông báo và chuyển hướng về trang menu
  React.useEffect(() => {
    if (cartItems.length === 0) {
      alert('Giỏ hàng trống. Vui lòng chọn món trước khi thanh toán!');
      setTimeout(() => {
        window.location.href = '/'; // hoặc '/menu' nếu có route menu riêng
      }, 2000);
    }
  }, [cartItems]);

  if (cartItems.length === 0) {
    return (
      <div style={{maxWidth:600,margin:'48px auto',background:'#fff',borderRadius:12,padding:32,boxShadow:'0 2px 8px #eee',textAlign:'center'}}>
        <h2 style={{color:'#ff4d4f',marginBottom:24}}>Giỏ hàng trống</h2>
        <div>Vui lòng chọn món trước khi thanh toán. Đang chuyển về trang menu...</div>
      </div>
    );
  }

  return (
    <div style={{maxWidth:600,margin:'48px auto',background:'#fff',borderRadius:12,padding:32,boxShadow:'0 2px 8px #eee'}}>
      <h2 style={{color:'#ff4d4f',marginBottom:24}}>Thông tin giao hàng</h2>
      <div style={{display:'flex',gap:12,marginBottom:24}}>
        <input
          type="text"
          placeholder="Nhập địa chỉ nhận đồ ăn... hoặc chọn trên bản đồ"
          value={address}
          onChange={e => setAddress(e.target.value)}
          style={{flex:1,padding:'12px',fontSize:18,borderRadius:8,border:'1px solid #eee'}}
        />
        <button type="button" style={{background:'#ff4d4f',color:'#fff',border:'none',borderRadius:8,padding:'0 18px',fontSize:18,cursor:'pointer',height:48}} onClick={()=>setOpenMap(true)}>Chọn vị trí trên bản đồ</button>
      </div>
      <MapModal open={openMap} onClose={()=>setOpenMap(false)} onConfirm={addr=>{setAddress(addr);setOpenMap(false);}} />
      <div style={{display:'flex',gap:16}}>
        <button
          style={{background:'#ff4d4f',color:'#fff',border:'none',borderRadius:8,padding:'16px 40px',fontSize:20,cursor:'pointer',width:'100%'}}
          disabled={!address || loading}
          onClick={async () => {
            setLoading(true);
            console.log('cartItems gửi lên Stripe:', cartItems);
            try {
              const res = await paymentAPI.createStripeSession(cartItems, address, userId, token);
              window.location.href = res.data.url;
            } catch (err) {
              alert('Lỗi tạo session Stripe: ' + err.message);
            }
            setLoading(false);
          }}
        >
          Thanh toán
        </button>
      </div>
    </div>
  );
};

export default Checkout;
