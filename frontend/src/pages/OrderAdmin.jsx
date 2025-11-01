import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

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

  // Lọc theo tìm kiếm (mã đơn hoặc trạng thái)
  const filtered = orders.filter(o =>
    o.id.toString().includes(search) ||
    (o.status || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div style={{marginBottom:40}}>
      <div style={{display:'flex',gap:16,marginBottom:16}}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Tìm kiếm mã đơn hoặc trạng thái..." style={{padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16,minWidth:280,marginLeft:'auto'}} />
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
              <th style={{padding:'12px 8px'}}>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(o => (
              <tr key={o.id} style={{borderBottom:'1px solid #f0f0f0',transition:'background 0.2s'}}>
                <td style={{padding:'10px 8px',textAlign:'center',verticalAlign:'middle'}}>{o.id}</td>
                <td style={{padding:'10px 8px',textAlign:'center',verticalAlign:'middle'}}>{users.find(u=>u.id===o.userId)?.name || o.userId}</td>
                <td style={{padding:'10px 8px',textAlign:'center',verticalAlign:'middle'}}>{Number(o.total).toLocaleString()}₫</td>
                <td style={{padding:'10px 8px',textAlign:'center',verticalAlign:'middle'}}>
                  <StatusBadge status={o.status} />
                </td>
                <td style={{padding:'10px 8px',textAlign:'center',verticalAlign:'middle'}}>{o.address}</td>
                <td style={{padding:'10px 8px',textAlign:'center',verticalAlign:'middle'}}>{o.droneId ? `#${o.droneId}` : 'Chưa gán'}</td>
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
        {selectedOrder && createPortal(
          <div className="order-modal-backdrop" onClick={()=>setSelectedOrder(null)}>
            <div className="order-modal-content" onClick={e=>e.stopPropagation()}>
              <div className="order-modal-header">
                <h2 className="order-modal-title">📋 Chi tiết đơn #{selectedOrder.id}</h2>
                <button 
                  className="order-modal-close" 
                  onClick={()=>setSelectedOrder(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="order-modal-body">
                <div className="order-info-grid">
                  <div className="order-info-item">
                    <span className="info-label">👤 Khách hàng:</span>
                    <span className="info-value">{users.find(u=>u.id===selectedOrder.userId)?.name || selectedOrder.userId}</span>
                  </div>
                  
                  <div className="order-info-item">
                    <span className="info-label">📍 Địa chỉ:</span>
                    <span className="info-value">{selectedOrder.address}</span>
                  </div>
                  
                  <div className="order-info-item">
                    <span className="info-label">💰 Tổng tiền:</span>
                    <span className="info-value price">{Number(selectedOrder.total).toLocaleString()}₫</span>
                  </div>
                  
                  <div className="order-info-item">
                    <span className="info-label">📊 Trạng thái:</span>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  
                  <div className="order-info-item">
                    <span className="info-label">🚁 Drone:</span>
                    <span className="info-value">{selectedOrder.droneId ? `#${selectedOrder.droneId}` : 'Chưa gán'}</span>
                  </div>
                </div>
                
                <div className="order-items-section">
                  <h3 className="section-title">🍽️ Danh sách món</h3>
                  <div className="order-items-table">
                    <div className="table-header">
                      <div className="table-cell">Tên món</div>
                      <div className="table-cell">Số lượng</div>
                      <div className="table-cell">Đơn giá</div>
                    </div>
                    {(selectedOrder.OrderDetails || []).map(od => (
                      <div key={od.id} className="table-row">
                        <div className="table-cell">{od.Menu?.name || od.menuId}</div>
                        <div className="table-cell">{od.quantity}</div>
                        <div className="table-cell price">{Number(od.price).toLocaleString()}₫</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="order-modal-footer">
                <button 
                  className="btn btn-outline" 
                  onClick={()=>setSelectedOrder(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default OrderAdmin;
