import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CheckoutCancel.css';

function CheckoutCancel() {
  const navigate = useNavigate();

  return (
    <div className="checkout-cancel-container">
      <div className="cancel-card">
        <div className="cancel-icon">❌</div>
        <h1>Thanh toán bị hủy</h1>
        <p className="cancel-message">
          Bạn đã hủy thanh toán. Đơn hàng của bạn chưa được xử lý.
        </p>
        <p className="cancel-submessage">
          Giỏ hàng của bạn vẫn được giữ nguyên. Bạn có thể quay lại và thử lại bất cứ lúc nào.
        </p>
        
        <div className="cancel-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate('/checkout')}
          >
            🔄 Thử lại thanh toán
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/cart')}
          >
            🛒 Quay lại giỏ hàng
          </button>
          <button 
            className="btn-text"
            onClick={() => navigate('/')}
          >
            🏠 Về trang chủ
          </button>
        </div>

        <div className="cancel-help">
          <p>Cần hỗ trợ? <a href="mailto:support@foodfast.com">Liên hệ với chúng tôi</a></p>
        </div>
      </div>
    </div>
  );
}

export default CheckoutCancel;
