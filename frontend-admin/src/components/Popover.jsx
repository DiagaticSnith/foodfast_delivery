import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Popover({ trigger, children, className = '' }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const popRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (triggerRef.current?.contains(e.target)) return;
      if (popRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const toggle = (e) => {
    const el = triggerRef.current;
    if (!el) return setOpen(o => !o);
    const rect = el.getBoundingClientRect();
    // position popover below the trigger, aligned to right edge when space allows
    const top = rect.bottom + 8; // 8px gap
    let left = rect.left;
    // if right overflow, align to right side
    const viewportW = window.innerWidth || document.documentElement.clientWidth;
    const estWidth = 200;
    if (left + estWidth > viewportW - 12) {
      left = Math.max(12, rect.right - estWidth);
    }
    setPos({ top, left });
    setOpen(o => !o);
  };

  // Render trigger with ref cloning
  const triggerEl = React.cloneElement(trigger, { ref: triggerRef, onClick: (e) => { e.stopPropagation(); toggle(e); trigger.props.onClick && trigger.props.onClick(e); } });

  return (
    <>
      {triggerEl}
      {open && createPortal(
        <div className={`ff-popover ${className}`} style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 110000 }} ref={popRef}>
          <div className="ff-popover__arrow" />
          <div className="ff-popover__content">{children}</div>
        </div>,
        document.body
      )}
    </>
  );
}
