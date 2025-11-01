import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { menuAPI, cartAPI } from '../api/api';
import { useToast } from '../components/ToastProvider';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
// ...existing code...

const MenuDetail = () => {
  const { id } = useParams();
  const [menu, setMenu] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviewsRefresh, setReviewsRefresh] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();
// ...existing code...

  useEffect(() => {
    menuAPI.getMenus()
      .then(res => {
        const found = res.data.find(m => m.id === Number(id));
        setMenu(found || null);
        // Lấy các món liên quan cùng nhà hàng, khác id và tên -> random và lấy 4 món
        const candidates = res.data.filter(m => m.restaurantId === (found?.restaurantId) && m.id !== found?.id && m.name !== found?.name);
        // Shuffle (Fisher–Yates)
        for (let i = candidates.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }
        setRelated(candidates.slice(0, 4));
        setError(found ? '' : 'Không tìm thấy sản phẩm');
      })
      .catch(err => {
        setError(err?.response?.data?.message || 'Lỗi kết nối hoặc không tìm thấy sản phẩm');
      });
  }, [id]);

  if (error) return <div className="muted" style={{color:'red'}}>{error}</div>;
  if (!menu) return <div className="muted">Loading...</div>;

  return (
    <div className="menu-detail">
      {/* top: image + info */}
      <div className="menu-detail__grid">
        <div>
          <div className="menu-detail__media">
            <img
              src={menu.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image'}
              alt={menu.name}
              className="menu-detail__img"
            />
          </div>
        </div>
        <div>
          <h2 className="menu-detail__title">{menu.name}</h2>
          <p className="menu-detail__desc">{menu.description}</p>
          <div className="menu-detail__bar">
            <div className="menu-detail__price">{menu.price.toLocaleString()}₫</div>
          </div>
          {menu.inStock === false ? (
            <button className="menu-detail__btn" disabled style={{background:'#f3f4f6',color:'#9ca3af',cursor:'not-allowed'}}>Hết hàng</button>
          ) : menu.status !== 'active' ? (
            <button className="menu-detail__btn" disabled style={{background:'#f3f4f6',color:'#9ca3af',cursor:'not-allowed'}}>Không khả dụng</button>
          ) : (
            <button
              className="menu-detail__btn"
              onClick={async () => {
                await cartAPI.addToCart(menu.id, 1);
                try { toast.success('Đã thêm vào giỏ hàng!'); } catch {}
              }}
            >Đặt món</button>
          )}
        </div>
      </div>

      {/* related */}
      <h4 className="related-title">Cùng nhà hàng</h4>
      <div className="related-grid" style={{gridTemplateColumns:`repeat(${Math.max(1, Math.min(4, related.length || 1))}, 1fr)`}}>
        {related.map(item => (
          <div
            key={item.id}
            onClick={()=>navigate(`/menu/${item.id}`)}
            className="related-card"
          >
            <div className="related-cover">
              <img
                src={item.imageUrl || 'https://via.placeholder.com/400x260?text=Menu'}
                alt={item.name}
                loading="lazy"
              />
            </div>
            <div className="related-body">
              <div className="related-name" title={item.name}>{item.name}</div>
              <div className="related-price">{item.price.toLocaleString()}₫</div>
            </div>
          </div>
        ))}
        {related.length === 0 && <div className="muted">Không có món liên quan</div>}
      </div>

      {/* Reviews */}
      <div>
        <ReviewForm menuId={menu.id} onPosted={() => setReviewsRefresh(r => r + 1)} />
        <ReviewList menuId={menu.id} refresh={reviewsRefresh} />
      </div>
    </div>
  );
};

export default MenuDetail;
