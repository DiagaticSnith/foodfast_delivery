import React, { useEffect, useState } from 'react';
import { reviewAPI } from '../api/api';
import { useToast } from './ToastProvider';
import '../styles/reviews.css';

const ReviewList = ({ menuId, refresh }) => {
  const [reviews, setReviews] = useState([]);
  const [avg, setAvg] = useState(0);
  const [page, setPage] = useState(1);
  const toast = useToast();

  // re-fetch when menuId, page or refresh counter changes
  useEffect(() => { fetch(); }, [menuId, page, refresh]);

  const fetch = async () => {
    try {
      const res = await reviewAPI.getReviews(menuId, { page, limit: 10 });
      setReviews(res.data.reviews || []);
      setAvg(res.data.avgRating || 0);
    } catch (err) {
      try { toast.error('Không tải được đánh giá'); } catch {}
    }
  };

  const initials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();
  };

  return (
    <div className="review-wrap">
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
        <h4 style={{margin:0}}>Đánh giá</h4>
        <div style={{fontWeight:700,color:'#ffb400'}}>{avg} ★</div>
      </div>

      <div className="review-list">
        {reviews.length === 0 && <div className="review-empty">Chưa có đánh giá nào.</div>}
        {reviews.map(r => (
          <div key={r.id} className="review-card">
            <div className="review-avatar">{initials(r.User?.name || r.User?.username)}</div>
            <div className="review-body">
              <div className="review-meta">
                <div className="review-name">{r.User?.name || r.User?.username}</div>
                <div className="review-date">{new Date(r.createdAt).toLocaleString()}</div>
                <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
              </div>
              <div className="review-comment">{r.comment}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
