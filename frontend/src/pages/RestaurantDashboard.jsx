import React, { useEffect, useState } from 'react';
import { api } from '../api/api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useSearchParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import '../styles/admin.css';

const RestaurantDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'menu');

  // Menus state (with pagination + modal create/edit)
  const [menus, setMenus] = useState([]);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [menuForm, setMenuForm] = useState({ name: '', price: '', description: '', category: '', imageUrl: '' });
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [uploadingMenuImage, setUploadingMenuImage] = useState(false);
  const [menuPage, setMenuPage] = useState(1);
  const menuPageSize = 6;

  // Orders state
  const [orders, setOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Revenue stats
  const [revenueData, setRevenueData] = useState([]);

  // Helper: format date/time for display
  const formatDateTime = (input) => {
    if (!input) return '—';
    const d = new Date(input);
    if (isNaN(d.getTime())) return '—';
    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = d.toLocaleDateString('vi-VN');
    return `${time} ${date}`;
  };

  // Reject modal
  const [rejectModal, setRejectModal] = useState({ open: false, orderId: null });
  const [rejectReason, setRejectReason] = useState('');
  // Từ chối đơn
  const handleRejectOrder = (orderId) => {
    setRejectModal({ open: true, orderId });
    setRejectReason('');
  };
  const handleSubmitReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return alert('Vui lòng nhập lý do từ chối!');
    await api.put(`/api/orders/${rejectModal.orderId}/reject`, { reason: rejectReason });
    setRejectModal({ open: false, orderId: null });
    setRejectReason('');
    fetchOrders();
    alert('Đã từ chối đơn!');
  };

  // Fetch menu, orders, history
  useEffect(() => {
    if (user?.role === 'restaurant') {
      fetchMenus();
      fetchOrders();
    }
    // eslint-disable-next-line
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await api.get(`/api/menus?restaurantId=${user.id}`);
      setMenus(res.data || []);
    } catch (err) {
      setMenus([]);
    }
  };
  const fetchOrders = async () => {
    try {
      const res = await api.get(`/api/orders?restaurantId=${user.id}`);
      const allOrders = res.data;
      console.log('Orders từ API:', allOrders);
      console.log('Order đầu tiên:', allOrders[0]);
      setPendingOrders(allOrders.filter(o => o.status === 'Pending'));
      setOrders(allOrders.filter(o => o.status === 'Accepted'));
      const doneOrders = allOrders.filter(o => o.status === 'Done');
      setHistory(doneOrders);
      
      // Tính toán doanh thu theo ngày
      calculateRevenue(doneOrders);
    } catch (err) {
      console.error('Lỗi fetchOrders:', err);
      setPendingOrders([]);
      setOrders([]);
      setHistory([]);
    }
  };

  const calculateRevenue = (doneOrders) => {
    // Group orders by date (day precision)
    const revenueByDate = new Map();
    doneOrders.forEach(order => {
      const d = new Date(order.updatedAt || order.createdAt);
      // Normalize to midnight to group by day
      const normalized = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const ts = normalized.getTime();
      const prev = revenueByDate.get(ts) || 0;
      revenueByDate.set(ts, prev + Number(order.total));
    });

    // Convert to array and sort ascending by timestamp
    const chartData = Array.from(revenueByDate.entries())
      .map(([ts, revenue]) => ({ ts, revenue, dateLabel: new Date(ts).toLocaleDateString('vi-VN') }))
      .sort((a, b) => a.ts - b.ts);

    setRevenueData(chartData);
  };

  // CRUD menu (with modal + upload)
  const openCreateMenu = () => {
    setEditingMenuId(null);
    setMenuForm({ name: '', price: '', description: '', category: '', imageUrl: '' });
    setMenuModalOpen(true);
  };
  const openEditMenu = (m) => {
    setEditingMenuId(m.id);
    setMenuForm({ name: m.name, price: m.price, description: m.description || '', category: m.category || '', imageUrl: m.imageUrl || '' });
    setMenuModalOpen(true);
  };
  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Ẩn món ăn này?')) return;
    await api.delete(`/api/menus/${id}`);
    fetchMenus();
  };
  const handleSubmitMenu = async (e) => {
    e.preventDefault();
    setMenuLoading(true);
    try {
      const body = { ...menuForm, restaurantId: user.id };
      if (editingMenuId) {
        await api.put(`/api/menus/${editingMenuId}`, body);
      } else {
        await api.post('/api/menus', body);
      }
      setMenuModalOpen(false);
      setEditingMenuId(null);
      setMenuForm({ name: '', price: '', description: '', category: '', imageUrl: '' });
      fetchMenus();
    } finally {
      setMenuLoading(false);
    }
  };

  // Nhận đơn
  const handleAcceptOrder = async (orderId) => {
    await api.put(`/api/orders/${orderId}`, { status: 'Accepted' });
    fetchOrders();
    alert('Đã nhận đơn, drone đang di chuyển tới nhà hàng!');
  };
  // Hoàn thành đơn
  const handleCompleteOrder = async (orderId) => {
    await api.put(`/api/orders/${orderId}`, { status: 'Done' });
    fetchOrders();
    alert('Đã hoàn thành đơn!');
  };

  // Change tab and update URL
  const changeTab = (newTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
  };

  return (
  <div className="ff-page ff-container">
      <div className="ff-row ff-gap-12 ff-mb-4">
        <button onClick={()=>changeTab('revenue')} className={`ff-btn ${tab==='revenue' ? 'ff-btn--accent' : 'ff-btn--ghost'}`}>📊 Doanh thu</button>
        <button onClick={()=>changeTab('menu')} className={`ff-btn ${tab==='menu' ? 'ff-btn--accent' : 'ff-btn--ghost'}`}>Quản lý Menu</button>
        <button onClick={()=>changeTab('pending')} className={`ff-btn ${tab==='pending' ? 'ff-btn--accent' : 'ff-btn--ghost'}`}>Đơn chờ nhận</button>
        <button onClick={()=>changeTab('accepted')} className={`ff-btn ${tab==='accepted' ? 'ff-btn--accent' : 'ff-btn--ghost'}`}>Đơn đã nhận</button>
        <button onClick={()=>changeTab('history')} className={`ff-btn ${tab==='history' ? 'ff-btn--accent' : 'ff-btn--ghost'}`}>Lịch sử đơn đã giao</button>
      </div>

      {tab==='revenue' && (
        <div>
          <h4>📊 Biểu đồ Doanh thu</h4>
          
          {/* Tổng quan */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Tổng doanh thu</div>
              <div style={{ fontSize: 28, fontWeight: 'bold' }}>
                {history.reduce((sum, o) => sum + Number(o.total), 0).toLocaleString()}₫
              </div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Đơn hoàn thành</div>
              <div style={{ fontSize: 28, fontWeight: 'bold' }}>{history.length}</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Đơn trung bình</div>
              <div style={{ fontSize: 28, fontWeight: 'bold' }}>
                {history.length > 0 ? Math.round(history.reduce((sum, o) => sum + Number(o.total), 0) / history.length).toLocaleString() : 0}₫
              </div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Đơn chờ xử lý</div>
              <div style={{ fontSize: 28, fontWeight: 'bold' }}>{pendingOrders.length}</div>
            </div>
          </div>

          {/* Biểu đồ đường - Doanh thu theo ngày */}
          {revenueData.length > 0 ? (
            <>
              <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: 24 }}>
                <h5 style={{ marginBottom: 16 }}>Doanh thu theo ngày</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="ts" 
                      type="number" 
                      scale="time" 
                      domain={["auto", "auto"]}
                      tickFormatter={(ts) => new Date(ts).toLocaleDateString('vi-VN')}
                    />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      labelFormatter={(ts) => new Date(ts).toLocaleDateString('vi-VN')}
                      formatter={(value) => `${Number(value).toLocaleString()}₫`} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#ff4d4f" strokeWidth={2} name="Doanh thu" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Biểu đồ cột */}
              <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h5 style={{ marginBottom: 16 }}>Doanh thu theo cột</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="dateLabel"
                    />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value) => `${Number(value).toLocaleString()}₫`} 
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#52c41a" name="Doanh thu" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 48, color: '#888', background: '#f5f5f5', borderRadius: 12 }}>
              Chưa có dữ liệu doanh thu. Hoàn thành một vài đơn hàng để xem biểu đồ!
            </div>
          )}
        </div>
      )}

      {tab==='menu' && (
        <div>
          <div className="ff-toolbar">
            <button onClick={openCreateMenu} className="ff-btn ff-btn--success">+ Thêm món</button>
          </div>

          <table className="ff-table ff-table--wide">
            <thead className="ff-thead">
              <tr>
                <th className="ff-th">ID</th>
                <th className="ff-th">Ảnh</th>
                <th className="ff-th">Tên</th>
                <th className="ff-th">Giá</th>
                <th className="ff-th">Phân loại</th>
                <th className="ff-th">Mô tả</th>
                <th className="ff-th">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {menus.slice((menuPage-1)*menuPageSize, menuPage*menuPageSize).map(m => (
                <tr key={m.id} className="ff-tr">
                  <td className="ff-td">{m.id}</td>
                  <td className="ff-td">
                    <span className="ff-imgbox">
                      {m.imageUrl ? (
                        <img src={m.imageUrl} alt={m.name} className="ff-img" onError={(e)=>{e.currentTarget.style.display='none';}} />
                      ) : (
                        <span className="ff-imgbox__ph">—</span>
                      )}
                    </span>
                  </td>
                  <td className="ff-td">{m.name}</td>
                  <td className="ff-td">{Number(m.price).toLocaleString()}₫</td>
                  <td className="ff-td">{m.category}</td>
                  <td className="ff-td ff-td--preline" style={{maxWidth:240}}>{m.description}</td>
                  <td className="ff-td">
                    <button onClick={()=>openEditMenu(m)} className="ff-btn ff-btn--primary ff-btn--small" style={{marginRight:6}}>Sửa</button>
                    <button onClick={()=>handleDeleteMenu(m.id)} className="ff-btn ff-btn--danger ff-btn--small">Ẩn</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {Math.ceil(menus.length / menuPageSize) > 1 && (
            <div className="ff-pagination">
              <button onClick={()=>setMenuPage(p=>Math.max(1,p-1))} disabled={menuPage===1} className="ff-pagebtn ff-pagebtn--normal">Trước</button>
              {Array.from({length: Math.ceil(menus.length / menuPageSize)}, (_,i)=> (
                <button key={i} onClick={()=>setMenuPage(i+1)} className={`ff-pagebtn ${menuPage===i+1 ? 'ff-pagebtn--secondary' : 'ff-pagebtn--normal'}`}>{i+1}</button>
              ))}
              <button onClick={()=>setMenuPage(p=>Math.min(Math.ceil(menus.length/menuPageSize),p+1))} disabled={menuPage===Math.ceil(menus.length/menuPageSize)} className="ff-pagebtn ff-pagebtn--normal">Sau</button>
            </div>
          )}
        </div>
      )}
      {tab==='pending' && (
        <div>
          <h4>Đơn chờ nhận</h4>
          <table className="ff-table ff-table--wide">
            <thead className="ff-thead">
              <tr>
                <th className="ff-th">Mã đơn</th>
                <th className="ff-th">Khách hàng</th>
                <th className="ff-th">Tổng tiền</th>
                <th className="ff-th">Tạo lúc</th>
                <th className="ff-th">Trạng thái</th>
                <th className="ff-th">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map(o => (
                <tr key={o.id} className="ff-tr">
                  <td className="ff-td">{o.id}</td>
                  <td className="ff-td">{o.User?.name || o.User?.username || o.customerName || `User #${o.userId}`}</td>
                  <td className="ff-td">{Number(o.total).toLocaleString()}₫</td>
                  <td className="ff-td">{formatDateTime(o.createdAt)}</td>
                  <td className="ff-td"><StatusBadge status={o.status} /></td>
                  <td className="ff-td">
                    <button onClick={()=>handleAcceptOrder(o.id)} className="ff-btn ff-btn--success ff-btn--small" style={{marginRight:6}}>Nhận đơn</button>
                    <button onClick={()=>handleRejectOrder(o.id)} className="ff-btn ff-btn--danger ff-btn--small" style={{marginRight:6}}>Từ chối</button>
                    <button onClick={()=>setSelectedOrder(o)} className="ff-btn ff-btn--primary ff-btn--small">Xem chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Modal từ chối đơn */}
          <Modal open={rejectModal.open} title={`Lý do từ chối đơn #${rejectModal.orderId || ''}`} onClose={()=>setRejectModal({open:false,orderId:null})} footer={null}>
            <form onSubmit={handleSubmitReject} className="ff-form">
              <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} placeholder="Nhập lý do từ chối..." rows={4} className="ff-textarea" required />
              <div className="ff-actions">
                <button type="button" onClick={()=>setRejectModal({open:false,orderId:null})} className="ff-btn ff-btn--ghost">Hủy</button>
                <button type="submit" className="ff-btn ff-btn--danger">Xác nhận từ chối</button>
              </div>
            </form>
          </Modal>
        </div>
      )}
      {tab==='accepted' && (
        <div>
          <h4>Đơn đã nhận</h4>
          {orders.some(o => !o.droneId) && (
            <div className="ff-alert--warn">Hiện tại các drone đang trên đường tới. Đợi ít phút nữa.</div>
          )}
          <table className="ff-table ff-table--wide">
            <thead className="ff-thead">
              <tr>
                <th className="ff-th">Mã đơn</th>
                <th className="ff-th">Khách hàng</th>
                <th className="ff-th">Tổng tiền</th>
                <th className="ff-th">Cập nhật lúc</th>
                <th className="ff-th">Trạng thái</th>
                <th className="ff-th">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="ff-tr">
                  <td className="ff-td">{o.id}</td>
                  <td className="ff-td">{o.User?.name || o.User?.username || o.customerName || `User #${o.userId}`}</td>
                  <td className="ff-td">{Number(o.total).toLocaleString()}₫</td>
                  <td className="ff-td">{formatDateTime(o.updatedAt)}</td>
                  <td className="ff-td"><StatusBadge status={o.status} /></td>
                  <td className="ff-td">
                    {o.droneId && o.Drone?.name && (
                      <span style={{marginRight:8,color:'#189c38',fontWeight:500}}>Drone: {o.Drone.name} (#{o.droneId})</span>
                    )}
                    <button onClick={()=>handleCompleteOrder(o.id)} className="ff-btn ff-btn--warning ff-btn--small" disabled={!o.droneId} style={{opacity:o.droneId?1:0.5, marginRight:6}}>Đã hoàn thành</button>
                    <button onClick={()=>setSelectedOrder(o)} className="ff-btn ff-btn--primary ff-btn--small">Xem chi tiết</button>
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
          <table className="ff-table">
            <thead className="ff-thead">
              <tr>
                <th className="ff-th">Mã đơn</th>
                <th className="ff-th">Khách hàng</th>
                <th className="ff-th">Tổng tiền</th>
                <th className="ff-th">Hoàn thành lúc</th>
                <th className="ff-th">Trạng thái</th>
                <th className="ff-th"></th>
              </tr>
            </thead>
            <tbody>
              {history.map(o => (
                <tr key={o.id} className="ff-tr">
                  <td className="ff-td">{o.id}</td>
                  <td className="ff-td">{o.User?.name || o.User?.username || o.customerName || `User #${o.userId}`}</td>
                  <td className="ff-td">{Number(o.total).toLocaleString()}₫</td>
                  <td className="ff-td">{formatDateTime(o.updatedAt)}</td>
                  <td className="ff-td"><StatusBadge status={o.status} /></td>
                  <td className="ff-td">
                    <button onClick={()=>setSelectedOrder(o)} className="ff-btn ff-btn--primary ff-btn--small">Xem chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal thêm/sửa món */}
  <Modal open={menuModalOpen} title={editingMenuId ? 'Cập nhật món' : 'Thêm món mới'} onClose={()=>{ setMenuModalOpen(false); setEditingMenuId(null); }} footer={null} size="lg">
        <form onSubmit={handleSubmitMenu} className="ff-form ff-2col" style={{gap:16}}>
          {/* Left: Upload + Preview */}
          <div>
            <div className="ff-row" style={{flexDirection:'column', gap:12}}>
              <input type="file" accept="image/*" onChange={async (e)=>{
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadingMenuImage(true);
                try {
                  const fd = new FormData();
                  fd.append('image', file);
                  const res = await api.post(`/api/upload?folder=menus`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });
                  setMenuForm(f=>({...f, imageUrl: res.data.url }));
                } catch (err) {
                  const msg = err?.response?.data?.message || err?.message || 'Upload ảnh thất bại';
                  alert(msg);
                } finally {
                  setUploadingMenuImage(false);
                }
              }} />
              {uploadingMenuImage && <span className="ff-muted">Đang tải ảnh...</span>}
              {menuForm.imageUrl && (
                <img src={menuForm.imageUrl} alt="preview-menu" className="ff-img--preview-lg" onError={(e)=>{e.currentTarget.style.display='none';}} />
              )}
            </div>
          </div>
          {/* Right: Fields */}
          <div>
            <div className="ff-row">
              <input className="ff-input" value={menuForm.name} onChange={e=>setMenuForm(f=>({...f,name:e.target.value}))} placeholder="Tên món" required style={{flex:1}} />
              <input className="ff-input" value={menuForm.price} onChange={e=>setMenuForm(f=>({...f,price:e.target.value}))} placeholder="Giá" type="number" min={0} required style={{width:160}} />
            </div>
            <div className="ff-row">
              <input className="ff-input" value={menuForm.category} onChange={e=>setMenuForm(f=>({...f,category:e.target.value}))} placeholder="Phân loại" style={{flex:1}} />
              <input className="ff-input" value={menuForm.imageUrl} onChange={e=>setMenuForm(f=>({...f,imageUrl:e.target.value}))} placeholder="Ảnh (URL)" style={{flex:1}} />
            </div>
            <textarea className="ff-textarea" value={menuForm.description} onChange={e=>setMenuForm(f=>({...f,description:e.target.value}))} placeholder="Mô tả" rows={4} />
            <div className="ff-actions">
              {editingMenuId && <button type="button" onClick={()=>{setEditingMenuId(null); setMenuForm({ name: '', price: '', description: '', category: '', imageUrl: '' });}} className="ff-btn ff-btn--ghost">Hủy sửa</button>}
              <button type="submit" disabled={menuLoading||uploadingMenuImage} className="ff-btn ff-btn--success">{editingMenuId ? 'Cập nhật món' : 'Thêm món'}</button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal xem chi tiết đơn */}
      <Modal open={!!selectedOrder} title={selectedOrder ? `Chi tiết đơn #${selectedOrder.id}` : ''} onClose={()=>setSelectedOrder(null)} footer={null}>
        {selectedOrder && (
          <div style={{maxWidth: '100%', overflow: 'hidden'}}>
            <div style={{marginBottom: 8}}><b>Khách hàng:</b> {selectedOrder.User?.name || selectedOrder.User?.username || selectedOrder.customerName || `User #${selectedOrder.userId}`}</div>
            <div style={{marginBottom: 8}}><b>Địa chỉ:</b> {selectedOrder.address}</div>
            <div style={{marginBottom: 8}}><b>Tổng tiền:</b> {Number(selectedOrder.total).toLocaleString()}₫</div>
            <div style={{marginBottom: 8}}><b>Trạng thái:</b> <StatusBadge status={selectedOrder.status} /></div>
            <div style={{marginBottom: 16}}><b>Drone:</b> {selectedOrder.droneId ? `#${selectedOrder.droneId}` : 'Chưa gán'}</div>
            
            <div style={{marginBottom: 16}}>
              <b>Danh sách món:</b>
            </div>
            <div style={{maxHeight: 400, overflowY: 'auto', width: '100%'}}>
              {(selectedOrder.OrderDetails || []).length === 0 ? (
                <div style={{textAlign: 'center', color: '#888', padding: 16}}>Không có món ăn nào</div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                  {(selectedOrder.OrderDetails || []).map(od => (
                    <div key={od.id} style={{
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 12, 
                      padding: 12, 
                      background: '#f5f5f5', 
                      borderRadius: 8,
                      width: '100%',
                      boxSizing: 'border-box'
                    }}>
                      {od.Menu?.imageUrl && (
                        <img 
                          src={od.Menu.imageUrl} 
                          alt={od.Menu?.name} 
                          style={{width: 50, height: 50, minWidth: 50, objectFit: 'cover', borderRadius: 6, flexShrink: 0}} 
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div style={{flex: 1, minWidth: 0, overflow: 'hidden'}}>
                        <div style={{fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                          {od.Menu?.name || `Món #${od.menuId}`}
                        </div>
                        <div style={{fontSize: 14, color: '#666'}}>Số lượng: {od.quantity}</div>
                      </div>
                      <div style={{fontWeight: 'bold', color: '#ff4d4f', fontSize: 16, flexShrink: 0, whiteSpace: 'nowrap'}}>
                        {Number(od.price * od.quantity).toLocaleString()}₫
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="ff-actions" style={{marginTop: 16}}>
              <button className="ff-btn ff-btn--danger" onClick={()=>setSelectedOrder(null)}>Đóng</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RestaurantDashboard;
