import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { api } from '../api/api';
import Modal from '../components/Modal';
import { useToast } from '../components/ToastProvider';

// Only allow changing to these roles
const roles = ['user','restaurant'];

export default function UserAdmin(){
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [infoForm, setInfoForm] = useState({ name:'', email:'', address:'', phoneNumber:'' });
  const [roleValue, setRoleValue] = useState('user');
  const toast = useToast();

  const fetchUsers = async () => {
    const res = await api.get('/api/users');
    const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.users) ? res.data.users : []);
    if (!Array.isArray(res.data)) console.error('fetchUsers: expected array, got', res.data);
    setUsers(data);
  };

  useEffect(()=>{ fetchUsers(); },[]);

  const openEditInfo = (u) => {
    setSelectedUser(u);
    setInfoForm({ name: u.name || '', email: u.email || '', address: u.address || '', phoneNumber: u.phoneNumber || '' });
    setEditInfoOpen(true);
  };
  const openEditRole = (u) => {
    // Prevent editing admin roles to avoid accidental demotion
    if (u.role === 'admin') return;
    setSelectedUser(u);
    // Default mapping: allow only 'user' and 'restaurant'
    if (u.role === 'restaurant') {
      setRoleValue('restaurant');
    } else if (u.role === 'restaurantpending') {
      // Map pending to restaurant for approval flow
      setRoleValue('restaurant');
    } else {
      setRoleValue('user');
    }
    setEditRoleOpen(true);
  };

  const openReviews = async (u) => {
    setSelectedUser(u);
    setReviewsOpen(true);
    setUserReviews([]);
    setReviewsLoading(true);
    try {
      // Request includeHidden so admins can see hidden reviews and unhide them
      const res = await api.get(`/api/users/${u.id}/reviews?includeHidden=1`);
      setUserReviews(res.data || []);
    } catch (err) {
      console.error(err);
      try { toast && toast.error('Không thể tải bình luận'); } catch {}
    } finally {
      setReviewsLoading(false);
    }
  };

  const changeReviewStatus = async (reviewId, status) => {
    try {
      await api.put(`/api/reviews/${reviewId}/status`, { status });
      // refresh
      if (selectedUser) {
        const res = await api.get(`/api/users/${selectedUser.id}/reviews`);
        setUserReviews(res.data || []);
      }
      try { toast && toast.success('Cập nhật trạng thái thành công'); } catch {}
    } catch (err) {
      console.error(err);
      try { toast && toast.error('Cập nhật thất bại'); } catch {}
    }
  };

  const submitInfo = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
  await api.put(`/api/users/${selectedUser.id}/info`, infoForm);
    setEditInfoOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };
  const submitRole = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
  await api.put(`/api/users/${selectedUser.id}/role`, { role: roleValue });
    setEditRoleOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const filtered = users
    .filter(u => u.role !== 'admin')
    .filter(u =>
      (u.username?.toLowerCase()||'').includes(search.toLowerCase()) ||
      (u.email?.toLowerCase()||'').includes(search.toLowerCase()) ||
      (u.name?.toLowerCase()||'').includes(search.toLowerCase())
    );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div>
      <div style={{marginBottom:16,display:'flex',gap:12,alignItems:'center'}}>
        <input value={search} onChange={e=>{setSearch(e.target.value); setPage(1);}} placeholder="Tìm kiếm (username, email, tên)" style={{padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16,minWidth:260}} />
      </div>
      <div style={{overflowX:'auto',borderRadius:12,boxShadow:'0 2px 8px #eee'}}>
        <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:12,overflow:'hidden'}}>
          <thead>
            <tr style={{background:'#fafafa',fontWeight:600}}>
              <th style={{padding:'12px 8px',textAlign:'center'}}>ID</th>
              <th style={{padding:'12px 8px',textAlign:'center'}}>Username</th>
              <th style={{padding:'12px 8px',textAlign:'center'}}>Tên</th>
              <th style={{padding:'12px 8px',textAlign:'center'}}>Email</th>
              <th style={{padding:'12px 8px',textAlign:'center'}}>Role</th>
              <th style={{padding:'12px 8px',textAlign:'center'}}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(u => (
              <tr key={u.id} style={{borderBottom:'1px solid #f0f0f0'}}>
                <td style={{padding:'10px 8px',textAlign:'center'}}>{u.id}</td>
                <td style={{padding:'10px 8px',textAlign:'center'}}>{u.username}</td>
                <td style={{padding:'10px 8px',textAlign:'center'}}>{u.name}</td>
                <td style={{padding:'10px 8px',textAlign:'center'}}>{u.email}</td>
                <td style={{padding:'10px 8px',textAlign:'center'}}>{u.role}</td>
                <td style={{padding:'10px 8px',textAlign:'center'}}>
                  <button onClick={()=>openEditInfo(u)} style={{background:'#1677ff',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',marginRight:6,cursor:'pointer'}}>Sửa thông tin</button>
                  <button onClick={()=>openEditRole(u)} disabled={u.role==='admin'} style={{background:u.role==='admin'?'#ccc':'#189c38',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',cursor:u.role==='admin'?'not-allowed':'pointer',marginRight:6}}>Đổi role</button>
                  <button onClick={()=>openReviews(u)} style={{background:'#6b7280',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px',cursor:'pointer'}}>Xem bình luận</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div style={{marginTop:16,display:'flex',gap:8,justifyContent:'center'}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{padding:'6px 14px',borderRadius:6,border:'1px solid #eee',background:'#fff',color:'#333',fontWeight:600,cursor:page===1?'not-allowed':'pointer'}}>Trước</button>
            {Array.from({length:totalPages},(_,i)=>
              <button key={i} onClick={()=>setPage(i+1)} style={{padding:'6px 12px',borderRadius:6,border:'none',background:page===i+1?'#189c38':'#eee',color:page===i+1?'#fff':'#333',fontWeight:600,cursor:'pointer'}}>{i+1}</button>
            )}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{padding:'6px 14px',borderRadius:6,border:'1px solid #eee',background:'#fff',color:'#333',fontWeight:600,cursor:page===totalPages?'not-allowed':'pointer'}}>Sau</button>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={editInfoOpen} title={`Sửa thông tin - ${selectedUser?.username || ''}`} onClose={()=>{setEditInfoOpen(false); setSelectedUser(null);}} footer={null}>
        <div className="ff-form">
          <form onSubmit={submitInfo} className="ff-stack">
            <div className="form-field">
              <label className="form-label">Tên hiển thị</label>
              <input 
                className="ff-input" 
                value={infoForm.name} 
                onChange={e=>setInfoForm(f=>({...f,name:e.target.value}))} 
                placeholder="Nhập tên hiển thị" 
              />
            </div>
            <div className="form-field">
              <label className="form-label">Email</label>
              <input 
                className="ff-input" 
                type="email" 
                value={infoForm.email} 
                onChange={e=>setInfoForm(f=>({...f,email:e.target.value}))} 
                placeholder="Nhập địa chỉ email" 
              />
            </div>
            <div className="form-field">
              <label className="form-label">Địa chỉ</label>
              <input 
                className="ff-input" 
                value={infoForm.address} 
                onChange={e=>setInfoForm(f=>({...f,address:e.target.value}))} 
                placeholder="Nhập địa chỉ" 
              />
            </div>
            <div className="form-field">
              <label className="form-label">Số điện thoại</label>
              <input 
                className="ff-input" 
                value={infoForm.phoneNumber} 
                onChange={e=>setInfoForm(f=>({...f,phoneNumber:e.target.value}))} 
                placeholder="Nhập số điện thoại" 
              />
            </div>
            
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button type="button" onClick={()=>{setEditInfoOpen(false); setSelectedUser(null);}} style={{background:'#eee',border:'none',borderRadius:8,padding:'8px 16px'}}>Hủy</button>
            <button type="submit" style={{background:'#1677ff',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px'}}>Lưu</button>
          </div>
        </form>
        </div>
      </Modal>

      <Modal open={reviewsOpen} title={`Bình luận - ${selectedUser?.username || ''}`} onClose={()=>{setReviewsOpen(false); setSelectedUser(null); setUserReviews([]);}} footer={null}>
        <div style={{minWidth:420}}>
          {reviewsLoading ? <div>Đang tải...</div> : (
            userReviews.length === 0 ? <div className="ff-muted">Không có bình luận</div> : (
              <div style={{display:'grid',gap:12}}>
                {userReviews.map(r => (
                  <div key={r.id} style={{padding:12,borderRadius:8,border:'1px solid #eee',background:'#fff'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{fontWeight:700}}>{r.Menu?.name || '—'}</div>
                      <div style={{fontSize:12}}>{new Date(r.createdAt).toLocaleString()}</div>
                    </div>
                    <div style={{marginTop:8}}>
                      <div>Đánh giá: <b>{r.rating}</b></div>
                      <div style={{marginTop:6}}>{r.comment || <i className="ff-muted">(không có nội dung)</i>}</div>
                    </div>
                    <div style={{marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div><span className={`ff-badge ${r.status==='hidden' ? 'ff-badge--warn' : 'ff-badge--ok'}`}>{r.status}</span></div>
                      <div style={{display:'flex',gap:8}}>
                        {r.status === 'hidden' ? (
                          <button onClick={()=>{
                            if (!window.confirm('Bạn có chắc muốn hiện bình luận này không?')) return;
                            changeReviewStatus(r.id,'approved');
                          }} className="ff-btn ff-btn--primary ff-btn--small">Hiện</button>
                        ) : (
                          <button onClick={()=>{
                            if (!window.confirm('Bạn có chắc muốn ẩn bình luận này không?')) return;
                            changeReviewStatus(r.id,'hidden');
                          }} className="ff-btn ff-btn--danger ff-btn--small">Ẩn</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </Modal>

      <Modal open={editRoleOpen} title={`Đổi role - ${selectedUser?.username || ''}`} onClose={()=>{setEditRoleOpen(false); setSelectedUser(null);}} footer={null}>
          <div className="ff-form">
          <form onSubmit={submitRole} className="ff-stack">
          <select value={roleValue} onChange={e=>setRoleValue(e.target.value)} style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}>
            {roles.map(r=> <option key={r} value={r}>{r}</option>)}
          </select>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button type="button" onClick={()=>{setEditRoleOpen(false); setSelectedUser(null);}} style={{background:'#eee',border:'none',borderRadius:8,padding:'8px 16px'}}>Hủy</button>
            <button type="submit" style={{background:'#189c38',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px'}}>Cập nhật</button>
          </div>
        </form>
        </div>
      </Modal>
    </div>
  );
}
