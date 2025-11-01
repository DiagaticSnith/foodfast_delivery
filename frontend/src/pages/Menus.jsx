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
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price_desc':
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name_asc':
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name_desc':
        list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      default:
        break;
    }
    return list;
  }, [menus, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedMenus.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = useMemo(() => sortedMenus.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE), [sortedMenus, pageSafe]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === null || value === '') next.delete(key); else next.set(key, String(value));
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="site-container">
      <div className="toolbar-spread">
        <h2 className="title-accent" style={{margin:0}}>🥡 Tất cả món ăn</h2>
        <button onClick={() => navigate('/')} className="btn btn-ghost">← Trang chủ</button>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Tìm món..."
          value={q}
          onChange={(e) => updateParam('q', e.target.value)}
          className="ff-input ff-input--min"
        />
        <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="ff-select">
          <option value="default">Mặc định</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
          <option value="name_asc">Tên A → Z</option>
          <option value="name_desc">Tên Z → A</option>
        </select>
      </div>

      {loading && <div className="muted" style={{ padding: 24 }}>Đang tải...</div>}
      {error && <div style={{ padding: 24, color: '#ff4d4f' }}>{error}</div>}

      {!loading && !error && (
        <div className="grid-auto-240">
          {paged.map(m => (
            <MenuItem key={m.id} item={m} />
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

export default Menus;
