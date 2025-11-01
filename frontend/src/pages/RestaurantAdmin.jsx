import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { api } from '../api/api';
import { useToast } from '../components/ToastProvider';
import Modal from '../components/Modal';
import '../styles/admin.css';


const RestaurantAdmin = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', description: '', imageUrl: '' });
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingRestaurantImage, setUploadingRestaurantImage] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);

  // Menu management within restaurant (inline panel, not modal)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [menuForm, setMenuForm] = useState({ name: '', price: '', description: '', category: '', imageUrl: '' });
  const [menuEditing, setMenuEditing] = useState(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [uploadingMenuImage, setUploadingMenuImage] = useState(false);
  const [menuShowHiddenOnly, setMenuShowHiddenOnly] = useState(false);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [menuPage, setMenuPage] = useState(1);
  const toast = useToast();
  const menuPageSize = 6;

  const fetchRestaurants = async () => {
    const q = showHiddenOnly ? '?status=hidden' : '';
    const res = await axios.get(`/api/restaurants${q}`);
    setRestaurants(res.data);
  };

  useEffect(() => { fetchRestaurants(); }, [showHiddenOnly]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', address: '', description: '', imageUrl: '' });
    setOpenModal(true);
  };

  const handleEdit = (r) => {
    setEditing(r.id);
    setForm({ name: r.name, address: r.address, description: r.description, imageUrl: r.imageUrl || '' });
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ẩn nhà hàng này?')) return;
    await axios.delete(`/api/restaurants/${id}`);
    fetchRestaurants();
  };

  const handleRestore = async (id) => {
    await axios.put(`/api/restaurants/${id}`, { status: 'active' });
    fetchRestaurants();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await axios.put(`/api/restaurants/${editing}`, form);
      } else {
        await axios.post('/api/restaurants', form);
      }
      setOpenModal(false);
      setEditing(null);
      setForm({ name: '', address: '', description: '', imageUrl: '' });
      fetchRestaurants();
    } finally {
      setLoading(false);
    }
  };

  // --- Menu management functions ---
  const openMenuManager = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    setMenuEditing(null);
    setMenuForm({ name: '', price: '', description: '', category: '', imageUrl: '' });
    await fetchMenusFor(restaurant.id, menuShowHiddenOnly);
  };

  const fetchMenusFor = async (restaurantId, hiddenOnlyFlag = false) => {
    const q = hiddenOnlyFlag ? `&status=hidden` : '';
    const res = await api.get(`/api/menus?restaurantId=${restaurantId}${q}`);
    setMenus(res.data);
  };

  const toggleMenuHiddenOnly = async () => {
    const newVal = !menuShowHiddenOnly;
    setMenuShowHiddenOnly(newVal);
    if (selectedRestaurant) {
      await fetchMenusFor(selectedRestaurant.id, newVal);
    }
  };

  const openCreateMenu = () => {
    setMenuEditing(null);
    setMenuForm({ name: '', price: '', description: '', category: '', imageUrl: '' });
    setMenuModalOpen(true);
  };

  const openEditMenu = (m) => {
    setMenuEditing(m.id);
    setMenuForm({ name: m.name, price: m.price, description: m.description || '', category: m.category || '', imageUrl: m.imageUrl || '' });
    setMenuModalOpen(true);
  };

  const submitMenu = async (e) => {
    e.preventDefault();
    if (!selectedRestaurant) return;
    setMenuLoading(true);
    try {
      const body = { ...menuForm, restaurantId: selectedRestaurant.id };
      if (menuEditing) {
        await api.put(`/api/menus/${menuEditing}`, body);
      } else {
        await api.post('/api/menus', body);
      }
  await fetchMenusFor(selectedRestaurant.id, menuShowHiddenOnly);
      setMenuEditing(null);
      setMenuForm({ name: '', price: '', description: '', category: '', imageUrl: '' });
      setMenuModalOpen(false);
    } finally {
      setMenuLoading(false);
    }
  };

  const deleteMenu = async (id) => {
    if (!window.confirm('Ẩn món ăn này?')) return;
    await api.delete(`/api/menus/${id}`);
  if (selectedRestaurant) await fetchMenusFor(selectedRestaurant.id, menuShowHiddenOnly);
  };

  const restoreMenu = async (id) => {
    await api.put(`/api/menus/${id}`, { status: 'active' });
  if (selectedRestaurant) await fetchMenusFor(selectedRestaurant.id, menuShowHiddenOnly);
  };

  // Search & Pagination
  // Chỉ tìm kiếm theo tên nhà hàng
  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div className="ff-page">
      <div className="ff-toolbar">
        <input className="ff-input ff-input--min" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Tìm kiếm nhà hàng..." />
        <button onClick={openCreate} className="ff-btn ff-btn--accent">+ Thêm nhà hàng</button>
        <label className="ff-checkbox">
          <input type="checkbox" checked={showHiddenOnly} onChange={()=>setShowHiddenOnly(v=>{ const nv = !v; setPage(1); return nv; })} /> Chỉ hiện đã ẩn
        </label>
      </div>
      <Modal
        open={openModal}
        title={editing ? 'Cập nhật nhà hàng' : 'Thêm nhà hàng mới'}
        onClose={()=>{setOpenModal(false); setEditing(null);}}
        footer={null}
      >
        <form onSubmit={handleSubmit} className="ff-form">
          <input className="ff-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Tên nhà hàng" required />
          <input className="ff-input" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} placeholder="Địa chỉ" required />
          <div className="ff-row ff-align-center">
            <input type="file" accept="image/*" onChange={async (e)=>{
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadingRestaurantImage(true);
              try {
                const fd = new FormData();
                fd.append('image', file);
                const res = await api.post(`/api/upload?folder=restaurants`, fd, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
                setForm(f=>({...f, imageUrl: res.data.url }));
              } catch (err) {
                const msg = err?.response?.data?.message || err?.message || 'Upload ảnh thất bại';
                try { toast.error(msg); } catch {}
              } finally {
                setUploadingRestaurantImage(false);
              }
            }} />
            {uploadingRestaurantImage && <span style={{fontSize:12,color:'#888'}}>Đang tải ảnh...</span>}
          </div>
          {form.imageUrl && (
            <div className="ff-row ff-align-center">
              <img src={form.imageUrl} alt="preview-restaurant" className="ff-img--preview" onError={(e)=>{e.currentTarget.style.display='none';}} />
              <span style={{color:'#888',fontSize:12}}>Preview</span>
            </div>
          )}
          <textarea className="ff-textarea" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Mô tả" rows={3} />
          <div className="ff-actions ff-mt-4">
            <button type="button" onClick={()=>{setOpenModal(false); setEditing(null);}} className="ff-btn ff-btn--ghost">Hủy</button>
            <button type="submit" disabled={loading||uploadingRestaurantImage} className="ff-btn ff-btn--accent">{editing ? 'Cập nhật' : 'Thêm mới'}</button>
          </div>
        </form>
      </Modal>
      <div className="ff-table-wrap">
  <table className="ff-table ff-table--wide">
          <thead className="ff-thead">
            <tr>
              <th className="ff-th">ID</th>
              <th className="ff-th">Ảnh</th>
              <th className="ff-th">Tên</th>
              <th className="ff-th">Địa chỉ</th>
              <th className="ff-th">Mô tả</th>
              <th className="ff-th">Trạng thái</th>
              <th className="ff-th">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(r => (
              <tr key={r.id} className="ff-tr">
                <td className="ff-td">{r.id}</td>
                <td className="ff-td">
                  <span className="ff-imgbox">
                    {r.imageUrl ? (
                      <img src={r.imageUrl} alt={r.name} className="ff-img" onError={(e)=>{e.currentTarget.style.display='none';}} />
                    ) : (
                      <span className="ff-imgbox__ph">—</span>
                    )}
                  </span>
                </td>
                <td className="ff-td">{r.name}</td>
                <td className="ff-td">{r.address}</td>
                <td className="ff-td">{r.description}</td>
                <td className="ff-td">
                  <span className={`ff-badge ${r.status==='hidden' ? 'ff-badge--warn' : 'ff-badge--ok'}`}>{r.status}</span>
                </td>
                <td className="ff-td">
                  <button onClick={()=>openMenuManager(r)} className="ff-btn ff-btn--primary ff-btn--small" style={{marginRight:6}}>Menu</button>
                  <button onClick={()=>handleEdit(r)} className="ff-btn ff-btn--success ff-btn--small" style={{marginRight:6}}>Sửa</button>
                  {r.status === 'hidden' ? (
                    <button onClick={()=>handleRestore(r.id)} className="ff-btn ff-btn--primary ff-btn--small">Khôi phục</button>
                  ) : (
                    <button onClick={()=>handleDelete(r.id)} className="ff-btn ff-btn--danger ff-btn--small">Ẩn</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="ff-pagination">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="ff-pagebtn ff-pagebtn--normal">Trước</button>
            {Array.from({length:totalPages},(_,i)=>
              <button key={i} onClick={()=>setPage(i+1)} className={`ff-pagebtn ${page===i+1 ? 'ff-pagebtn--active' : 'ff-pagebtn--normal'}`}>{i+1}</button>
            )}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="ff-pagebtn ff-pagebtn--normal">Sau</button>
          </div>
        )}
      </div>

      {/* Modal quản lý menu của nhà hàng */}
      {selectedRestaurant && (
        <div className="ff-panel">
          <div className="ff-panel__header">
            <h3 className="ff-panel__title">Menu - {selectedRestaurant.name}</h3>
            <div className="ff-row ff-align-center ff-gap-12">
              <button onClick={()=>setSelectedRestaurant(null)} className="ff-btn ff-btn--ghost ff-btn--small">Đóng</button>
            </div>
          </div>
          <div className="ff-toolbar">
            <button onClick={openCreateMenu} className="ff-btn ff-btn--success">+ Thêm món</button>
            <label className="ff-checkbox">
              <input type="checkbox" checked={menuShowHiddenOnly} onChange={()=>{ setMenuPage(1); toggleMenuHiddenOnly(); }} /> Chỉ hiện đã ẩn
            </label>
          </div>
          {/* Modal add/edit menu - large preview + tidy grid (same pattern as partner form) */}
          <Modal open={menuModalOpen} title={menuEditing ? 'Cập nhật món' : 'Thêm món mới'} onClose={()=>{ setMenuModalOpen(false); setMenuEditing(null); }} footer={null} size="xl">
            <form onSubmit={submitMenu} className="ff-form ff-2col-xl">
              {/* Left: Upload + Preview */}
              <div className="ff-stack">
                {menuForm.imageUrl ? (
                  <img src={menuForm.imageUrl} alt="preview-menu" className="ff-img--preview-xl" onError={(e)=>{e.currentTarget.style.display='none';}} />
                ) : (
                  <div className="ff-imgbox-xl">🍽️</div>
                )}
                <input type="file" accept="image/*" onChange={async (e)=>{
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingMenuImage(true);
                  try {
                    const fd = new FormData();
                    fd.append('image', file);
                    const res = await api.post(`/api/upload?folder=menus`, fd, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    setMenuForm(f=>({...f, imageUrl: res.data.url }));
                  } catch (err) {
                    const msg = err?.response?.data?.message || err?.message || 'Upload ảnh thất bại';
                    try { toast.error(msg); } catch {}
                  } finally {
                    setUploadingMenuImage(false);
                  }
                }} />
                {uploadingMenuImage && <span className="ff-muted">Đang tải ảnh...</span>}
              </div>
              {/* Right: Fields in tidy grid */}
              <div className="ff-formgrid">
                <input className="ff-input" value={menuForm.name} onChange={e=>setMenuForm(f=>({...f,name:e.target.value}))} placeholder="Tên món" required />
                <input className="ff-input" value={menuForm.price} onChange={e=>setMenuForm(f=>({...f,price:e.target.value}))} placeholder="Giá" type="number" min={0} required />
                <input className="ff-input" value={menuForm.category} onChange={e=>setMenuForm(f=>({...f,category:e.target.value}))} placeholder="Phân loại" />
                <textarea className="ff-textarea ff-colspan-2" value={menuForm.description} onChange={e=>setMenuForm(f=>({...f,description:e.target.value}))} placeholder="Mô tả" rows={6} />
                <div className="ff-actions ff-colspan-2">
                  {menuEditing && <button type="button" onClick={()=>{setMenuEditing(null); setMenuForm({ name: '', price: '', description: '', category: '', imageUrl: '' });}} className="ff-btn ff-btn--ghost">Hủy sửa</button>}
                  <button type="submit" disabled={menuLoading||uploadingMenuImage} className="ff-btn ff-btn--success">{menuEditing ? 'Cập nhật món' : 'Thêm món'}</button>
                </div>
              </div>
            </form>
          </Modal>
          <div style={{maxHeight:360,overflow:'auto'}}>
            <table className="ff-table ff-table--wide">
              <thead>
                <tr style={{background:'#f5f5f5'}}>
                  <th className="ff-th">ID</th>
                  <th className="ff-th">Ảnh</th>
                  <th className="ff-th">Tên</th>
                  <th className="ff-th">Giá</th>
                  <th className="ff-th">Phân loại</th>
                  <th className="ff-th">Trạng thái</th>
                  <th className="ff-th">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {menus.slice((menuPage-1)*menuPageSize, menuPage*menuPageSize).map(m => (
                  <tr key={m.id} className="ff-tr">
                    <td className="ff-td">{m.id}</td>
                    <td className="ff-td">
                      <span className="ff-imgbox">
                        {m.imageUrl ? (
                          <img src={m.imageUrl} alt={m.name} className="ff-img" onError={(e)=>{e.currentTarget.style.display='none';}} />
                        ) : (
                          <span className="ff-imgbox__ph">—</span>
                        )}
                      </span>
                    </td>
                    <td className="ff-td">{m.name}</td>
                    <td className="ff-td">{Number(m.price).toLocaleString()}₫</td>
                    <td className="ff-td">{m.category}</td>
                    <td className="ff-td">{m.status}</td>
                    <td className="ff-td">
                      <button onClick={()=>openEditMenu(m)} className="ff-btn ff-btn--primary ff-btn--small" style={{marginRight:6}}>Sửa</button>
                      {m.status === 'hidden' ? (
                        <button onClick={()=>restoreMenu(m.id)} className="ff-btn ff-btn--primary ff-btn--small">Khôi phục</button>
                      ) : (
                        <button onClick={()=>deleteMenu(m.id)} className="ff-btn ff-btn--danger ff-btn--small">Ẩn</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {Math.ceil(menus.length / menuPageSize) > 1 && (
              <div className="ff-pagination">
                <button onClick={()=>setMenuPage(p=>Math.max(1,p-1))} disabled={menuPage===1} className="ff-pagebtn ff-pagebtn--normal">Trước</button>
                {Array.from({length: Math.ceil(menus.length / menuPageSize)}, (_,i)=> (
                  <button key={i} onClick={()=>setMenuPage(i+1)} className={`ff-pagebtn ${menuPage===i+1 ? 'ff-pagebtn--secondary' : 'ff-pagebtn--normal'}`}>{i+1}</button>
                ))}
                <button onClick={()=>setMenuPage(p=>Math.min(Math.ceil(menus.length/menuPageSize),p+1))} disabled={menuPage===Math.ceil(menus.length/menuPageSize)} className="ff-pagebtn ff-pagebtn--normal">Sau</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantAdmin;
