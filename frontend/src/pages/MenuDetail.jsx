import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { menuAPI, cartAPI } from '../api/api';
// ...existing code...

const MenuDetail = () => {
  const { id } = useParams();
  const [menu, setMenu] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
// ...existing code...

  useEffect(() => {
    menuAPI.getMenus()
      .then(res => {
        const found = res.data.find(m => m.id === Number(id));
        setMenu(found || null);
        // Lấy các món liên quan cùng nhà hàng, khác id và tên, giới hạn 4 món
        const related = res.data.filter(m => m.restaurantId === (found?.restaurantId) && m.id !== found?.id && m.name !== found?.name).slice(0, 4);
        setRelated(related);
        setError(found ? '' : 'Không tìm thấy sản phẩm');
      })
      .catch(err => {
        setError(err?.response?.data?.message || 'Lỗi kết nối hoặc không tìm thấy sản phẩm');
      });
  }, [id]);

  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!menu) return <div>Loading...</div>;

  return (
    <div style={{maxWidth:900,margin:'32px auto',background:'#fff',borderRadius:12,padding:32,boxShadow:'0 2px 8px #eee'}}>
      <h2 style={{color:'#ff4d4f',marginBottom:16}}>{menu.name}</h2>
      <img src={menu.imageUrl} alt={menu.name} style={{width:260,borderRadius:8,marginBottom:16}} />
      <p style={{fontSize:18}}>{menu.description}</p>
      <div style={{fontWeight:'bold',color:'#ff4d4f',fontSize:20,marginBottom:24}}>Giá: {menu.price.toLocaleString()}₫</div>
      <button
        style={{background:'#ff4d4f',color:'#fff',border:'none',borderRadius:8,padding:'12px 32px',fontWeight:600,fontSize:18,cursor:'pointer',marginBottom:24}}
        onClick={async () => {
          await cartAPI.addToCart(menu.id, 1);
          alert('Đã thêm vào giỏ hàng!');
        }}
      >Đặt món</button>
      <h4 style={{marginTop:32,marginBottom:16}}>Cùng nhà hàng</h4>
      <div style={{display:'flex',gap:24,justifyContent:'space-between',flexWrap:'wrap'}}>
        {related.map(item => (
          <div key={item.id} style={{border:'1px solid #eee',borderRadius:12,padding:16,minWidth:180,cursor:'pointer',background:'#fafafa',transition:'box-shadow 0.2s'}} onClick={()=>navigate(`/menu/${item.id}`)}>
            <strong style={{fontSize:17}}>{item.name}</strong>
            <div style={{color:'#ff4d4f',fontWeight:'bold',margin:'8px 0'}}>{item.price.toLocaleString()}₫</div>
          </div>
        ))}
        {related.length === 0 && <div style={{color:'#888'}}>Không có món liên quan</div>}
      </div>
    </div>
  );
};

export default MenuDetail;
