import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/modal.css';

export default function Modal({ open, title, onClose = () => {}, footer, children, size = 'md' }) {
  // Handle ESC key press
  useEffect(() => {
    if (!open) return;
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEsc);
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open, onClose]);
  
  if (!open) return null;
  
  const sizeClass = size === 'lg' ? 'ff-modal--lg' : size === 'xl' ? 'ff-modal--xl' : '';
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Render modal into document.body to avoid CSS containing-block issues
  return createPortal(
    <div className="ff-backdrop" onClick={handleBackdropClick}>
      <div className={`ff-modal ${sizeClass}`} onClick={(e) => e.stopPropagation()}>
        <div className="ff-modal__header">
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
          <button 
            aria-label="Đóng" 
            onClick={onClose} 
            className="ff-button--icon"
            type="button"
          >
            ×
          </button>
        </div>
        <div className="ff-modal__body">
          {children}
        </div>
        {footer && (
          <div className="ff-modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
