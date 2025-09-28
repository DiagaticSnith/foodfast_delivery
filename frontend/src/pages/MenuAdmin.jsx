import React, { useEffect, useState } from 'react';
import axios from 'axios';


const MenuAdmin = () => {
  const [menus, setMenus] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', description: '', category: '', imageUrl: '', restaurantId: '' });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const fetchMenus = async () => {
    const res = await axios.get('/api/menus');
    setMenus(res.data);
  };
  const fetchRestaurants = async () => {
    const res = await axios.get('/api/restaurants');
    setRestaurants(res.data);
  };

  useEffect(() => { fetchMenus(); fetchRestaurants(); }, []);

  const handleEdit = (m) => {
    setEditing(m.id);
    setForm({
      name: m.name,
      price: m.price,
      description: m.description,
      category: m.category,
      imageUrl: m.imageUrl,
      restaurantId: m.restaurantId
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa món này?')) return;
    await axios.delete(`/api/menus/${id}`);
    fetchMenus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (editing) {
      await axios.put(`/api/menus/${editing}`, form);
    } else {
      await axios.post('/api/menus', form);
    }
    setEditing(null);
    setForm({ name: '', price: '', description: '', category: '', imageUrl: '', restaurantId: '' });
    setLoading(false);
    fetchMenus();
  };

  // Search & Pagination
  // Chỉ tìm kiếm theo tên món
  const filtered = menus.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div style={{marginBottom:40}}>
      <h3 style={{marginBottom:20, color:'#189c38'}}>Quản lý Menu</h3>
      <div style={{marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Tìm kiếm menu..." style={{padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16,minWidth:220}} />
      </div>
      <form onSubmit={handleSubmit} style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap',alignItems:'center'}}>
        <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Tên món" required style={{flex:'1 1 120px',padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}} />
        <input value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="Giá" type="number" min={0} required style={{flex:'1 1 80px',padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}} />
        <input value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} placeholder="Phân loại" style={{flex:'1 1 100px',padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}} />
        <input value={form.imageUrl} onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))} placeholder="Ảnh (URL)" style={{flex:'2 1 180px',padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}} />
        <select value={form.restaurantId} onChange={e=>setForm(f=>({...f,restaurantId:e.target.value}))} required style={{flex:'1 1 120px',padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}}>
          <option value="">Chọn nhà hàng</option>
          {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Mô tả" style={{flex:'2 1 180px',padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}} />
        <button type="submit" disabled={loading} style={{background:'#189c38',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:600,fontSize:16,cursor:loading?'not-allowed':'pointer'}}>{editing ? 'Cập nhật' : 'Thêm mới'}</button>
        {editing && <button type="button" style={{background:'#eee',color:'#333',border:'none',borderRadius:8,padding:'10px 18px',fontWeight:500,marginLeft:4,cursor:'pointer'}} onClick={()=>{setEditing(null);setForm({name:'',price:'',description:'',category:'',imageUrl:'',restaurantId:''});}}>Hủy</button>}
      </form>
      <div style={{overflowX:'auto',borderRadius:12,boxShadow:'0 2px 8px #eee'}}>
        <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:12,overflow:'hidden'}}>
          <thead>
            <tr style={{background:'#fafafa',fontWeight:600}}>
              <th style={{padding:'12px 8px'}}>ID</th>
              <th style={{padding:'12px 8px'}}>Tên</th>
              <th style={{padding:'12px 8px'}}>Giá</th>
              <th style={{padding:'12px 8px'}}>Phân loại</th>
              <th style={{padding:'12px 8px'}}>Nhà hàng</th>
              <th style={{padding:'12px 8px'}}>Ảnh</th>
              <th style={{padding:'12px 8px'}}>Mô tả</th>
              <th style={{padding:'12px 8px'}}></th>
            </tr>
          </thead>
          <tbody>
            {paged.map(m => (
              <tr key={m.id} style={{borderBottom:'1px solid #f0f0f0',transition:'background 0.2s'}} onMouseOver={e=>e.currentTarget.style.background='#f6faff'} onMouseOut={e=>e.currentTarget.style.background='#fff'}>
                <td style={{padding:'10px 8px',textAlign:'center'}}>{m.id}</td>
                <td style={{padding:'10px 8px'}}>{m.name}</td>
                <td style={{padding:'10px 8px'}}>{Number(m.price).toLocaleString()}₫</td>
                <td style={{padding:'10px 8px'}}>{m.category}</td>
                <td style={{padding:'10px 8px'}}>{restaurants.find(r=>r.id===m.restaurantId)?.name || m.restaurantId}</td>
                <td style={{padding:'10px 8px'}}>{m.imageUrl && <img src={m.imageUrl} alt={m.name} style={{width:48,height:48,objectFit:'cover',borderRadius:8}} />}</td>
                <td style={{padding:'10px 8px',maxWidth:180,whiteSpace:'pre-line',overflow:'hidden',textOverflow:'ellipsis'}}>{m.description}</td>
                <td style={{padding:'10px 8px',textAlign:'center'}}>
                  <button onClick={()=>handleEdit(m)} style={{background:'#189c38',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:500,marginRight:6,cursor:'pointer'}}>Sửa</button>
                  <button onClick={()=>handleDelete(m.id)} style={{background:'#fff',color:'#ff4d4f',border:'1px solid #ff4d4f',borderRadius:6,padding:'6px 16px',fontWeight:500,cursor:'pointer'}}>Xóa</button>
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

export default MenuAdmin;
