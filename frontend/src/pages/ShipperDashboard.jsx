import React, { useEffect, useState } from 'react';
import { api } from '../api/api';

const ShipperDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDone, setShowDone] = useState(false);
  const [unassignedOrders, setUnassignedOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [updating, setUpdating] = useState({});
  const [myDrones, setMyDrones] = useState([]);
  const [claiming, setClaiming] = useState({});
  const [tab, setTab] = useState('pending');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      const dronesRes = await api.get('/api/drones');
      const drones = dronesRes.data.filter(d => d.userId === user.id);
      setMyDrones(drones);
      const myDroneIds = drones.map(d => d.id);
      const ordersRes = await api.get('/api/orders');
      const allOrders = ordersRes.data;
      setMyOrders(allOrders.filter(o => myDroneIds.includes(o.droneId)));
      setUnassignedOrders(allOrders.filter(o => !o.droneId));
      setLoading(false);
    };
    if (user.role === 'shipper') fetchData();
  }, [user.id, user.role]);

  if (user.role !== 'shipper') return <div>Bạn không có quyền truy cập trang này.</div>;
  if (loading) return <div>Đang tải dữ liệu...</div>;

  // Chia đơn hàng của bạn thành "Chưa giao" và "Đã giao"
  const myOrdersChuaGiao = myOrders.filter(o => o.status !== 'Done');
  const myOrdersDaGiao = myOrders.filter(o => o.status === 'Done');

  return (
    <div style={{maxWidth:900,margin:'40px auto',background:'#fff',borderRadius:12,boxShadow:'0 2px 8px #eee',padding:32}}>
      <div style={{display:'flex',gap:24,marginBottom:32}}>
        <button onClick={()=>setTab('pending')} style={{padding:'12px 32px',border:'none',borderRadius:10,background:tab==='pending'?'#ff4d4f':'#eee',color:tab==='pending'?'#fff':'#333',fontWeight:600,fontSize:16,cursor:'pointer'}}>Đơn chưa giao</button>
        <button onClick={()=>setTab('done')} style={{padding:'12px 32px',border:'none',borderRadius:10,background:tab==='done'?'#ff4d4f':'#eee',color:tab==='done'?'#fff':'#333',fontWeight:600,fontSize:16,cursor:'pointer'}}>Đơn đã giao</button>
        <button onClick={()=>setTab('unassigned')} style={{padding:'12px 32px',border:'none',borderRadius:10,background:tab==='unassigned'?'#ff4d4f':'#eee',color:tab==='unassigned'?'#fff':'#333',fontWeight:600,fontSize:16,cursor:'pointer'}}>Đơn chưa ai nhận</button>
      </div>
      {tab==='pending' && <>
        {myOrdersChuaGiao.length === 0 && <div>Không có đơn hàng nào chưa giao.</div>}
        {myOrdersChuaGiao.map(order => (
          <div key={order.id} style={{borderBottom:'1px solid #eee',marginBottom:24,paddingBottom:16}}>
            <div><b>Mã đơn:</b> #{order.id}</div>
            <div><b>Địa chỉ giao:</b> {order.address}</div>
            <div><b>Trạng thái:</b> Pending</div>
            <div><b>Tổng tiền:</b> {Number(order.total).toLocaleString()}₫</div>
            <button style={{marginTop:8,background:'#189c38',color:'#fff',border:'none',borderRadius:6,padding:'8px 20px',fontWeight:500,cursor:'pointer'}} onClick={async () => {
              const res = await api.get(`/api/order-details/${order.id}`);
              alert(res.data.map(item => `${item.Menu?.name} x${item.quantity} - ${item.price.toLocaleString()}₫`).join('\n'));
            }}>Xem chi tiết món</button>
            <button
              style={{marginTop:8,marginLeft:12,background:'#ff9800',color:'#fff',border:'none',borderRadius:6,padding:'8px 20px',fontWeight:500,cursor:updating[order.id]?'not-allowed':'pointer'}}
              disabled={updating[order.id]}
              onClick={async () => {
                setUpdating(u => ({...u, [order.id]: true}));
                const token = localStorage.getItem('token');
                  await api.put(`/api/orders/${order.id}`, { status: 'Done' }, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                // Refresh orders
                setLoading(true);
                const dronesRes = await api.get('/api/drones');
                const drones = dronesRes.data.filter(d => d.userId === user.id);
                setMyDrones(drones);
                const myDroneIds = drones.map(d => d.id);
                const ordersRes = await api.get('/api/orders');
                const allOrders = ordersRes.data;
                setMyOrders(allOrders.filter(o => myDroneIds.includes(o.droneId)));
                setUnassignedOrders(allOrders.filter(o => !o.droneId));
                setUpdating(u => ({...u, [order.id]: false}));
                setLoading(false);
              }}
            >Xác nhận đã giao</button>
          </div>
        ))}
      </>}
      {tab==='done' && <>
        {myOrdersDaGiao.length === 0 && <div>Không có đơn hàng nào đã giao.</div>}
        {myOrdersDaGiao.map(order => (
          <div key={order.id} style={{borderBottom:'1px solid #eee',marginBottom:24,paddingBottom:16,opacity:0.7}}>
            <div><b>Mã đơn:</b> #{order.id}</div>
            <div><b>Địa chỉ giao:</b> {order.address}</div>
            <div><b>Trạng thái:</b> Done</div>
            <div><b>Tổng tiền:</b> {Number(order.total).toLocaleString()}₫</div>
            <button style={{marginTop:8,background:'#189c38',color:'#fff',border:'none',borderRadius:6,padding:'8px 20px',fontWeight:500,cursor:'pointer'}} onClick={async () => {
              const res = await api.get(`/api/order-details/${order.id}`);
              alert(res.data.map(item => `${item.Menu?.name} x${item.quantity} - ${item.price.toLocaleString()}₫`).join('\n'));
            }}>Xem chi tiết món</button>
          </div>
        ))}
      </>}
      {tab==='unassigned' && <>
        {unassignedOrders.length === 0 && <div>Không có đơn hàng nào chưa nhận.</div>}
        {unassignedOrders.map(order => (
          <div key={order.id} style={{borderBottom:'1px solid #eee',marginBottom:24,paddingBottom:16}}>
            <div><b>Mã đơn:</b> #{order.id}</div>
            <div><b>Địa chỉ giao:</b> {order.address}</div>
            <div><b>Trạng thái:</b> Pending</div>
            <div><b>Tổng tiền:</b> {Number(order.total).toLocaleString()}₫</div>
            <button
              style={{marginTop:8,background:'#189c38',color:'#fff',border:'none',borderRadius:6,padding:'8px 20px',fontWeight:500,cursor:claiming[order.id]?'not-allowed':'pointer'}}
              disabled={claiming[order.id] || myDrones.length === 0}
              onClick={async () => {
                if (myDrones.length === 0) { alert('Bạn chưa có drone để nhận đơn!'); return; }
                setClaiming(c => ({...c, [order.id]: true}));
                // Gán drone đầu tiên của shipper cho đơn này
                await api.put(`/api/orders/${order.id}/assign-drone`, { droneId: myDrones[0].id });
                setClaiming(c => ({...c, [order.id]: false}));
                // Refresh orders
                setLoading(true);
                const dronesRes = await api.get('/api/drones');
                const drones = dronesRes.data.filter(d => d.userId === user.id);
                setMyDrones(drones);
                const myDroneIds = drones.map(d => d.id);
                const ordersRes = await api.get('/api/orders');
                const allOrders = ordersRes.data;
                setMyOrders(allOrders.filter(o => myDroneIds.includes(o.droneId)));
                setUnassignedOrders(allOrders.filter(o => !o.droneId));
                setLoading(false);
              }}
            >Nhận đơn</button>
          </div>
        ))}
      </>}
    </div>
  );
};

export default ShipperDashboard;
