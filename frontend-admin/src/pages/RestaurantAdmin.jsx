import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { api } from '../api/api';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const openMenuManager = async (restaurant) => {
    // Navigate to a dedicated admin menu page showing this restaurant's menus
    navigate(`/admin/menus?restaurantId=${restaurant.id}`);
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
        <label className="ff-checkbox">
          <input type="checkbox" checked={showHiddenOnly} onChange={()=>setShowHiddenOnly(v=>{ const nv = !v; setPage(1); return nv; })} /> Chỉ hiện đã ẩn
        </label>
      </div>
      <Modal
        open={openModal}
        title={editing ? '✏️ Cập nhật nhà hàng' : '✨ Thêm nhà hàng mới'}
        onClose={()=>{setOpenModal(false); setEditing(null);}}
        footer={null}
        size="lg"
      >
        <div className="restaurant-form">
          <form onSubmit={handleSubmit} className="ff-stack">
            <div className="form-header">
              <p className="form-description">
                {editing ? 
                  'Cập nhật thông tin nhà hàng. Vui lòng kiểm tra kỹ trước khi lưu.' : 
                  'Thêm một nhà hàng mới vào hệ thống. Tất cả các trường đánh dấu * là bắt buộc.'
                }
              </p>
            </div>
            <div className="form-field">
              <label className="form-label">🏪 Tên nhà hàng</label>
              <input 
                className="ff-input" 
                value={form.name} 
                onChange={e=>setForm(f=>({...f,name:e.target.value}))} 
                placeholder="Ví dụ: Nhà hàng Hương Việt" 
                required 
              />
            </div>
            
            <div className="form-field">
              <label className="form-label">📍 Địa chỉ</label>
              <input 
                className="ff-input" 
                value={form.address} 
                onChange={e=>setForm(f=>({...f,address:e.target.value}))} 
                placeholder="Ví dụ: 123 Nguyễn Văn Cừ, Quận 1, TP.HCM" 
                required 
              />
            </div>
            
            <div className="form-field">
              <label className="form-label">📸 Ảnh nhà hàng</label>
              <div className="file-upload-section">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="file-input"
                  id="restaurant-image-upload"
                  onChange={async (e)=>{
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
                      try { toast.success('Tải ảnh thành công!'); } catch {}
                    } catch (err) {
                      const msg = err?.response?.data?.message || err?.message || 'Upload ảnh thất bại';
                      try { toast.error(msg); } catch {}
                    } finally {
                      setUploadingRestaurantImage(false);
                    }
                  }} 
                />
                <label htmlFor="restaurant-image-upload" className="file-upload-button">
                  <span>📁</span>
                  <span>Chọn ảnh nhà hàng</span>
                </label>
                {uploadingRestaurantImage && (
                  <div className="upload-status">
                    <span className="loading-text">
                      <span>🔄</span>
                      <span>Đang tải ảnh lên...</span>
                    </span>
                  </div>
                )}
              </div>
              
              {form.imageUrl && (
                <div className="image-preview">
                  <button 
                    type="button"
                    className="image-remove-btn"
                    onClick={() => setForm(f => ({...f, imageUrl: ''}))}
                    title="Xóa ảnh"
                  >
                    ×
                  </button>
                  <img 
                    src={form.imageUrl} 
                    alt="preview-restaurant" 
                    className="ff-img--preview-lg" 
                    onError={(e)=>{e.currentTarget.style.display='none';}} 
                  />
                  <div className="preview-label">
                    <span className="preview-text">
                      <span>🖼️</span>
                      <span>Xem trước ảnh nhà hàng</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-field">
              <label className="form-label">📝 Mô tả nhà hàng</label>
              <textarea 
                className="ff-textarea" 
                value={form.description} 
                onChange={e=>setForm(f=>({...f,description:e.target.value}))} 
                placeholder="Mô tả về nhà hàng, món ăn đặc sản, không gian, dịch vụ..." 
                rows={4} 
              />
            </div>
            
            <div className="ff-actions">
              <button 
                type="button" 
                onClick={()=>{setOpenModal(false); setEditing(null);}} 
                className="ff-btn ff-btn--ghost"
              >
                ❌ Hủy bỏ
              </button>
              <button 
                type="submit" 
                disabled={loading||uploadingRestaurantImage} 
                className="ff-btn ff-btn--accent"
              >
                {loading || uploadingRestaurantImage ? (
                  <span>🔄 Đang xử lý...</span>
                ) : (
                  <span>{editing ? '✓ Cập nhật' : '➕ Tạo mới'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
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
                  <div className="table-actions">
                    <button 
                      onClick={()=>openMenuManager(r)} 
                      className="btn-icon btn-icon--menu"
                      title="Quản lý menu"
                    >
                      📋 Menu
                    </button>
                    <button 
                      onClick={()=>handleEdit(r)} 
                      className="btn-icon btn-icon--edit"
                      title="Chỉnh sửa thông tin"
                    >
                      ✏️ Sửa
                    </button>
                    {r.status === 'hidden' ? (
                      <button 
                        onClick={()=>handleRestore(r.id)} 
                        className="btn-icon btn-icon--restore"
                        title="Khôi phục nhà hàng"
                      >
                        🔄 Khôi phục
                      </button>
                    ) : (
                      <button 
                        onClick={()=>handleDelete(r.id)} 
                        className="btn-icon btn-icon--hide"
                        title="Ẩn nhà hàng"
                      >
                        🚫 Ẩn
                      </button>
                    )}
                  </div>
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

      {/* Modal quản lý menu của nhà hàng (màn hình lớn popup) */}
      <Modal open={!!selectedRestaurant} title={selectedRestaurant ? `🍽️ Menu - ${selectedRestaurant.name}` : ''} onClose={()=>{ setSelectedRestaurant(null); setMenus([]); }} footer={null} size="xl">
        <div className="menu-management">
          <div className="menu-toolbar">
            <div className="toolbar-left">
              <button onClick={openCreateMenu} className="ff-btn ff-btn--success menu-add-btn">
                ➕ Thêm món mới
              </button>
              <label className="ff-checkbox menu-filter">
                <input type="checkbox" checked={menuShowHiddenOnly} onChange={()=>{ setMenuPage(1); toggleMenuHiddenOnly(); }} /> 
                <span>👁️‍🗨️ Chỉ hiện món đã ẩn</span>
              </label>
            </div>
            <div className="toolbar-right">
              <button onClick={()=>{ setSelectedRestaurant(null); setMenus([]); }} className="ff-btn ff-btn--ghost close-btn">
                ❌ Đóng
              </button>
            </div>
          </div>
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
                    <th className="ff-th">🟢 Trạng thái</th>
                    <th className="ff-th">⚙️ Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.slice((menuPage-1)*menuPageSize, menuPage*menuPageSize).map(m => (
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
                      <td className="ff-td menu-status">
                        <span className={`ff-badge ${m.status==='hidden' ? 'ff-badge--warn' : 'ff-badge--ok'}`}>
                          {m.status === 'hidden' ? '👁️‍🗨️ Ẩn' : '✅ Hoạt động'}
                        </span>
                      </td>
                      <td className="ff-td">
                        <div className="table-actions">
                          <button 
                            onClick={()=>openEditMenu(m)} 
                            className="btn-icon btn-icon--edit"
                            title="Chỉnh sửa món ăn"
                          >
                            ✏️ Sửa
                          </button>
                          {m.status === 'hidden' ? (
                            <button 
                              onClick={()=>restoreMenu(m.id)} 
                              className="btn-icon btn-icon--restore"
                              title="Khôi phục món ăn"
                            >
                              🔄 Khôi phục
                            </button>
                          ) : (
                            <button 
                              onClick={()=>deleteMenu(m.id)} 
                              className="btn-icon btn-icon--hide"
                              title="Ẩn món ăn"
                            >
                              🚫 Ẩn
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {Math.ceil(menus.length / menuPageSize) > 1 && (
              <div className="menu-pagination">
                <button 
                  onClick={()=>setMenuPage(p=>Math.max(1,p-1))} 
                  disabled={menuPage===1} 
                  className="ff-pagebtn ff-pagebtn--normal"
                >
                  ⬅️ Trước
                </button>
                {Array.from({length: Math.ceil(menus.length / menuPageSize)}, (_,i)=> (
                  <button 
                    key={i} 
                    onClick={()=>setMenuPage(i+1)} 
                    className={`ff-pagebtn ${menuPage===i+1 ? 'ff-pagebtn--secondary' : 'ff-pagebtn--normal'}`}
                  >
                    {i+1}
                  </button>
                ))}
                <button 
                  onClick={()=>setMenuPage(p=>Math.min(Math.ceil(menus.length/menuPageSize),p+1))} 
                  disabled={menuPage===Math.ceil(menus.length/menuPageSize)} 
                  className="ff-pagebtn ff-pagebtn--normal"
                >
                  Sau ➡️
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RestaurantAdmin;
