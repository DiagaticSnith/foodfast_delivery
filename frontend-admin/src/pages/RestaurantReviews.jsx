import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { menuAPI, reviewAPI } from '../api/api';
import ReviewCard from '../components/ReviewCard';

export default function RestaurantReviews() {
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');
  const [menus, setMenus] = useState([]);
  const [reviewsByMenu, setReviewsByMenu] = useState({});
  const [loading, setLoading] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    // fetch menus for restaurant
    menuAPI.getMenus({ restaurantId }).then(res => {
      const m = res.data || res;
      setMenus(m);
      // optionally capture restaurant name from first menu
      if (m && m.length > 0 && m[0].Restaurant && m[0].Restaurant.name) setRestaurantName(m[0].Restaurant.name);
      // fetch reviews for each menu in parallel (first page)
      return Promise.all((m || []).map(menu => reviewAPI.getReviews(menu.id).then(r => ({ menuId: menu.id, data: r.data || r }))));
    }).then(results => {
      const map = {};
      (results || []).forEach(item => { map[item.menuId] = item.data.reviews || item.data; });
      setReviewsByMenu(map);
    }).catch(err => {
      console.error('Error loading menus/reviews', err);
    }).finally(() => setLoading(false));
  }, [restaurantId]);

  const handleReply = async (reviewId, text) => {
    try {
      await reviewAPI.postReply ? reviewAPI.postReply(reviewId, { reply: text }) : null;
      // If API doesn't exist, try generic post to /api/reviews/:id/reply
      if (!reviewAPI.postReply) {
        await reviewAPI._axios?.post(`/api/reviews/${reviewId}/reply`, { reply: text });
      }
      // reload lists
      // simplest: re-fetch menus -> reviews
      const m = menus;
      const results = await Promise.all((m || []).map(menu => reviewAPI.getReviews(menu.id).then(r => ({ menuId: menu.id, data: r.data || r }))));
      const map = {};
      (results || []).forEach(item => { map[item.menuId] = item.data.reviews || item.data; });
      setReviewsByMenu(map);
    } catch (e) {
      console.error('reply error', e);
      alert('Lỗi khi gửi phản hồi: ' + (e?.response?.data?.message || e.message));
    }
  };

  const handleHide = async (reviewId) => {
    try {
      await reviewAPI.setStatus(reviewId, 'hidden');
      // update list
      const m = menus;
      const results = await Promise.all((m || []).map(menu => reviewAPI.getReviews(menu.id).then(r => ({ menuId: menu.id, data: r.data || r }))));
      const map = {};
      (results || []).forEach(item => { map[item.menuId] = item.data.reviews || item.data; });
      setReviewsByMenu(map);
    } catch (e) {
      console.error('hide error', e);
      alert('Lỗi khi ẩn đánh giá: ' + (e?.response?.data?.message || e.message));
    }
  };

  return (
    <div className="page" style={{ padding: 20 }}>
      <h2>Đánh giá của nhà hàng {restaurantName || `#${restaurantId}`}</h2>
      {!restaurantId && <div style={{ color: '#666' }}>Vui lòng cung cấp query param <code>?restaurantId=</code></div>}
      {loading && <div>Đang tải...</div>}

      {menus && menus.length === 0 && !loading && <div>Không tìm thấy menu cho nhà hàng này.</div>}

      {menus.map(menu => (
        <div key={menu.id} style={{ marginBottom: 20 }}>
          <h3>{menu.name}</h3>
          <div>
            {(reviewsByMenu[menu.id] || []).length === 0 && <div style={{ color: '#666' }}>Chưa có đánh giá cho món này.</div>}
            {(reviewsByMenu[menu.id] || []).map(r => (
              <ReviewCard key={r.id} review={r} restaurantName={restaurantName} onReply={handleReply} onHide={handleHide} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
