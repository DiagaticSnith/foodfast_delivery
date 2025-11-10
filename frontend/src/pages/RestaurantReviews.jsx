import React, { useEffect, useState } from 'react';
import { api } from '../api/api';
import ReviewCard from '../components/ReviewCard';

export default function RestaurantReviews() {
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const [menus, setMenus] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'restaurant') return;
    fetchMenusAndReviews();
    // eslint-disable-next-line
  }, []);

  const fetchMenusAndReviews = async () => {
    setLoading(true);
    try {
      // This project stores menu.restaurantId as the owner's user id in many places
      const res = await api.get(`/api/menus?restaurantId=${user.id}`);
      const menus = res.data || [];
      setMenus(menus);

      // fetch reviews for each menu in parallel (first page) and flatten into a single list
      const results = await Promise.all(menus.map(m => api.get(`/api/menus/${m.id}/reviews`).then(r => ({ menu: m, reviews: (r.data?.reviews || []) })).catch(() => ({ menu: m, reviews: [] }))));
      const flat = [];
      (results || []).forEach(item => {
        (item.reviews || []).forEach(rv => {
          // ensure Menu is attached so ReviewCard can show menu name
          rv.Menu = item.menu;
          flat.push(rv);
        });
      });
      // sort by newest first
      flat.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReviewsList(flat);
    } catch (err) {
      setMenus([]);
      setReviewsByMenu({});
    } finally { setLoading(false); }
  };

  if (!user || user.role !== 'restaurant') return (
    <div style={{ padding: 20 }}>
      <h3>Trang dành cho nhà hàng</h3>
      <div>Phải đăng nhập với tài khoản nhà hàng để xem trang này.</div>
    </div>
  );

  return (
    <div className="reviews-container">
      {/* Header Section */}
      <div className="reviews-header">
        <div className="reviews-title">
          <h2>💬 Đánh giá món ăn</h2>
          <p className="reviews-subtitle">Xem phản hồi từ khách hàng về món ăn của bạn</p>
        </div>
        <div className="reviews-stats">
          <div className="stat-card">
            <div className="stat-number">{reviewsList.length}</div>
            <div className="stat-label">Đánh giá</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {reviewsList.length > 0 ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1) : '0.0'}
            </div>
            <div className="stat-label">Điểm TB</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{menus.length}</div>
            <div className="stat-label">Món ăn</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="reviews-content">
        {loading && (
          <div className="reviews-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải đánh giá...</p>
          </div>
        )}
        
        {!loading && menus.length === 0 && (
          <div className="reviews-empty">
            <div className="empty-icon">🍽️</div>
            <h3>Chưa có món ăn nào</h3>
            <p>Hãy thêm món ăn vào menu để nhận đánh giá từ khách hàng.</p>
          </div>
        )}

        {!loading && reviewsList.length === 0 && menus.length > 0 && (
          <div className="reviews-empty">
            <div className="empty-icon">⭐</div>
            <h3>Chưa có đánh giá nào</h3>
            <p>Khi khách hàng đặt hàng và đánh giá món ăn, chúng sẽ xuất hiện ở đây.</p>
          </div>
        )}

        {!loading && reviewsList.length > 0 && (
          <div className="reviews-list">
            {reviewsList.map(r => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}