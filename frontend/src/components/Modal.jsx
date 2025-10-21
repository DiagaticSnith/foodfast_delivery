import React from 'react';
import '../styles/modal.css';

export default function Modal({ open, title, onClose, footer, children, size = 'md' }) {
  if (!open) return null;
  const sizeClass = size === 'lg' ? 'ff-modal--lg' : size === 'xl' ? 'ff-modal--xl' : '';
  return (
    <div className="ff-backdrop" onClick={onClose}>
      <div className={`ff-modal ${sizeClass}`} onClick={(e)=>e.stopPropagation()}>
        <div className="ff-modal__header">
          <div>{title}</div>
          <button aria-label="Close" onClick={onClose} className="ff-button--icon">&times;</button>
        </div>
        <div className="ff-modal__body">{children}</div>
        {footer && <div className="ff-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
