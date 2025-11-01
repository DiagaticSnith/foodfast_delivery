import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MapModal from '../components/MapModal';
import { paymentAPI, orderAPI, userAPI } from '../api/api';
import { useToast } from '../components/ToastProvider';

const Checkout = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [address, setAddress] = useState(user.address || '');
  const [openMap, setOpenMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  // Lấy cartItems từ React Router state
  const location = useLocation();
  const cartItems = location.state?.cart || [];
  const userId = user.id || 1;
  const userEmail = user.email || '';
  const token = localStorage.getItem('token');
  const toast = useToast();

  // Nếu giỏ hàng trống, thông báo và chuyển hướng về trang menu
  React.useEffect(() => {
    if (cartItems.length === 0) {
      try { toast.info('Giỏ hàng trống. Vui lòng chọn món trước khi thanh toán!'); } catch {}
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
    <div style={{maxWidth:800,margin:'48px auto',background:'#fff',borderRadius:12,padding:32,boxShadow:'0 2px 8px #eee'}}>
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
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:24}}>
        <input id="saveAddress" type="checkbox" checked={saveAddress} onChange={e=>setSaveAddress(e.target.checked)} />
        <label htmlFor="saveAddress">Lưu địa chỉ này vào tài khoản cho lần sau</label>
      </div>
      <MapModal open={openMap} onClose={()=>setOpenMap(false)} onConfirm={addr=>{setAddress(addr);setOpenMap(false);}} />
      {/* Order summary */}
      <div style={{marginTop:8,marginBottom:24}}>
        <h3 style={{margin:'12px 0'}}>Đơn hàng của bạn</h3>
        <div style={{border:'1px solid #eee',borderRadius:8,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead style={{background:'#fafafa'}}>
              <tr>
                <th style={{padding:'10px 12px',textAlign:'left'}}>Món</th>
                <th style={{padding:'10px 12px',textAlign:'center'}}>Số lượng</th>
                <th style={{padding:'10px 12px',textAlign:'right'}}>Đơn giá</th>
                <th style={{padding:'10px 12px',textAlign:'right'}}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((it, idx) => {
                const name = it.name || it.Menu?.name || `Món #${it.menuId || idx+1}`;
                const qty = Number(it.quantity || it.qty || 1);
                const price = Number(it.price || it.Menu?.price || 0);
                const line = price * qty;
                return (
                  <tr key={idx} style={{borderTop:'1px solid #f5f5f5'}}>
                    <td style={{padding:'10px 12px'}}>{name}</td>
                    <td style={{padding:'10px 12px',textAlign:'center'}}>{qty}</td>
                    <td style={{padding:'10px 12px',textAlign:'right'}}>{price.toLocaleString()}₫</td>
                    <td style={{padding:'10px 12px',textAlign:'right',fontWeight:600}}>{line.toLocaleString()}₫</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{display:'flex',justifyContent:'space-between',padding:'12px',background:'#fafafa',borderTop:'1px solid #eee',fontWeight:700}}>
            <span>Tổng cộng</span>
            <span>{cartItems.reduce((s,it)=>s + Number(it.price || it.Menu?.price || 0) * Number(it.quantity || it.qty || 1),0).toLocaleString()}₫</span>
          </div>
        </div>
      </div>

      <div style={{display:'flex',gap:16}}>
        <button
          style={{background:'#ff4d4f',color:'#fff',border:'none',borderRadius:8,padding:'16px 40px',fontSize:20,cursor:'pointer',width:'100%'}}
          disabled={!address || loading}
          onClick={async () => {
            setLoading(true);
            console.log('cartItems gửi lên Stripe:', cartItems);
            try {
              // Optionally update user address before paying
              if (saveAddress && userId && address && address !== (user.address || '')) {
                try {
                  await userAPI.updateInfo(userId, { address });
                  const newUser = { ...user, address };
                  localStorage.setItem('user', JSON.stringify(newUser));
                } catch (e) {
                  console.warn('Không thể lưu địa chỉ vào tài khoản:', e?.message || e);
                }
              }
              const res = await paymentAPI.createStripeSession(cartItems, address, userId, userEmail, token);
              window.location.href = res.data.url;
            } catch (err) {
              try { toast.error('Lỗi tạo session Stripe: ' + err.message); } catch {}
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
