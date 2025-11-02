import React from 'react';

const mapStatus = (raw) => {
  const s = (raw || '').toString().trim();
  const key = s.toLowerCase();
  switch (key) {
    case 'delivering':
    case 'intransit':
    case 'shipping':
      return { label: 'Đang giao', cls: 'ff-badge--info' };
    case 'done':
    case 'delivered':
      return { label: 'Đã giao', cls: 'ff-badge--ok' };
    case 'accepted':
      return { label: 'Đã nhận', cls: 'ff-badge--info' };
    case 'pending':
    case 'restaurantpending':
      return { label: '🕰️ Chờ xác nhận', cls: 'ff-badge--pending' };
    case 'rejected':
    case 'cancelled':
    case 'canceled':
    case 'failed':
      return { label: 'Đã hủy', cls: 'ff-badge--danger' };
    case 'paid':
      return { label: 'Đã thanh toán', cls: 'ff-badge--ok' };
    case 'unpaid':
      return { label: 'Chưa thanh toán', cls: 'ff-badge--danger' };
    case 'active':
      return { label: 'Hoạt động', cls: 'ff-badge--info' };
    case 'hidden':
      return { label: 'Ẩn', cls: 'ff-badge--pending' };
    case 'available':
      return { label: '🟢 Sẵn sàng', cls: 'ff-badge--ok' };
    case 'busy':
      return { label: '🔴 Đang bận', cls: 'ff-badge--danger' };
    case 'maintenance':
      return { label: '🔧 Bảo trì', cls: 'ff-badge--warn' };
    default:
      return { label: s || '—', cls: 'ff-badge--neutral' };
  }
};

export default function StatusBadge({ status, style, className = '' }) {
  const { label, cls } = mapStatus(status);
  return (
    <span className={`ff-badge ${cls} ${className}`} style={style}>{label}</span>
  );
}
