import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DroneAdmin = () => {
  const [drones, setDrones] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', status: 'available', launchpad: '' });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const fetchDrones = async () => {
    const res = await axios.get('/api/drones');
    setDrones(res.data);
  };

  useEffect(() => {
    fetchDrones();
  }, []);

  const handleEdit = (d) => {
    setEditing(d.id);
    setForm({
      name: d.name,
      status: d.status,
      launchpad: d.launchpad || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa drone này?')) return;
    await axios.delete(`/api/drones/${id}`);
    fetchDrones();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (editing) {
      await axios.put(`/api/drones/${editing}`, form);
    } else {
      await axios.post('/api/drones', form);
    }
    setEditing(null);
    setForm({ name: '', status: 'available', launchpad: '' });
    setLoading(false);
    fetchDrones();
  };

  // Chỉ tìm kiếm theo tên drone
  const filtered = drones.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div style={{marginBottom:40}}>
      <h3 style={{marginBottom:20, color:'#189c38'}}>Quản lý Drone</h3>
      <div style={{marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Tìm kiếm drone..." style={{padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16,minWidth:220}} />
      </div>
      <form onSubmit={handleSubmit} style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap',alignItems:'center'}}>
        <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Tên drone" required style={{flex:'1 1 120px',padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}} />
        <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={{flex:'1 1 100px',padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}}>
          <option value="available">available</option>
          <option value="busy">busy</option>
          <option value="maintenance">maintenance</option>
        </select>
        <input value={form.launchpad} onChange={e=>setForm(f=>({...f,launchpad:e.target.value}))} placeholder="Launchpad" style={{flex:'1 1 120px',padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}} />
        <button type="submit" disabled={loading} style={{background:'#189c38',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:600,fontSize:16,cursor:loading?'not-allowed':'pointer'}}>{editing ? 'Cập nhật' : 'Thêm mới'}</button>
        {editing && <button type="button" style={{background:'#eee',color:'#333',border:'none',borderRadius:8,padding:'10px 18px',fontWeight:500,marginLeft:4,cursor:'pointer'}} onClick={()=>{setEditing(null);setForm({name:'',status:'available',launchpad:''});}}>Hủy</button>}
      </form>
      <div style={{overflowX:'auto',borderRadius:12,boxShadow:'0 2px 8px #eee'}}>
        <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:12,overflow:'hidden'}}>
          <thead>
            <tr style={{background:'#fafafa',fontWeight:600}}>
              <th style={{padding:'12px 8px',textAlign:'center'}}>ID</th>
              <th style={{padding:'12px 8px',textAlign:'center'}}>Tên</th>
              <th style={{padding:'12px 8px',textAlign:'center'}}>Trạng thái</th>
              {/* <th style={{padding:'12px 8px',textAlign:'center'}}>Vị trí</th> */}
              <th style={{padding:'12px 8px',textAlign:'center'}}>Launchpad</th>
              <th style={{padding:'12px 8px',textAlign:'center'}}>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(d => (
              <tr key={d.id} style={{borderBottom:'1px solid #f0f0f0',transition:'background 0.2s'}} onMouseOver={e=>e.currentTarget.style.background='#f6faff'} onMouseOut={e=>e.currentTarget.style.background='#fff'}>
                <td style={{padding:'10px 8px',textAlign:'center'}}>{d.id}</td>
                <td style={{padding:'10px 8px',textAlign:'center'}}>{d.name}</td>
                <td style={{padding:'10px 8px',textAlign:'center'}}>{d.status}</td>
                <td style={{padding:'10px 8px',textAlign:'center'}}>{d.launchpad}</td>
                <td style={{padding:'10px 8px',textAlign:'center'}}>
                  <button onClick={()=>alert('Chức năng xem chi tiết drone và các đơn hàng sẽ được bổ sung!')} style={{background:'#189c38',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:500,cursor:'pointer'}}>Xem chi tiết</button>
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
    </div>
  );
};

export default DroneAdmin;
