import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import '../styles/toast.css';

const ToastContext = createContext({
  show: (message, options) => {},
  success: (message, options) => {},
  error: (message, options) => {},
  info: (message, options) => {},
  warn: (message, options) => {},
});

let idSeq = 1;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});
  const [offsetTop, setOffsetTop] = useState(16);

  // Position below the navbar/header
  useEffect(() => {
    const computeOffset = () => {
      try {
        const header = document.querySelector('header.header') || document.querySelector('header');
        const h = header ? header.getBoundingClientRect().height : 0;
        setOffsetTop(Math.max(8, Math.round(h + 12)));
      } catch {
        setOffsetTop(16);
      }
    };
    computeOffset();
    window.addEventListener('resize', computeOffset);
    return () => window.removeEventListener('resize', computeOffset);
  }, []);

  const hardRemove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const tm = timersRef.current[id];
    if (tm) {
      clearTimeout(tm);
      delete timersRef.current[id];
    }
  }, []);

  // Begin exit animation before final removal
  const startClose = useCallback((id, exitMs = 220) => {
    setToasts((prev) => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    const tm = timersRef.current[id];
    if (tm) {
      clearTimeout(tm);
      delete timersRef.current[id];
    }
    timersRef.current[id] = setTimeout(() => hardRemove(id), exitMs);
  }, [hardRemove]);

  const add = useCallback((message, { type = 'info', duration = 2500 } = {}) => {
    const id = idSeq++;
    const toast = { id, message, type, duration, leaving: false };
    setToasts((prev) => [...prev, toast]);
    timersRef.current[id] = setTimeout(() => startClose(id), duration);
    return id;
  }, [startClose]);

  const ctx = useMemo(() => ({
    show: add,
    success: (m, o) => add(m, { ...(o||{}), type: 'success' }),
    error: (m, o) => add(m, { ...(o||{}), type: 'error' }),
    info: (m, o) => add(m, { ...(o||{}), type: 'info' }),
    warn: (m, o) => add(m, { ...(o||{}), type: 'warn' }),
  }), [add]);

  // Expose a simple global for non-React modules (e.g., axios interceptors)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.ffToast = {
        show: (m, o) => add(m, o),
        success: (m, o) => add(m, { ...(o||{}), type: 'success' }),
        error: (m, o) => add(m, { ...(o||{}), type: 'error' }),
        info: (m, o) => add(m, { ...(o||{}), type: 'info' }),
        warn: (m, o) => add(m, { ...(o||{}), type: 'warn' }),
      };
    }
  }, [add]);

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="ff-toast-container ff-toast-container--below-header" role="status" aria-live="polite" style={{ '--ff-toast-top': `${offsetTop}px` }}>
        {toasts.map((t) => (
          <div key={t.id} className={`ff-toast ff-toast--${t.type} ${t.leaving ? 'ff-toast--leaving' : ''}`} onClick={() => startClose(t.id)}>
            <span className="ff-toast__msg">{t.message}</span>
            <button className="ff-toast__close" aria-label="Đóng" onClick={(e)=>{e.stopPropagation(); startClose(t.id);}}>×</button>
            <div className="ff-toast__progress" style={{ animationDuration: `${t.duration}ms` }} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
