import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/api';
import RestaurantCard from '../components/RestaurantCard';

const PAGE_SIZE = 12;

const Restaurants = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'name_asc'; // name_asc | name_desc | address_asc | address_desc
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/api/restaurants');
        setRestaurants(res.data || []);
      } catch (e) {
        console.error('Lỗi tải nhà hàng:', e);
        setError('Không thể tải danh sách nhà hàng');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = restaurants.filter(r => (r.name || '').toLowerCase().includes(q.toLowerCase()));
    switch (sort) {
      case 'name_desc':
        list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'address_asc':
        list.sort((a, b) => (a.address || '').localeCompare(b.address || ''));
        break;
      case 'address_desc':
        list.sort((a, b) => (b.address || '').localeCompare(a.address || ''));
        break;
      default:
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return list;
  }, [restaurants, q, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = useMemo(() => filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE), [filtered, pageSafe]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === null || value === '') next.delete(key); else next.set(key, String(value));
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="site-container">
      <div className="toolbar-spread">
        <h2 className="title-accent" style={{margin:0}}>🍽️ Tất cả nhà hàng</h2>
        <button onClick={() => navigate('/')} className="btn btn-ghost">← Trang chủ</button>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Tìm nhà hàng..."
          value={q}
          onChange={(e) => updateParam('q', e.target.value)}
          className="ff-input ff-input--min"
        />
        <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="ff-select">
          <option value="name_asc">Tên A → Z</option>
          <option value="name_desc">Tên Z → A</option>
          <option value="address_asc">Địa chỉ A → Z</option>
          <option value="address_desc">Địa chỉ Z → A</option>
        </select>
      </div>

      {loading && <div className="muted" style={{ padding: 24 }}>Đang tải...</div>}
      {error && <div style={{ padding: 24, color: '#ff4d4f' }}>{error}</div>}

      {!loading && !error && (
        <div className="grid-auto-260">
          {paged.map(r => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => updateParam('page', String(Math.max(1, pageSafe - 1)))} disabled={pageSafe === 1} className="pagebtn pagebtn--outline">Trước</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => updateParam('page', String(i + 1))} className={`pagebtn ${pageSafe === i + 1 ? 'pagebtn--active' : 'pagebtn--ghost'}`}>{i + 1}</button>
          ))}
          <button onClick={() => updateParam('page', String(Math.min(totalPages, pageSafe + 1)))} disabled={pageSafe === totalPages} className="pagebtn pagebtn--outline">Sau</button>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
