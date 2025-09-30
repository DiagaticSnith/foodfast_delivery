import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RestaurantDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [tab, setTab] = useState('menu');
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', description: '', category: '', imageUrl: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  // Modal từ chối đơn
  const [rejectModal, setRejectModal] = useState({ open: false, orderId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  // Từ chối đơn
  const handleRejectOrder = (orderId) => {
    setRejectModal({ open: true, orderId });
    setRejectReason('');
  };
  const handleSubmitReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return alert('Vui lòng nhập lý do từ chối!');
    await axios.put(`/api/orders/${rejectModal.orderId}/reject`, { reason: rejectReason });
    setRejectModal({ open: false, orderId: null });
    setRejectReason('');
    fetchOrders();
    alert('Đã từ chối đơn!');
  };

  // Fetch menu, orders, history
  useEffect(() => {
    // Đảm bảo chỉ gọi 1 lần khi mount
    if (user?.role === 'restaurant') {
      fetchMenus();
      fetchOrders();
    }
    // eslint-disable-next-line
  }, []);

  const fetchMenus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/menus?restaurantId=${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setMenus(res.data);
    } catch (err) {
      setMenus([]);
    }
  };
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/orders?restaurantId=${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const allOrders = res.data;
      setPendingOrders(allOrders.filter(o => o.status === 'Pending'));
      setOrders(allOrders.filter(o => o.status === 'Accepted'));
      setHistory(allOrders.filter(o => o.status === 'Done'));
    } catch (err) {
      setPendingOrders([]);
      setOrders([]);
      setHistory([]);
    }
  };

  // CRUD menu
  const handleEditMenu = (m) => {
    setEditing(m.id);
    setForm({
      name: m.name,
      price: m.price,
      description: m.description,
      category: m.category,
      imageUrl: m.imageUrl
    });
  };
  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Xóa món này?')) return;
    await axios.delete(`/api/menus/${id}`);
    fetchMenus();
  };
  const handleSubmitMenu = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    if (editing) {
      await axios.put(`/api/menus/${editing}`, form, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } else {
      await axios.post('/api/menus', { ...form, restaurantId: user.id }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    }
    setEditing(null);
    setForm({ name: '', price: '', description: '', category: '', imageUrl: '' });
    setLoading(false);
    fetchMenus();
  };

  // Nhận đơn
  const handleAcceptOrder = async (orderId) => {
    const token = localStorage.getItem('token');
    await axios.put(`/api/orders/${orderId}`, { status: 'Accepted' }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    fetchOrders();
    alert('Đã nhận đơn, drone đang di chuyển tới nhà hàng!');
  };
  // Hoàn thành đơn
  const handleCompleteOrder = async (orderId) => {
    const token = localStorage.getItem('token');
    await axios.put(`/api/orders/${orderId}`, { status: 'Done' }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    fetchOrders();
    alert('Đã hoàn thành đơn!');
  };

  return (
  <div style={{maxWidth:1000,margin:'40px auto',background:'#fff',borderRadius:12,boxShadow:'0 2px 8px #eee',padding:32}}>
      <div style={{display:'flex',gap:24,marginBottom:32}}>
        <button onClick={()=>setTab('menu')} style={{padding:'12px 32px',border:'none',borderRadius:10,background:tab==='menu'?'#ff4d4f':'#eee',color:tab==='menu'?'#fff':'#333',fontWeight:600,fontSize:16,cursor:'pointer'}}>Quản lý Menu</button>
        <button onClick={()=>setTab('pending')} style={{padding:'12px 32px',border:'none',borderRadius:10,background:tab==='pending'?'#ff4d4f':'#eee',color:tab==='pending'?'#fff':'#333',fontWeight:600,fontSize:16,cursor:'pointer'}}>Đơn chờ nhận</button>
        <button onClick={()=>setTab('accepted')} style={{padding:'12px 32px',border:'none',borderRadius:10,background:tab==='accepted'?'#ff4d4f':'#eee',color:tab==='accepted'?'#fff':'#333',fontWeight:600,fontSize:16,cursor:'pointer'}}>Đơn đã nhận</button>
        <button onClick={()=>setTab('history')} style={{padding:'12px 32px',border:'none',borderRadius:10,background:tab==='history'?'#ff4d4f':'#eee',color:tab==='history'?'#fff':'#333',fontWeight:600,fontSize:16,cursor:'pointer'}}>Lịch sử đơn đã giao</button>
      </div>
      {tab==='menu' && (
        <div>
          <form onSubmit={handleSubmitMenu} style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap',alignItems:'center'}}>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Tên món" required style={{flex:'1 1 120px',padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}} />
            <input value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="Giá" type="number" min={0} required style={{flex:'1 1 80px',padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}} />
            <input value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} placeholder="Phân loại" style={{flex:'1 1 100px',padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}} />
            <input value={form.imageUrl} onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))} placeholder="Ảnh (URL)" style={{flex:'2 1 180px',padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}} />
            <input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Mô tả" style={{flex:'2 1 180px',padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}} />
            <button type="submit" disabled={loading} style={{background:'#189c38',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:600,fontSize:16,cursor:loading?'not-allowed':'pointer'}}>{editing ? 'Cập nhật' : 'Thêm mới'}</button>
            {editing && <button type="button" style={{background:'#eee',color:'#333',border:'none',borderRadius:8,padding:'10px 18px',fontWeight:500,marginLeft:4,cursor:'pointer'}} onClick={()=>{setEditing(null);setForm({name:'',price:'',description:'',category:'',imageUrl:''});}}>Hủy</button>}
          </form>
          <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:12,overflow:'hidden',boxShadow:'0 2px 8px #eee'}}>
            <thead>
              <tr style={{background:'#fafafa',fontWeight:600}}>
                <th style={{padding:'12px 8px',textAlign:'center'}}>ID</th>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Tên</th>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Giá</th>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Phân loại</th>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Ảnh</th>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Mô tả</th>
                <th style={{padding:'12px 8px',textAlign:'center'}}></th>
              </tr>
            </thead>
            <tbody>
              {menus.map(m => (
                <tr key={m.id} style={{borderBottom:'1px solid #f0f0f0',transition:'background 0.2s'}}>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>{m.id}</td>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>{m.name}</td>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>{Number(m.price).toLocaleString()}₫</td>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>{m.category}</td>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>{m.imageUrl && <img src={m.imageUrl} alt={m.name} style={{width:48,height:48,objectFit:'cover',borderRadius:8}} />}</td>
                  <td style={{padding:'10px 8px',maxWidth:180,whiteSpace:'pre-line',overflow:'hidden',textOverflow:'ellipsis',textAlign:'center'}}>{m.description}</td>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>
                    <button onClick={()=>handleEditMenu(m)} style={{background:'#189c38',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:500,marginRight:6,cursor:'pointer'}}>Sửa</button>
                    <button onClick={()=>handleDeleteMenu(m.id)} style={{background:'#fff',color:'#ff4d4f',border:'1px solid #ff4d4f',borderRadius:6,padding:'6px 16px',fontWeight:500,cursor:'pointer'}}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab==='pending' && (
        <div>
          <h4>Đơn chờ nhận</h4>
          <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:12,overflow:'hidden',boxShadow:'0 2px 8px #eee'}}>
            <thead>
              <tr style={{background:'#fafafa',fontWeight:600}}>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Mã đơn</th>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Khách hàng</th>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Tổng tiền</th>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Trạng thái</th>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map(o => (
                <tr key={o.id}>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>{o.id}</td>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>{o.User?.name || o.customerName || o.name || o.userId}</td>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>{Number(o.total).toLocaleString()}₫</td>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>{o.status}</td>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>
                    <button onClick={()=>handleAcceptOrder(o.id)} style={{background:'#189c38',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:500,marginRight:6,cursor:'pointer'}}>Nhận đơn</button>
                    <button onClick={()=>handleRejectOrder(o.id)} style={{background:'#fff',color:'#ff4d4f',border:'1px solid #ff4d4f',borderRadius:6,padding:'6px 16px',fontWeight:500,marginRight:6,cursor:'pointer'}}>Từ chối</button>
                    <button onClick={()=>setSelectedOrder(o)} style={{background:'#189c38',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontWeight:500,cursor:'pointer'}}>Xem chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Modal từ chối đơn */}
          {rejectModal.open && (
            <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.2)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
              <form onSubmit={handleSubmitReject} style={{background:'#fff',padding:32,borderRadius:12,minWidth:320,boxShadow:'0 2px 8px #aaa',display:'flex',flexDirection:'column',gap:16}}>
                <h3>Lý do từ chối đơn #{rejectModal.orderId}</h3>
                <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} placeholder="Nhập lý do từ chối..." rows={4} style={{padding:10,borderRadius:8,border:'1px solid #ddd',fontSize:16}} required />
                <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
                  <button type="button" onClick={()=>setRejectModal({open:false,orderId:null})} style={{background:'#eee',color:'#333',border:'none',borderRadius:8,padding:'8px 18px',fontWeight:500,cursor:'pointer'}}>Hủy</button>
                  <button type="submit" style={{background:'#ff4d4f',color:'#fff',border:'none',borderRadius:8,padding:'8px 24px',fontWeight:600,cursor:'pointer'}}>Xác nhận từ chối</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
      {tab==='accepted' && (
        <div>
          <h4>Đơn đã nhận</h4>
          {/* Thông báo nếu có đơn đã nhận nhưng chưa được gán drone */}
          {orders.some(o => !o.droneId) && (
            <div style={{background:'#fffbe6',color:'#ad8b00',padding:'12px 20px',borderRadius:8,marginBottom:16,fontWeight:500,fontSize:16}}>
              Hiện tại các drone đang trên đường tới. Đợi ít phút nữa.
            </div>
          )}
          <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:12,overflow:'hidden',boxShadow:'0 2px 8px #eee'}}>
            <thead>
              <tr style={{background:'#fafafa',fontWeight:600}}>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Mã đơn</th>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Khách hàng</th>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Tổng tiền</th>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Trạng thái</th>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>{o.id}</td>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>{o.User?.name || o.customerName || o.name || o.userId}</td>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>{Number(o.total).toLocaleString()}₫</td>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>{o.status}</td>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>
                    {o.droneId && o.Drone?.name && (
                      <span style={{marginRight:8,color:'#189c38',fontWeight:500}}>Drone: {o.Drone.name} (#{o.droneId})</span>
                    )}
                    <button
                      onClick={()=>handleCompleteOrder(o.id)}
                      style={{background:'#ff9800',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:500,marginRight:6,cursor:o.droneId?'pointer':'not-allowed',opacity:o.droneId?1:0.5}}
                      disabled={!o.droneId}
                    >Đã hoàn thành</button>
                    <button onClick={()=>setSelectedOrder(o)} style={{background:'#189c38',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontWeight:500,cursor:'pointer'}}>Xem chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab==='history' && (
        <div>
          <h4>Lịch sử đơn đã giao</h4>
          <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:12,overflow:'hidden',boxShadow:'0 2px 8px #eee'}}>
            <thead>
              <tr style={{background:'#fafafa',fontWeight:600}}>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Mã đơn</th>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Khách hàng</th>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Tổng tiền</th>
                <th style={{padding:'12px 8px',textAlign:'center'}}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {history.map(o => (
                <tr key={o.id}>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>{o.id}</td>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>{o.User?.name || o.customerName || o.name || o.userId}</td>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>{Number(o.total).toLocaleString()}₫</td>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>{o.status}</td>
                  <td style={{padding:'10px 8px',textAlign:'center'}}>
                    <button onClick={()=>setSelectedOrder(o)} style={{background:'#189c38',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontWeight:500,cursor:'pointer'}}>Xem chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal xem chi tiết đơn - render ở cuối component để luôn hiển thị đúng */}
      {selectedOrder && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setSelectedOrder(null)}>
          <div style={{background:'#fff',padding:32,borderRadius:12,minWidth:400,maxWidth:600,boxShadow:'0 2px 16px #888',position:'relative'}} onClick={e=>e.stopPropagation()}>
            <h2>Chi tiết đơn #{selectedOrder.id}</h2>
            <div><b>Khách hàng:</b> {selectedOrder.User?.name || selectedOrder.customerName || selectedOrder.name || selectedOrder.userId}</div>
            <div><b>Địa chỉ:</b> {selectedOrder.address}</div>
            <div><b>Tổng tiền:</b> {Number(selectedOrder.total).toLocaleString()}₫</div>
            <div><b>Trạng thái:</b> <span style={{color:selectedOrder.status==='Done'?'#189c38':'#ff4d4f',fontWeight:600}}>{selectedOrder.status}</span></div>
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
  );
};

export default RestaurantDashboard;
