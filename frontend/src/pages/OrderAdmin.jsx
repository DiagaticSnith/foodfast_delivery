import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OrderAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const pageSize = 5;

  const fetchOrders = async () => {
    const res = await axios.get('/api/orders');
    setOrders(res.data);
  };
  const fetchUsers = async () => {
    const res = await axios.get('/api/users');
    setUsers(res.data);
  };

  useEffect(() => { fetchOrders(); fetchUsers(); }, []);

  // Tìm kiếm theo mã đơn hoặc trạng thái
  const filtered = orders.filter(o =>
    o.id.toString().includes(search) ||
    (o.status || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div style={{marginBottom:40}}>
  <h3 style={{marginBottom:20, color:'#ff4d4f'}}>Quản lý Đơn hàng</h3>
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
              <th style={{padding:'12px 8px'}}>Trạng thái giao</th>
              <th style={{padding:'12px 8px'}}>Địa chỉ</th>
              <th style={{padding:'12px 8px'}}>Drone</th>
              <th style={{padding:'12px 8px'}}>Shipper</th>
              <th style={{padding:'12px 8px'}}>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(o => (
              <tr key={o.id} style={{borderBottom:'1px solid #f0f0f0',transition:'background 0.2s'}}>
                <td style={{padding:'10px 8px',textAlign:'center',verticalAlign:'middle'}}>{o.id}</td>
                <td style={{padding:'10px 8px',textAlign:'center',verticalAlign:'middle'}}>{users.find(u=>u.id===o.userId)?.username || o.userId}</td>
                <td style={{padding:'10px 8px',textAlign:'center',verticalAlign:'middle'}}>{Number(o.total).toLocaleString()}₫</td>
                <td style={{padding:'10px 8px',textAlign:'center',verticalAlign:'middle'}}>
                  <span style={{color: o.status === 'Done' ? '#189c38' : '#ff4d4f', fontWeight:600}}>
                    {o.status === 'Done' ? 'Đã giao' : 'Chưa giao'}
                  </span>
                </td>
                <td style={{padding:'10px 8px',textAlign:'center',verticalAlign:'middle'}}>{o.address}</td>
                <td style={{padding:'10px 8px',textAlign:'center',verticalAlign:'middle'}}>{o.droneId ? `#${o.droneId}` : 'Chưa gán'}</td>
                <td style={{padding:'10px 8px',textAlign:'center',verticalAlign:'middle'}}>{(() => {
                  if (o.Drone && o.Drone.userId) {
                    const shipper = users.find(u => u.id === o.Drone.userId && u.role === 'shipper');
                    return shipper ? shipper.username : '';
                  }
                  return '';
                })()}</td>
                <td style={{padding:'10px 8px',textAlign:'center',verticalAlign:'middle'}}>
                  <button style={{background:'#189c38',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:500,cursor:'pointer'}} onClick={()=>setSelectedOrder(o)}>Xem chi tiết</button>
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
        {selectedOrder && (
          <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setSelectedOrder(null)}>
            <div style={{background:'#fff',padding:32,borderRadius:12,minWidth:400,maxWidth:600,boxShadow:'0 2px 16px #888',position:'relative'}} onClick={e=>e.stopPropagation()}>
              <h2>Chi tiết đơn #{selectedOrder.id}</h2>
              <div><b>Khách hàng:</b> {users.find(u=>u.id===selectedOrder.userId)?.username || selectedOrder.userId}</div>
              <div><b>Địa chỉ:</b> {selectedOrder.address}</div>
              <div><b>Tổng tiền:</b> {Number(selectedOrder.total).toLocaleString()}₫</div>
              <div><b>Trạng thái:</b> <span style={{color:selectedOrder.status==='Done'?'#189c38':'#ff4d4f',fontWeight:600}}>{selectedOrder.status === 'Done' ? 'Đã giao' : 'Chưa giao'}</span></div>
              <div><b>Drone:</b> {selectedOrder.droneId ? `#${selectedOrder.droneId}` : 'Chưa gán'}</div>
              <div style={{margin:'16px 0'}}>
                <b>Danh sách món:</b>
                <table style={{width:'100%',marginTop:8,borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{background:'#fafafa'}}>
                      <th style={{padding:'8px',textAlign:'center'}}>Tên món</th>
                      <th style={{padding:'8px',textAlign:'center'}}>Số lượng</th>
                      <th style={{padding:'8px',textAlign:'center'}}>Đơn giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.OrderDetails || []).map(od => (
                      <tr key={od.id}>
                        <td style={{padding:'8px',textAlign:'center'}}>{od.Menu?.name || od.menuId}</td>
                        <td style={{padding:'8px',textAlign:'center'}}>{od.quantity}</td>
                        <td style={{padding:'8px',textAlign:'center'}}>{Number(od.price).toLocaleString()}₫</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{marginTop:16,textAlign:'center'}}>
                <button style={{background:'#ff4d4f',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:500,cursor:'pointer'}} onClick={()=>setSelectedOrder(null)}>Đóng</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderAdmin;
