import React, { useEffect, useState } from 'react';
import { api } from '../api/api';
import { useToast } from '../components/ToastProvider';
import Modal from '../components/Modal';
import '../styles/admin.css';


const MenuAdmin = () => {
  const [menus, setMenus] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', description: '', category: '', imageUrl: '', restaurantId: '' });
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const toast = useToast();
  const pageSize = 5;

  const fetchMenus = async () => {
    const res = await api.get('/api/menus');
    setMenus(res.data);
  };
  const fetchRestaurants = async () => {
    const res = await api.get('/api/restaurants');
    setRestaurants(res.data);
  };

  useEffect(() => { fetchMenus(); fetchRestaurants(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', price: '', description: '', category: '', imageUrl: '', restaurantId: '' });
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
      restaurantId: m.restaurantId,
      inStock: m.inStock !== false
    });
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa món này?')) return;
    await api.delete(`/api/menus/${id}`);
    fetchMenus();
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
      setForm({ name: '', price: '', description: '', category: '', imageUrl: '', restaurantId: '' });
      fetchMenus();
    } finally {
      setLoading(false);
    }
  };

  // Search & Pagination
  // Chỉ tìm kiếm theo tên món
  const filtered = menus.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div className="ff-page">
      <div className="ff-toolbar">
        <input className="ff-input ff-input--min" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Tìm kiếm menu..." />
        <button onClick={openCreate} className="ff-btn ff-btn--success">+ Thêm món</button>
      </div>
      <Modal
        open={openModal}
        title={editing ? 'Cập nhật món' : 'Thêm món mới'}
        onClose={()=>{setOpenModal(false); setEditing(null);}}
        footer={null}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="ff-form ff-2col">
          {/* Left: Upload + Preview */}
          <div>
            <div className="ff-row" style={{flexDirection:'column', gap:12}}>
              <input type="file" accept="image/*" onChange={async (e)=>{
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
              }} />
              {uploadingImage && <span className="ff-muted">Đang tải ảnh...</span>}
              {form.imageUrl && (
                <img src={form.imageUrl} alt="preview-menu" className="ff-img--preview-lg" onError={(e)=>{e.currentTarget.style.display='none';}} />
              )}
            </div>
          </div>
          {/* Right: Fields */}
          <div>
            <input className="ff-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Tên món" required />
            <div className="ff-row">
              <input className="ff-input ff-flex-1" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="Giá" type="number" min={0} required />
              <input className="ff-input ff-flex-1" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} placeholder="Phân loại" />
            </div>
            <select className="ff-select" value={form.restaurantId} onChange={e=>setForm(f=>({...f,restaurantId:e.target.value}))} required>
              <option value="">Chọn nhà hàng</option>
              {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <textarea className="ff-textarea" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Mô tả" rows={4} />
            <div className="ff-actions ff-mt-4">
              <button type="button" onClick={()=>{setOpenModal(false); setEditing(null);}} className="ff-btn ff-btn--ghost">Hủy</button>
              <button type="submit" disabled={loading||uploadingImage} className="ff-btn ff-btn--success">{editing ? 'Cập nhật' : 'Thêm mới'}</button>
            </div>
          </div>
        </form>
      </Modal>
      <div className="ff-table-wrap">
  <table className="ff-table ff-table--wide">
          <thead>
            <tr style={{background:'#fafafa',fontWeight:600}}>
              <th className="ff-th">ID</th>
              <th className="ff-th">Tên</th>
              <th className="ff-th">Giá</th>
              <th className="ff-th">Phân loại</th>
              <th className="ff-th">Nhà hàng</th>
              <th className="ff-th">Ảnh</th>
              <th className="ff-th">Mô tả</th>
              <th className="ff-th"></th>
            </tr>
          </thead>
          <tbody>
            {paged.map(m => (
              <tr key={m.id} className="ff-tr">
                <td className="ff-td">{m.id}</td>
                <td className="ff-td">{m.name}</td>
                <td className="ff-td">{Number(m.price).toLocaleString()}₫</td>
                <td className="ff-td">{m.category}</td>
                <td className="ff-td">{restaurants.find(r=>r.id===m.restaurantId)?.name || m.restaurantId}</td>
                <td className="ff-td">
                  <span className="ff-imgbox">
                    {m.imageUrl ? (
                      <img src={m.imageUrl} alt={m.name} className="ff-img" onError={(e)=>{e.currentTarget.style.display='none';}} />
                    ) : (
                      <span className="ff-imgbox__ph">—</span>
                    )}
                  </span>
                </td>
                <td className="ff-td" style={{maxWidth:180,whiteSpace:'pre-line',overflow:'hidden',textOverflow:'ellipsis'}}>{m.description}</td>
                <td className="ff-td">
                  <button onClick={()=>handleEdit(m)} className="ff-btn ff-btn--success ff-btn--small ff-mr-6">Sửa</button>
                  <button onClick={()=>handleDelete(m.id)} className="ff-btn ff-btn--danger ff-btn--small">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="ff-pagination">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="ff-pagebtn ff-pagebtn--normal">Trước</button>
            {Array.from({length:totalPages},(_,i)=>
              <button key={i} onClick={()=>setPage(i+1)} className={`ff-pagebtn ${page===i+1?'ff-pagebtn--secondary':'ff-pagebtn--normal'}`}>{i+1}</button>
            )}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="ff-pagebtn ff-pagebtn--normal">Sau</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuAdmin;
