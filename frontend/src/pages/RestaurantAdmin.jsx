import React, { useEffect, useState } from 'react';
import axios from 'axios';


const RestaurantAdmin = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const fetchRestaurants = async () => {
    const res = await axios.get('/api/restaurants');
    setRestaurants(res.data);
  };

  useEffect(() => { fetchRestaurants(); }, []);

  const handleEdit = (r) => {
    setEditing(r.id);
    setForm({ name: r.name, address: r.address, description: r.description });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa nhà hàng này?')) return;
    await axios.delete(`/api/restaurants/${id}`);
    fetchRestaurants();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (editing) {
      await axios.put(`/api/restaurants/${editing}`, form);
    } else {
      await axios.post('/api/restaurants', form);
    }
    setEditing(null);
    setForm({ name: '', address: '', description: '' });
    setLoading(false);
    fetchRestaurants();
  };

  // Search & Pagination
  // Chỉ tìm kiếm theo tên nhà hàng
  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div style={{marginBottom:40}}>
      <h3 style={{marginBottom:20, color:'#ff4d4f'}}>Quản lý Nhà hàng</h3>
      <div style={{marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Tìm kiếm nhà hàng..." style={{padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16,minWidth:220}} />
      </div>
      <form onSubmit={handleSubmit} style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap',alignItems:'center'}}>
        <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Tên nhà hàng" required style={{flex:'1 1 180px',padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}} />
        <input value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} placeholder="Địa chỉ" required style={{flex:'2 1 260px',padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}} />
        <input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Mô tả" style={{flex:'2 1 220px',padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}} />
        <button type="submit" disabled={loading} style={{background:'#ff4d4f',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:600,fontSize:16,cursor:loading?'not-allowed':'pointer'}}>{editing ? 'Cập nhật' : 'Thêm mới'}</button>
        {editing && <button type="button" style={{background:'#eee',color:'#333',border:'none',borderRadius:8,padding:'10px 18px',fontWeight:500,marginLeft:4,cursor:'pointer'}} onClick={()=>{setEditing(null);setForm({name:'',address:'',description:''});}}>Hủy</button>}
      </form>
      <div style={{overflowX:'auto',borderRadius:12,boxShadow:'0 2px 8px #eee'}}>
        <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:12,overflow:'hidden'}}>
          <thead>
            <tr style={{background:'#fafafa',fontWeight:600}}>
              <th style={{padding:'12px 8px',textAlign:'center'}}>ID</th>
              <th style={{padding:'12px 8px',textAlign:'center'}}>Tên</th>
              <th style={{padding:'12px 8px',textAlign:'center'}}>Địa chỉ</th>
              <th style={{padding:'12px 8px',textAlign:'center'}}>Mô tả</th>
              <th style={{padding:'12px 8px',textAlign:'center'}}></th>
            </tr>
          </thead>
          <tbody>
            {paged.map(r => (
              <tr key={r.id} style={{borderBottom:'1px solid #f0f0f0',transition:'background 0.2s'}} onMouseOver={e=>e.currentTarget.style.background='#f6faff'} onMouseOut={e=>e.currentTarget.style.background='#fff'}>
                <td style={{padding:'10px 8px',textAlign:'center'}}>{r.id}</td>
                <td style={{padding:'10px 8px',textAlign:'center'}}>{r.name}</td>
                <td style={{padding:'10px 8px',textAlign:'center'}}>{r.address}</td>
                <td style={{padding:'10px 8px',textAlign:'center'}}>{r.description}</td>
                <td style={{padding:'10px 8px',textAlign:'center'}}>
                  <button onClick={()=>handleEdit(r)} style={{background:'#189c38',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:500,marginRight:6,cursor:'pointer'}}>Sửa</button>
                  <button onClick={()=>handleDelete(r.id)} style={{background:'#fff',color:'#ff4d4f',border:'1px solid #ff4d4f',borderRadius:6,padding:'6px 16px',fontWeight:500,cursor:'pointer'}}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div style={{marginTop:16,display:'flex',gap:8,justifyContent:'center'}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{padding:'6px 14px',borderRadius:6,border:'1px solid #eee',background:'#fff',color:'#333',fontWeight:600,cursor:page===1?'not-allowed':'pointer'}}>Trước</button>
            {Array.from({length:totalPages},(_,i)=>
              <button key={i} onClick={()=>setPage(i+1)} style={{padding:'6px 12px',borderRadius:6,border:'none',background:page===i+1?'#ff4d4f':'#eee',color:page===i+1?'#fff':'#333',fontWeight:600,cursor:'pointer'}}>{i+1}</button>
            )}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{padding:'6px 14px',borderRadius:6,border:'1px solid #eee',background:'#fff',color:'#333',fontWeight:600,cursor:page===totalPages?'not-allowed':'pointer'}}>Sau</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantAdmin;
