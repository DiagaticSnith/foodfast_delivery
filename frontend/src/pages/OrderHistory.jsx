
import React, { useEffect, useState } from 'react';
import { orderAPI, api } from '../api/api';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';


const OrderHistory = () => {
	const [orders, setOrders] = useState([]);
	const [expanded, setExpanded] = useState(null);
	const [details, setDetails] = useState({});
	const navigate = useNavigate();

	useEffect(() => {
		const user = JSON.parse(localStorage.getItem('user') || '{}');
		const token = localStorage.getItem('token');
		if (!user.id || !token) {
			alert('Bạn cần đăng nhập để xem lịch sử đơn hàng!');
			navigate('/login');
			return;
		}
		const fetchOrders = async () => {
			const res = await orderAPI.getUserOrders(user.id, token);
			setOrders(res.data);
		};
		fetchOrders();
	}, [navigate]);

	const fetchDetails = async (orderId) => {
		if (details[orderId]) return;
		try {
			const res = await api.get(`/api/order-details/${orderId}`);
			setDetails(prev => ({ ...prev, [orderId]: res.data }));
		} catch (error) {
			console.error('Error fetching order details:', error);
			setDetails(prev => ({ ...prev, [orderId]: [] }));
		}
	};

	return (
		<div style={{ maxWidth: 800, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 32 }}>
			<h2 style={{ color: '#ff4d4f', marginBottom: 32 }}>Lịch sử đơn hàng</h2>
			{orders.length === 0 && <div>Bạn chưa có đơn hàng nào.</div>}
			{orders.map(order => (
				<div key={order.id} style={{ borderBottom: '1px solid #eee', marginBottom: 16, paddingBottom: 16 }}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<div>
											<b>Đơn #{order.id}</b> - <span style={{marginLeft:8}}><StatusBadge status={order.status} /></span>
											<br />
							<span style={{ color: '#888' }}>Tổng tiền: {order.total.toLocaleString()}₫</span><br />
							<span style={{ color: '#888' }}>Địa chỉ: {order.address}</span>
						</div>
						<button style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontWeight: 500 }}
							onClick={async () => {
								setExpanded(expanded === order.id ? null : order.id);
								if (!details[order.id]) await fetchDetails(order.id);
							}}>
							{expanded === order.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
						</button>
					</div>
								{expanded === order.id && Array.isArray(details[order.id]) && details[order.id].length > 0 && (
									<div style={{ marginTop: 16, background: '#fafafa', borderRadius: 8, padding: 16, width: '100%', boxSizing: 'border-box' }}>
										<b>Chi tiết đơn hàng:</b>
										<ul style={{ margin: '12px 0 0 0', padding: 0, listStyle: 'none' }}>
											{details[order.id].map(item => (
												<li key={item.id} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#fff', borderRadius: 8, width: '100%', boxSizing: 'border-box' }}>
													{item.Menu?.imageUrl ? (
														<img 
															src={item.Menu.imageUrl} 
															alt={item.Menu?.name || 'Món ăn'} 
															style={{ width: 60, height: 60, minWidth: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} 
															onError={(e) => { e.target.style.display = 'none'; }}
														/>
													) : (
														<div style={{ width: 60, height: 60, minWidth: 60, background: '#ddd', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🍽️</div>
													)}
													<div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
														<div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.Menu?.name || 'Món ăn'}</div>
														<div style={{ fontSize: 14, color: '#888' }}>Số lượng: {item.quantity}</div>
													</div>
													<div style={{ fontWeight: 'bold', color: '#ff4d4f', fontSize: 16, flexShrink: 0, whiteSpace: 'nowrap' }}>
														{(item.price * item.quantity).toLocaleString()}₫
													</div>
												</li>
											))}
										</ul>
									</div>
								)}
								{expanded === order.id && Array.isArray(details[order.id]) && details[order.id].length === 0 && (
									<div style={{ color: '#888', marginTop: 16, padding: 16, background: '#fafafa', borderRadius: 8, textAlign: 'center' }}>
										Không có món ăn nào trong đơn hàng này.
									</div>
								)}
								{expanded === order.id && !details[order.id] && (
									<div style={{ color: '#888', marginTop: 16, padding: 16, background: '#fafafa', borderRadius: 8, textAlign: 'center' }}>
										Đang tải chi tiết đơn hàng...
									</div>
								)}
				</div>
			))}
		</div>
	);
};

export default OrderHistory;
