import React, { useState } from 'react';
import '../styles/pages.css';

function Stars({ value }) {
  const v = Math.round((value || 0) * 2) / 2;
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  return (
    <span className="stars">
      {Array.from({ length: full }).map((_, i) => <span key={i}>★</span>)}
      {half ? <span>☆</span> : null}
      {Array.from({ length: Math.max(0, 5 - full - (half ? 1 : 0)) }).map((_, i) => <span key={`e${i}`}>☆</span>)}
    </span>
  );
}

export default function ReviewCard({ review, restaurantName, onReply, onHide }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleSend = async () => {
    if (!replyText || replyText.trim() === '') return;
    await onReply(review.id, replyText);
    setReplyText('');
    setShowReplyBox(false);
  };

  return (
    <div className="review-card" style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12, borderRadius: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <strong>👤 {review.User?.name || review.User?.username || 'Khách'}</strong>
          {review.orderCode ? <span style={{ marginLeft: 12, color: '#666' }}>#{review.orderCode}</span> : null}
          <div style={{ color: '#666', fontSize: 12 }}>{new Date(review.createdAt).toLocaleString()}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18 }}><Stars value={review.rating} /> ({(review.rating || 0).toFixed(1)})</div>
        </div>
      </div>

      <div style={{ marginBottom: 8 }}><strong>Món ăn:</strong> {review.Menu?.name || '---'}</div>

      <hr />

      <div style={{ whiteSpace: 'pre-wrap', marginBottom: 8, fontSize: 15 }}>{review.comment}</div>

      {/* Images: if present in review.images array */}
      {review.images && review.images.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {review.images.map((u, i) => (
            <img key={i} src={u} alt={`img-${i}`} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 4 }} />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn primary" onClick={() => setShowReplyBox((s) => !s)}>🔵 Trả lời</button>
        <button className="btn" onClick={() => onHide(review.id)}>⚪ Ẩn đánh giá</button>
      </div>

      {showReplyBox && (
        <div style={{ marginTop: 12 }}>
          <div style={{ border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} style={{ width: '100%' }} placeholder={`Nhập phản hồi của quán...`} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button className="btn" onClick={() => { setShowReplyBox(false); setReplyText(''); }}>Hủy</button>
              <button className="btn primary" onClick={handleSend}>Gửi</button>
            </div>
          </div>
        </div>
      )}

      {/* Reply display */}
      {review.reply && (
        <div style={{ marginTop: 12, background: '#f7f9fc', padding: 10, borderRadius: 6 }}>
          <div style={{ fontWeight: 700 }}>{restaurantName || 'Quán'}:</div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{review.reply}</div>
          <div style={{ color: '#666', fontSize: 12, marginTop: 6 }}>→ {new Date(review.replyAt).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
