import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';

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
  const [infoForm, setInfoForm] = useState({ name:'', email:'', address:'', phoneNumber:'' });
  const [roleValue, setRoleValue] = useState('user');

  const fetchUsers = async () => {
    const res = await axios.get('/api/users');
    setUsers(res.data);
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

  const submitInfo = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    await axios.put(`/api/users/${selectedUser.id}/info`, infoForm);
    setEditInfoOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };
  const submitRole = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    await axios.put(`/api/users/${selectedUser.id}/role`, { role: roleValue });
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
                  <button onClick={()=>openEditRole(u)} disabled={u.role==='admin'} style={{background:u.role==='admin'?'#ccc':'#189c38',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',cursor:u.role==='admin'?'not-allowed':'pointer'}}>Đổi role</button>
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
        <form onSubmit={submitInfo} style={{display:'grid',gap:12}}>
          <input value={infoForm.name} onChange={e=>setInfoForm(f=>({...f,name:e.target.value}))} placeholder="Tên" style={{padding:10,borderRadius:8,border:'1px solid #ddd'}} />
          <input type="email" value={infoForm.email} onChange={e=>setInfoForm(f=>({...f,email:e.target.value}))} placeholder="Email" style={{padding:10,borderRadius:8,border:'1px solid #ddd'}} />
          <input value={infoForm.address} onChange={e=>setInfoForm(f=>({...f,address:e.target.value}))} placeholder="Địa chỉ" style={{padding:10,borderRadius:8,border:'1px solid #ddd'}} />
          <input value={infoForm.phoneNumber} onChange={e=>setInfoForm(f=>({...f,phoneNumber:e.target.value}))} placeholder="Số điện thoại" style={{padding:10,borderRadius:8,border:'1px solid #ddd'}} />
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button type="button" onClick={()=>{setEditInfoOpen(false); setSelectedUser(null);}} style={{background:'#eee',border:'none',borderRadius:8,padding:'8px 16px'}}>Hủy</button>
            <button type="submit" style={{background:'#1677ff',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px'}}>Lưu</button>
          </div>
        </form>
      </Modal>

      <Modal open={editRoleOpen} title={`Đổi role - ${selectedUser?.username || ''}`} onClose={()=>{setEditRoleOpen(false); setSelectedUser(null);}} footer={null}>
        <form onSubmit={submitRole} style={{display:'grid',gap:12}}>
          <select value={roleValue} onChange={e=>setRoleValue(e.target.value)} style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}>
            {roles.map(r=> <option key={r} value={r}>{r}</option>)}
          </select>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button type="button" onClick={()=>{setEditRoleOpen(false); setSelectedUser(null);}} style={{background:'#eee',border:'none',borderRadius:8,padding:'8px 16px'}}>Hủy</button>
            <button type="submit" style={{background:'#189c38',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px'}}>Cập nhật</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
