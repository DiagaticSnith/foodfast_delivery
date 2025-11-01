
import React, { useEffect, useMemo, useState } from 'react';
import { orderAPI, api } from '../api/api';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';


const OrderHistory = () => {
		const [orders, setOrders] = useState([]);
	const [expanded, setExpanded] = useState(null);
	const [details, setDetails] = useState({});
		const [deliveredPage, setDeliveredPage] = useState(1);
		const deliveredPageSize = 5;
	const navigate = useNavigate();
  const toast = useToast();

	useEffect(() => {
		const user = JSON.parse(localStorage.getItem('user') || '{}');
		const token = localStorage.getItem('token');
		if (!user.id || !token) {
			try { toast.info('Bạn cần đăng nhập để xem lịch sử đơn hàng!'); } catch {}
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

		// Hiển thị cả đơn đang chờ xác nhận/đã xác nhận cùng với đang giao trong mục "Đơn đang giao"
		const deliveringOrders = useMemo(() => {
			const active = new Set(['Pending', 'Accepted', 'Delivering']);
			return orders.filter(o => active.has(o.status));
		}, [orders]);
		const deliveredOrders = useMemo(() => orders.filter(o => o.status === 'Done'), [orders]);
		const deliveredTotalPages = Math.max(1, Math.ceil(deliveredOrders.length / deliveredPageSize));
		const deliveredPaged = useMemo(() => deliveredOrders.slice((deliveredPage-1)*deliveredPageSize, deliveredPage*deliveredPageSize), [deliveredOrders, deliveredPage]);

		const OrderRow = ({ order }) => (
			<div key={order.id} className="oh-row">
				<div className="oh-head">
					<div>
						<b>Đơn #{order.id}</b> - <span className="oh-badge"><StatusBadge status={order.status} /></span>
						<br />
						<span className="oh-sum">Tổng tiền: {Number(order.total).toLocaleString()}₫</span><br />
						<span className="oh-sum">Địa chỉ: {order.address}</span>
					</div>
					<div className="oh-actions">
						{order.status === 'Delivering' && order.droneId && (
							<button 
								className="oh-btn oh-btn--track"
								onClick={() => navigate(`/order-tracking?orderId=${order.id}`)}
							>
								🗺️ Theo dõi
							</button>
						)}
						<button className="oh-btn oh-btn--toggle"
							onClick={async () => {
								setExpanded(expanded === order.id ? null : order.id);
								if (!details[order.id]) await fetchDetails(order.id);
							}}>
							{expanded === order.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
						</button>
					</div>
				</div>
				{expanded === order.id && Array.isArray(details[order.id]) && details[order.id].length > 0 && (
					<div className="oh-details">
						<b>Chi tiết đơn hàng:</b>
						<ul className="oh-list">
							{details[order.id].map(item => (
								<li key={item.id} className="oh-item">
									{item.Menu?.imageUrl ? (
										<img 
											src={item.Menu.imageUrl} 
											alt={item.Menu?.name || 'Món ăn'} 
											className="oh-thumb" 
											onError={(e) => { e.target.style.display = 'none'; }}
										/>
									) : (
										<div className="oh-thumbph">🍽️</div>
									)}
									<div className="oh-info">
										<div className="oh-name">{item.Menu?.name || 'Món ăn'}</div>
										<div className="oh-qty">Số lượng: {item.quantity}</div>
									</div>
									<div className="oh-price">
										{(item.price * item.quantity).toLocaleString()}₫
									</div>
								</li>
							))}
						</ul>
					</div>
				)}
				{expanded === order.id && Array.isArray(details[order.id]) && details[order.id].length === 0 && (
					<div className="oh-muted">
						Không có món ăn nào trong đơn hàng này.
					</div>
				)}
				{expanded === order.id && !details[order.id] && (
					<div className="oh-muted">
						Đang tải chi tiết đơn hàng...
					</div>
				)}
			</div>
		);

		return (
			<div className="site-container">
				<div className="oh">
					<div className="oh-header">
						<h1 className="oh-title">📋 Lịch sử đơn hàng</h1>
						<button onClick={() => navigate('/')} className="btn btn-ghost">← Trang chủ</button>
					</div>

				{/* Đang giao */}
				<h3 className="oh-section">🚚 Đơn đang giao</h3>
				{deliveringOrders.length === 0 ? (
					<div className="oh-empty">Bạn không có đơn nào đang giao.</div>
				) : (
					deliveringOrders.map(o => <OrderRow key={o.id} order={o} />)
				)}

				{/* Đã giao */}
				<h3 className="oh-section">✅ Đơn đã giao</h3>
				{deliveredOrders.length === 0 ? (
					<div className="oh-empty">Chưa có đơn đã giao.</div>
				) : (
					<>
						{deliveredPaged.map(o => <OrderRow key={o.id} order={o} />)}
						{deliveredTotalPages > 1 && (
							<div className="oh-pag">
								<button onClick={() => setDeliveredPage(p => Math.max(1, p-1))} disabled={deliveredPage===1} className="pagebtn pagebtn--outline">Trước</button>
								{Array.from({length: deliveredTotalPages}, (_,i)=> (
									<button key={i} onClick={()=>setDeliveredPage(i+1)} className={`pagebtn ${deliveredPage===i+1?'pagebtn--active':'pagebtn--ghost'}`}>{i+1}</button>
								))}
								<button onClick={() => setDeliveredPage(p => Math.min(deliveredTotalPages, p+1))} disabled={deliveredPage===deliveredTotalPages} className="pagebtn pagebtn--outline">Sau</button>
							</div>
						)}
					</>
				)}
				</div>
			</div>
		);
};

export default OrderHistory;
