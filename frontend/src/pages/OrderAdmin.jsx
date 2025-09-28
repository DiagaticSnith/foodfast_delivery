import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OrderAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [drones, setDrones] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const fetchOrders = async () => {
    const res = await axios.get('/api/orders');
    setOrders(res.data);
  };
  const fetchUsers = async () => {
    const res = await axios.get('/api/users');
    setUsers(res.data);
  };
  const fetchDrones = async () => {
    const res = await axios.get('/api/drones');
    setDrones(res.data);
  };

  useEffect(() => { fetchOrders(); fetchDrones(); fetchUsers(); }, []);

  const handleAssignDrone = async (orderId, droneId) => {
    await axios.put(`/api/orders/${orderId}`, { droneId });
    fetchOrders();
  };

  // Tìm kiếm theo mã đơn hoặc trạng thái
  const filtered = orders.filter(o =>
    o.id.toString().includes(search) ||
    (o.status || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div style={{marginBottom:40}}>
      <h3 style={{marginBottom:20, color:'#ff4d4f'}}>Quản lý Đơn hàng & Gán Drone</h3>
      <div style={{marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Tìm kiếm mã đơn hoặc trạng thái..." style={{padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16,minWidth:220}} />
      </div>
      <div style={{overflowX:'auto',borderRadius:12,boxShadow:'0 2px 8px #eee'}}>
        <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:12,overflow:'hidden'}}>
          <thead>
            <tr style={{background:'#fafafa',fontWeight:600}}>
              <th style={{padding:'12px 8px'}}>Mã đơn</th>
              <th style={{padding:'12px 8px'}}>Khách hàng</th>
              <th style={{padding:'12px 8px'}}>Tổng tiền</th>
              <th style={{padding:'12px 8px'}}>Trạng thái</th>
              <th style={{padding:'12px 8px'}}>Địa chỉ</th>
              <th style={{padding:'12px 8px'}}>Drone</th>
              <th style={{padding:'12px 8px'}}></th>
            </tr>
          </thead>
          <tbody>
            {paged.map(o => (
              <tr key={o.id} style={{borderBottom:'1px solid #f0f0f0',transition:'background 0.2s'}}>
                <td style={{padding:'10px 8px',textAlign:'center'}}>{o.id}</td>
                <td style={{padding:'10px 8px'}}>{users.find(u=>u.id===o.userId)?.username || o.userId}</td>
                <td style={{padding:'10px 8px'}}>{Number(o.total).toLocaleString()}₫</td>
                <td style={{padding:'10px 8px'}}>{o.status}</td>
                <td style={{padding:'10px 8px'}}>{o.address}</td>
                <td style={{padding:'10px 8px'}}>
                  <select value={o.droneId || ''} onChange={e=>handleAssignDrone(o.id, e.target.value)} style={{padding:8,borderRadius:6,border:'1px solid #ddd',fontSize:15}}>
                    <option value="">Chưa gán</option>
                    {drones.map(d=>(<option key={d.id} value={d.id}>{d.name}</option>))}
                  </select>
                </td>
                <td></td>
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

export default OrderAdmin;
