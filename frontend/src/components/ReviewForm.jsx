import React, { useState } from 'react';
import { reviewAPI } from '../api/api';
import { useToast } from './ToastProvider';
import '../styles/reviews.css';

const ReviewForm = ({ menuId, onPosted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const toast = useToast();

  React.useEffect(() => {
    const check = async () => {
      try {
        const raw = localStorage.getItem('user');
        if (!raw) return;
        const user = JSON.parse(raw || '{}');
        if (!user?.id) return;
        const res = await reviewAPI.getReviews(menuId, { page: 1, limit: 1000 });
        const reviews = res.data.reviews || [];
        if (reviews.some(r => r.User && r.User.id === user.id)) setHasReviewed(true);
      } catch (e) {}
    };
    check();
  }, [menuId]);

  const submit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) { try { toast.info('Vui lòng đăng nhập để đánh giá'); } catch {}; return; }
    if (hasReviewed) { try { toast.info('Bạn đã đánh giá món này rồi'); } catch {}; return; }
    try {
      await reviewAPI.postReview(menuId, { rating, comment });
      try { toast.success('Đánh giá thành công'); } catch {}
      setComment(''); setRating(5);
      onPosted && onPosted();
    } catch (err) {
      try { toast.error(err.response?.data?.message || 'Gửi thất bại'); } catch {}
    }
  };

  return (
    <form onSubmit={submit} className="review-form">
      <div className="controls">
        <label style={{fontWeight:700}}>Đánh giá</label>
        <div className="star-select" role="radiogroup" aria-label="Đánh giá">
          {[1,2,3,4,5].map((s) => {
            const isActive = hoverRating ? s <= hoverRating : s <= rating;
            return (
              <button
                key={s}
                type="button"
                aria-checked={rating === s}
                role="radio"
                className={`star-btn ${isActive ? 'active' : ''}`}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onFocus={() => setHoverRating(s)}
                onBlur={() => setHoverRating(0)}
                onClick={() => setRating(s)}
                disabled={hasReviewed}
                title={`${s} sao`}
              >
                ★
              </button>
            );
          })}
        </div>
      </div>
      <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={4} maxLength={1000} placeholder="Viết bình luận..." />
      <div style={{marginTop:8}}>
        <button
          type="submit"
          className="ff-btn ff-btn--success"
          disabled={hasReviewed}
          style={hasReviewed ? { background: '#ccc', cursor: 'not-allowed' } : {}}
        >{hasReviewed ? 'Đã đánh giá' : 'Gửi đánh giá'}</button>
      </div>
    </form>
  );
};

export default ReviewForm;
