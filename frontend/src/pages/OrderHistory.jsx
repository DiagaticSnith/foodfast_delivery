
import React, { useEffect, useState } from 'react';
import { orderAPI } from '../api/api';
import axios from 'axios';
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
		const res = await axios.get(`/api/order-details/${orderId}`);
		setDetails(prev => ({ ...prev, [orderId]: res.data }));
	};

	return (
		<div style={{ maxWidth: 800, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 32 }}>
			<h2 style={{ color: '#ff4d4f', marginBottom: 32 }}>Lịch sử đơn hàng</h2>
			{orders.length === 0 && <div>Bạn chưa có đơn hàng nào.</div>}
			{orders.map(order => (
				<div key={order.id} style={{ borderBottom: '1px solid #eee', marginBottom: 16, paddingBottom: 16 }}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<div>
											<b>Đơn #{order.id}</b> - 
											<span style={{
												display: 'inline-block',
												marginLeft: 8,
												padding: '2px 16px',
												borderRadius: 16,
												color: '#fff',
												background: order.status === 'Paid' ? '#28a745' : '#ff4d4f',
												fontWeight: 600,
												fontSize: 16
											}}>
												{order.status === 'Paid' ? 'Đã thanh toán' : order.status === 'Unpaid' ? 'Chưa thanh toán' : order.status}
											</span>
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
								{expanded === order.id && Array.isArray(details[order.id]) && (
									<div style={{ marginTop: 16, background: '#fafafa', borderRadius: 8, padding: 16 }}>
										<b>Chi tiết đơn hàng:</b>
										<ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
											{details[order.id].map(item => (
												<li key={item.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 16 }}>
													<img src={item.Menu?.imageUrl} alt={item.Menu?.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
													<span>{item.Menu?.name}</span> x <b>{item.quantity}</b> - <span style={{ color: '#ff4d4f' }}>{item.price.toLocaleString()}₫</span>
												</li>
											))}
										</ul>
									</div>
								)}
								{expanded === order.id && !Array.isArray(details[order.id]) && (
									<div style={{ color: 'red', marginTop: 16 }}>Không có dữ liệu chi tiết đơn hàng.</div>
								)}
				</div>
			))}
		</div>
	);
};

export default OrderHistory;
