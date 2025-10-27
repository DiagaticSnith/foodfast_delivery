import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { menuAPI } from '../api/api';
import MenuItem from '../components/MenuItem';

const PAGE_SIZE = 12;

const Menus = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // URL params -> local state
  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'default'; // default | price_asc | price_desc | name_asc | name_desc
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await menuAPI.getMenus(q ? { search: q } : undefined);
        setMenus(res.data || []);
      } catch (e) {
        console.error('Lỗi tải danh sách món:', e);
        setError('Không thể tải danh sách món ăn');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [q]);

  const sortedMenus = useMemo(() => {
    const list = [...menus];
    switch (sort) {
      case 'price_asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return list.sort((a, b) => b.price - a.price);
      case 'name_asc':
        return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'name_desc':
        return list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      default:
        return list;
    }
  }, [menus, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedMenus.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = useMemo(() => sortedMenus.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE), [sortedMenus, pageSafe]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === null || value === '') next.delete(key); else next.set(key, String(value));
    // Reset to page 1 when search/sort changes
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: '#ff4d4f' }}>🥡 Tất cả món ăn</h2>
        <button onClick={() => navigate('/')} style={{ background:'#eee', border:'1px solid #ddd', borderRadius:8, padding:'8px 14px', cursor:'pointer' }}>← Trang chủ</button>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Tìm món..."
          value={q}
          onChange={(e) => updateParam('q', e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', minWidth: 260 }}
        />
        <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}>
          <option value="default">Sắp xếp: Mặc định</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
          <option value="name_asc">Tên A → Z</option>
          <option value="name_desc">Tên Z → A</option>
        </select>
      </div>

      {loading && <div style={{ padding: 24, color: '#666' }}>Đang tải...</div>}
      {error && <div style={{ padding: 24, color: '#ff4d4f' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {paged.map(menu => (
            <MenuItem key={menu.id} item={menu} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '20px 0' }}>
          <button onClick={() => updateParam('page', String(Math.max(1, pageSafe - 1)))} disabled={pageSafe === 1} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #eee', background: '#fff', cursor: pageSafe === 1 ? 'not-allowed' : 'pointer' }}>Trước</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => updateParam('page', String(i + 1))} style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: pageSafe === i + 1 ? '#ff4d4f' : '#eee', color: pageSafe === i + 1 ? '#fff' : '#333', cursor: 'pointer' }}>{i + 1}</button>
          ))}
          <button onClick={() => updateParam('page', String(Math.min(totalPages, pageSafe + 1)))} disabled={pageSafe === totalPages} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #eee', background: '#fff', cursor: pageSafe === totalPages ? 'not-allowed' : 'pointer' }}>Sau</button>
        </div>
      )}
    </div>
  );
};

export default Menus;
