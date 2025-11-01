import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { useToast } from '../components/ToastProvider';
import Modal from '../components/Modal';
import '../styles/admin.css';


const MenuAdmin = () => {
  const [menus, setMenus] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showOnlyHidden, setShowOnlyHidden] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', description: '', category: '', imageUrl: '', restaurantId: '' });
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  // IME-safe search input: keep raw input while composing and only commit search when composition ends
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [page, setPage] = useState(1);
  const toast = useToast();
  const navigate = useNavigate();
  const pageSize = 5;

  const fetchMenus = async () => {
    // if restaurantId is provided via query param, pass it to API to filter
    const params = {};
    if (restaurantId) params.restaurantId = restaurantId;
    // If we're viewing menus for a specific restaurant or requested hidden-only, include hidden items as well
    if (restaurantId || showOnlyHidden) params.includeHidden = 1;
    const res = await api.get('/api/menus', { params });
    setMenus(res.data);
  };
  const fetchRestaurants = async () => {
    const res = await api.get('/api/restaurants');
    setRestaurants(res.data);
  };

  useEffect(() => { fetchMenus(); fetchRestaurants(); }, []);

  // support restaurantId query param to auto-filter
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');

  useEffect(() => {
    fetchRestaurants();
    fetchMenus();
    // eslint-disable-next-line
  }, [restaurantId]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', price: '', description: '', category: '', imageUrl: '', restaurantId: restaurantId || '' });
    setOpenModal(true);
  };

  const handleEdit = (m) => {
    setEditing(m.id);
    setForm({
      name: m.name,
      price: m.price,
      description: m.description,
      category: m.category,
      imageUrl: m.imageUrl,
      restaurantId: restaurantId || m.restaurantId,
      inStock: m.inStock !== false
    });
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa món này?')) return;
    await api.delete(`/api/menus/${id}`);
    fetchMenus();
  };

  const handleSetStatus = async (id, status) => {
    if (status === 'hidden' && !window.confirm('Ẩn món này?')) return;
    try {
      await api.put(`/api/menus/${id}`, { status });
      fetchMenus();
      toast.success(status === 'hidden' ? 'Món đã được ẩn' : 'Món đã được hiện lại');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi';
      toast.error(msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/api/menus/${editing}`, form);
      } else {
        await api.post('/api/menus', form);
      }
      setOpenModal(false);
      setEditing(null);
      setForm({ name: '', price: '', description: '', category: '', imageUrl: '', restaurantId: restaurantId || '' });
      fetchMenus();
    } finally {
      setLoading(false);
    }
  };

  // Search & Pagination
  // Optionally filter to only hidden items, then search by name
  const visibleMenus = menus.filter(m => showOnlyHidden ? (m.status === 'hidden') : true);
  const filtered = visibleMenus.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <h1 className="admin-title">Menu Management</h1>
            <p className="admin-subtitle">Quản lý thực đơn và món ăn</p>
          </div>
          {restaurantId && (
            <div className="admin-header-right">
              <button 
                onClick={() => navigate('/admin')}
                className="ff-btn ff-btn--normal back-btn"
                title="Quay về trang quản lý nhà hàng"
              >
                ← Quay về
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="admin-content">
        <div className="menu-management">
          {restaurantId && (
            <div className="restaurant-context">
              {(() => {
                const r = restaurants.find(x => String(x.id) === String(restaurantId));
                if (!r) return (
                  <div className="restaurant-not-found">
                    <span className="ff-muted">🏢 Nhà hàng: {restaurantId}</span>
                  </div>
                );
                return (
                  <div className="restaurant-info-card">
                    <div className="restaurant-header">
                      <div className="restaurant-icon">
                        🏢
                      </div>
                      <div className="restaurant-badge">
                        <span className="badge-text">Quản lý menu cho</span>
                      </div>
                    </div>
                    <div className="restaurant-content">
                      <div className="restaurant-image-container">
                        {r.imageUrl ? (
                          <img 
                            src={r.imageUrl} 
                            alt={r.name} 
                            className="restaurant-image" 
                            onError={(e)=>{e.currentTarget.style.display='none'}} 
                          />
                        ) : (
                          <div className="restaurant-image-placeholder">
                            <span className="placeholder-icon">🍽️</span>
                          </div>
                        )}
                      </div>
                      <div className="restaurant-details">
                        <h3 className="restaurant-name">{r.name}</h3>
                        {r.address && (
                          <div className="restaurant-address">
                            <span className="address-icon">📍</span>
                            <span className="address-text">{r.address}</span>
                          </div>
                        )}
                        {r.phone && (
                          <div className="restaurant-phone">
                            <span className="phone-icon">📞</span>
                            <span className="phone-text">{r.phone}</span>
                          </div>
                        )}
                        <div className="restaurant-status">
                          <span className="status-badge active">
                            ✅ Hoạt động
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
          <div className="menu-toolbar">
            <div className="toolbar-left">
              <input 
                className="ff-input ff-input--min" 
                value={searchInput} 
                onChange={e=>{
                  const v = e.target.value;
                  setSearchInput(v);
                  if (!isComposing) {
                    setSearch(v);
                    setPage(1);
                  }
                }}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={(e) => {
                  setIsComposing(false);
                  const v = e.target.value;
                  setSearchInput(v);
                  setSearch(v);
                  setPage(1);
                }}
                placeholder="🔍 Tìm kiếm món ăn..." 
              />
              <button
                onClick={()=>{ setShowOnlyHidden(s=>!s); setPage(1); }}
                className={`ff-btn ${showOnlyHidden? 'ff-btn--secondary' : 'ff-btn--normal'}`}
                title="Chỉ hiện món đã ẩn"
              >
                {showOnlyHidden ? '🔎 Chỉ món đã ẩn (Bật)' : '🔎 Chỉ món đã ẩn'}
              </button>
              <button onClick={openCreate} className="menu-add-btn">
                ➕ Thêm món mới
              </button>
            </div>
          </div>
      <Modal
        open={openModal}
        title={editing ? 'Cập nhật món' : 'Thêm món mới'}
        onClose={()=>{setOpenModal(false); setEditing(null);}}
        footer={null}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="menu-form">
          {/* Left: Upload + Preview */}
          <div className="form-left">
            <div className="upload-section">
              <h4 className="section-title">🖼️ Hình ảnh món ăn</h4>
              <div className="upload-area">
                <input 
                  type="file" 
                  accept="image/*" 
                  id="imageUpload"
                  className="file-input"
                  onChange={async (e)=>{
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingImage(true);
                    try {
                      const fd = new FormData();
                      fd.append('image', file);
                      const res = await api.post('/api/upload?folder=menus', fd, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                      });
                      setForm(f=>({...f, imageUrl: res.data.url }));
                    } catch (err) {
                      const msg = err?.response?.data?.message || err?.message || 'Upload ảnh thất bại';
                      try { toast.error(msg); } catch {}
                    } finally {
                      setUploadingImage(false);
                    }
                  }} 
                />
                <label htmlFor="imageUpload" className="upload-label">
                  <div className="upload-content">
                    <span className="upload-icon">📸</span>
                    <span className="upload-text">Chọn ảnh món ăn</span>
                    <span className="upload-subtext">PNG, JPG tối đa 5MB</span>
                  </div>
                </label>
                {uploadingImage && (
                  <div className="upload-status">
                    <span className="loading-text">⏳ Đang tải ảnh...</span>
                  </div>
                )}
              </div>
              {form.imageUrl && (
                <div className="preview-section">
                  <img 
                    src={form.imageUrl} 
                    alt="preview-menu" 
                    className="image-preview" 
                    onError={(e)=>{e.currentTarget.style.display='none';}} 
                  />
                  <button 
                    type="button"
                    onClick={() => setForm(f=>({...f, imageUrl: ''}))}
                    className="remove-image-btn"
                  >
                    🗑️ Xóa ảnh
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Fields */}
          <div className="form-right">
            <div className="form-fields">
              <div className="field-group">
                <label className="field-label">🍴 Tên món ăn</label>
                <input 
                  className="form-input" 
                  value={form.name} 
                  onChange={e=>setForm(f=>({...f,name:e.target.value}))} 
                  placeholder="Nhập tên món ăn" 
                  required 
                />
              </div>
              
              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">💰 Giá tiền</label>
                  <input 
                    className="form-input" 
                    value={form.price} 
                    onChange={e=>setForm(f=>({...f,price:e.target.value}))} 
                    placeholder="0" 
                    type="number" 
                    min={0} 
                    required 
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">🏷️ Phân loại</label>
                  <input 
                    className="form-input" 
                    value={form.category} 
                    onChange={e=>setForm(f=>({...f,category:e.target.value}))} 
                    placeholder="Cơm, bún, phở, nước uống..." 
                  />
                </div>
              </div>
              
              <div className="field-group">
                <label className="field-label">🏢 Nhà hàng</label>
                {restaurantId ? (
                  <div className="restaurant-display">
                    <span className="restaurant-name">
                      {restaurants.find(r=>String(r.id)===String(restaurantId))?.name || `Nhà hàng: ${restaurantId}`}
                    </span>
                  </div>
                ) : (
                  <select 
                    className="form-select" 
                    value={form.restaurantId} 
                    onChange={e=>setForm(f=>({...f,restaurantId:e.target.value}))} 
                    required
                  >
                    <option value="">Chọn nhà hàng</option>
                    {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                )}
              </div>
              
              <div className="field-group">
                <label className="field-label">📝 Mô tả món ăn</label>
                <textarea 
                  className="form-textarea" 
                  value={form.description} 
                  onChange={e=>setForm(f=>({...f,description:e.target.value}))} 
                  placeholder="Mô tả chi tiết về món ăn, nguyên liệu, cách chế biến..." 
                  rows={4} 
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={()=>{setOpenModal(false); setEditing(null);}} 
                className="btn-cancel"
              >
                ❌ Hủy bỏ
              </button>
              <button 
                type="submit" 
                disabled={loading||uploadingImage} 
                className="btn-submit"
              >
                {loading || uploadingImage ? '⏳ Đang xử lý...' : (editing ? '✅ Cập nhật' : '➕ Thêm mới')}
              </button>
            </div>
          </div>
        </form>
      </Modal>
          <div className="menu-table-container">
            <div className="ff-table-wrap">
              <table className="ff-table ff-table--wide menu-table">
                <thead className="ff-thead">
                  <tr>
                    <th className="ff-th">ID</th>
                    <th className="ff-th">🖼️ Ảnh</th>
                    <th className="ff-th">🍴 Tên món</th>
                    <th className="ff-th">💰 Giá</th>
                    <th className="ff-th">🏷️ Phân loại</th>
                    <th className="ff-th">📝 Mô tả</th>
                    <th className="ff-th">✨ Quản lý</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(m => (
                    <tr key={m.id} className="ff-tr menu-row">
                      <td className="ff-td menu-id">{m.id}</td>
                      <td className="ff-td">
                        <div className="menu-image">
                          {m.imageUrl ? (
                            <img src={m.imageUrl} alt={m.name} className="ff-img menu-img" onError={(e)=>{e.currentTarget.style.display='none';}} />
                          ) : (
                            <div className="ff-imgbox menu-placeholder">
                              <span className="ff-imgbox__ph">🍽️</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="ff-td menu-name">
                        <span className="dish-name">{m.name}</span>
                      </td>
                      <td className="ff-td menu-price">
                        <span className="price-value">{Number(m.price).toLocaleString()}₫</span>
                      </td>
                      <td className="ff-td menu-category">
                        <span className="category-tag">{m.category}</span>
                      </td>
                      <td className="ff-td menu-description" title={m.description}>
                        <span className="description-text">{m.description}</span>
                      </td>
                      <td className="ff-td">
                        <div className="table-actions menu-actions">
                          <button 
                            onClick={()=>handleEdit(m)} 
                            className="btn-icon btn-icon--edit-primary"
                            title="Chỉnh sửa thông tin món ăn"
                          >
                            ✨ Chỉnh sửa
                          </button>
                          {m.status === 'hidden' ? (
                            <button
                              onClick={()=>handleSetStatus(m.id, 'active')}
                              className="btn-icon btn-icon--show"
                              title="Hiện lại món ăn"
                            >
                              👁️ Hiện
                            </button>
                          ) : (
                            <button
                              onClick={()=>handleSetStatus(m.id, 'hidden')}
                              className="btn-icon btn-icon--hide"
                              title="Ẩn món ăn khỏi danh sách"
                            >
                              👁️‍🗨️ Ẩn
                            </button>
                          )}
                        </div>
                        {m.status === 'hidden' && (
                          <div className="status-indicator hidden-status">
                            <span className="ff-badge ff-badge--warn">👁️‍🗨️ Đã ẩn</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="menu-pagination">
                <button 
                  onClick={()=>setPage(p=>Math.max(1,p-1))} 
                  disabled={page===1} 
                  className="ff-pagebtn ff-pagebtn--normal"
                >
                  ⬅️ Trước
                </button>
                {Array.from({length:totalPages},(_,i)=>
                  <button 
                    key={i} 
                    onClick={()=>setPage(i+1)} 
                    className={`ff-pagebtn ${page===i+1?'ff-pagebtn--secondary':'ff-pagebtn--normal'}`}
                  >
                    {i+1}
                  </button>
                )}
                <button 
                  onClick={()=>setPage(p=>Math.min(totalPages,p+1))} 
                  disabled={page===totalPages} 
                  className="ff-pagebtn ff-pagebtn--normal"
                >
                  Sau ➡️
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuAdmin;
