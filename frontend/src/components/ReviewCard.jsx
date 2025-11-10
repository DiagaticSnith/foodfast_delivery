import React from 'react';
import '../styles/reviews.css';

const Stars = ({ value }) => {
  const v = Math.round((value || 0) * 1) / 1;
  return <span className="review-stars">{'★'.repeat(v)}{'☆'.repeat(5 - v)}</span>;
};

export default function ReviewCard({ review }) {
  return (
    <div className="modern-review-card">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            <span>{(review.User?.name || review.User?.username || 'K')[0].toUpperCase()}</span>
          </div>
          <div className="reviewer-details">
            <div className="reviewer-name">
              {review.User?.name || review.User?.username || 'Khách hàng'}
            </div>
            <div className="review-date">
              {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
        <div className="review-rating">
          <Stars value={review.rating} />
          <span className="rating-number">({(review.rating||0).toFixed(1)})</span>
        </div>
      </div>

      <div className="review-menu-info">
        <span className="menu-label">Món ăn:</span>
        <span className="menu-name">{review.Menu?.name || '---'}</span>
      </div>

      {review.comment && (
        <div className="review-comment">
          <p>{review.comment}</p>
        </div>
      )}

      {review.images && review.images.length > 0 && (
        <div className="review-images">
          {review.images.map((url, i) => (
            <div key={i} className="review-image-wrapper">
              <img src={url} alt={`Ảnh đánh giá ${i + 1}`} className="review-image" />
            </div>
          ))}
        </div>
      )}

      {review.reply && (
        <div className="review-reply">
          <div className="reply-header">
            <span className="reply-icon">💬</span>
            <span className="reply-label">Phản hồi từ quán:</span>
          </div>
          <div className="reply-content">{review.reply}</div>
          <div className="reply-date">
            {new Date(review.replyAt).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      )}
    </div>
  );
}