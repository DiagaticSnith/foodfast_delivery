import React, { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api/api';
import Modal from '../components/Modal';
import { useToast } from '../components/ToastProvider';

const DroneAdmin = () => {
  const [drones, setDrones] = useState([]);
  const [editing, setEditing] = useState(null);
  const [statusDisabled, setStatusDisabled] = useState(false);
  const [form, setForm] = useState({ name: '', status: 'available', launchpad: '' });
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const toast = useToast();

  const fetchDrones = async () => {
    try {
      const res = await api.get('/api/drones');
      setDrones(res.data);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi tải drones';
      try { toast.error(msg); } catch {}
    }
  };

  useEffect(() => {
    fetchDrones();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setStatusDisabled(false);
    setForm({ name: '', status: 'available', launchpad: '' });
    setOpenModal(true);
  };

  const handleEdit = (d) => {
    setEditing(d.id);
    setForm({
      name: d.name,
      status: d.status,
      launchpad: d.launchpad || ''
    });
    // If drone is busy (assigned to an order) admin must not change status
    setStatusDisabled(d.status === 'busy');
    setOpenModal(true);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (statusDisabled) {
        // don't send status if admin is not allowed to change it
        delete payload.status;
      }

      if (editing) {
        await api.put(`/api/drones/${editing}`, payload);
        toast.success('Cập nhật drone thành công');
      } else {
        await api.post('/api/drones', payload);
        toast.success('Thêm drone thành công');
      }
      setOpenModal(false);
      setEditing(null);
      setForm({ name: '', status: 'available', launchpad: '' });
      fetchDrones();
    } finally {
      setLoading(false);
    }
  };

  // Chỉ tìm kiếm theo tên drone
  const filtered = drones.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div className="ff-page">
      <div className="ff-toolbar">
        <input 
          value={search} 
          onChange={e=>{setSearch(e.target.value);setPage(1);}} 
          placeholder="🔍 Tìm kiếm drone..." 
          className="ff-input ff-minw-220" 
        />
        <button 
          onClick={openCreate} 
          className="ff-btn ff-btn--success"
        >
          ➕ Thêm drone
        </button>
      </div>
      <Modal
        open={openModal}
        title={editing ? 'Cập nhật drone' : 'Thêm drone mới'}
        onClose={()=>{setOpenModal(false); setEditing(null);}}
        footer={null}
      >
        <div className="drone-modal-form">
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="field-label">🚁 Tên drone</label>
              <input 
                value={form.name} 
                onChange={e=>setForm(f=>({...f,name:e.target.value}))} 
                placeholder="Nhập tên drone" 
                required 
                className="ff-input"
              />
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <label className="field-label">📊 Trạng thái</label>
                {statusDisabled ? (
                  <select value={form.status} disabled className="ff-select">
                    <option value="busy">🔴 Đang bận </option>
                  </select>
                ) : (
                  <select 
                    value={form.status} 
                    onChange={e=>setForm(f=>({...f,status:e.target.value}))} 
                    className="ff-select"
                  >
                    <option value="available">🟢 Sẵn sàng</option>
                    <option value="maintenance">🔧 Bảo trì</option>
                  </select>
                )}
              </div>
              
              <div className="form-field">
                <label className="field-label">📍 Launchpad</label>
                <input 
                  value={form.launchpad} 
                  onChange={e=>setForm(f=>({...f,launchpad:e.target.value}))} 
                  placeholder="Vị trí launchpad" 
                  className="ff-input"
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={()=>{setOpenModal(false); setEditing(null);}} 
                className="btn btn-outline"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="btn btn-success"
              >
                {loading ? '⏳ Đang xử lý...' : (editing ? '🔄 Cập nhật' : '➕ Thêm mới')}
              </button>
            </div>
          </form>
        </div>
      </Modal>
      <div className="ff-table-wrap">
        <table className="ff-table">
          <thead className="ff-thead">
            <tr>
              <th className="ff-th">🆔 ID</th>
              <th className="ff-th">🚁 Tên Drone</th>
              <th className="ff-th">📊 Trạng thái</th>

              <th className="ff-th">📍 Launchpad</th>
              <th className="ff-th">⚙️ Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(d => (
              <tr key={d.id} className="ff-tr">
                <td className="ff-td">
                  <span className="ff-badge ff-badge--neutral">#{d.id}</span>
                </td>
                <td className="ff-td">
                  <div style={{fontWeight: 600, color: '#1f2937'}}>{d.name}</div>
                </td>
                <td className="ff-td">
                  <StatusBadge status={d.status} />
                </td>
                <td className="ff-td">
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'}}>
                    <span style={{fontSize: '16px'}}>🏢</span>
                    <span style={{fontWeight: 500, color: '#374151'}}>{d.launchpad || '—'}</span>
                  </div>
                </td>
                <td className="ff-td">
                  <div className="table-actions">
                    <button 
                      onClick={() => handleEdit(d)} 
                      className="btn-icon btn-icon--edit"
                    >
                      ✏️ Sửa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="ff-pagination">
            <button 
              onClick={() => setPage(p => Math.max(1, p-1))} 
              disabled={page === 1} 
              className="ff-pagebtn ff-pagebtn--normal"
              style={{opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer'}}
            >
              ⬅️ Trước
            </button>
            {Array.from({length: totalPages}, (_, i) => (
              <button 
                key={i} 
                onClick={() => setPage(i+1)} 
                className={`ff-pagebtn ${page === i+1 ? 'ff-pagebtn--secondary' : 'ff-pagebtn--normal'}`}
              >
                {i+1}
              </button>
            ))}
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p+1))} 
              disabled={page === totalPages} 
              className="ff-pagebtn ff-pagebtn--normal"
              style={{opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer'}}
            >
              Sau ➡️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DroneAdmin;
