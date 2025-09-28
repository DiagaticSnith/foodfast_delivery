import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../api/api';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    cartAPI.getCart().then(res => {
      const items = res.data?.CartItems?.map(ci => ({
        id: ci.menuId,
        name: ci.Menu?.name,
        price: ci.Menu?.price,
        imageUrl: ci.Menu?.imageUrl,
        quantity: ci.quantity
      })) || [];
      setCart(items);
      setTotal(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
    });
  }, []);

  const handleQuantity = async (id, qty) => {
    // TODO: Gọi API cập nhật số lượng nếu cần
    setCart(cart.map(item => item.id === id ? { ...item, quantity: qty > 0 ? qty : 1 } : item));
    setTotal(cart.reduce((sum, item) => sum + item.price * (item.id === id ? (qty > 0 ? qty : 1) : item.quantity), 0));
  };

  return (
    <div style={{width:'100%',background:'#fff',padding:'32px 0'}}>
      <h3 style={{color:'#ff4d4f',margin:'0 0 32px 48px',fontSize:28}}>Giỏ hàng của bạn</h3>
      {cart.length === 0 ? (
        <div style={{color: '#888',marginLeft:48}}>Chưa có món nào trong giỏ hàng.</div>
      ) : (
        <div style={{width:'90%',margin:'0 auto'}}>
          {cart.map((item) => (
            <div className="cart-item" key={item.id} style={{display:'flex',alignItems:'center',borderBottom:'1px solid #eee',padding:'24px 0',gap:32}}>
              <img src={item.imageUrl} alt={item.name} style={{width:120,height:120,objectFit:'cover',borderRadius:12,marginRight:24}} />
              <div style={{flex:1}}>
                <strong style={{fontSize:20}}>{item.name}</strong>
                <div style={{color:'#ff4d4f',fontWeight:'bold',margin:'12px 0',fontSize:18}}>{item.price.toLocaleString()}₫</div>
                <input type="number" min={1} value={item.quantity} style={{width: 56, fontSize:16, padding:'4px 8px', margin:'8px 0'}} onChange={e => handleQuantity(item.id, Number(e.target.value))} />
              </div>
              <button style={{background:'#ff4d4f',color:'#fff',border:'none',borderRadius:6,padding:'10px 20px',cursor:'pointer',fontSize:16}} onClick={async () => {
                await cartAPI.removeFromCart(item.id);
                setCart(cart.filter(i => i.id !== item.id));
                setTotal(cart.filter(i => i.id !== item.id).reduce((sum, i) => sum + i.price * i.quantity, 0));
              }}>Xóa</button>
            </div>
          ))}
        </div>
      )}
      <div style={{width:'90%',margin:'32px auto 0',display:'flex',justifyContent:'flex-end',alignItems:'center'}}>
        <div className="cart-total" style={{fontWeight:'bold',fontSize:22,color:'#ff4d4f',marginRight:32}}>Tổng cộng: {total.toLocaleString()}₫</div>
  <button style={{background:'#ff4d4f',color:'#fff',border:'none',borderRadius:8,padding:'16px 40px',fontSize:20,cursor:'pointer'}} onClick={() => navigate('/checkout', { state: { cart } })}>Đặt hàng</button>
      </div>
    </div>
  );
};

export default Cart;