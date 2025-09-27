import React, { useEffect, useState } from 'react';
import { orderAPI } from '../api/api';

const OrderHistory = () => {
	const [orders, setOrders] = useState([]);

	useEffect(() => {
		const fetchOrders = async () => {
			const res = await orderAPI.getUserOrders(1); // Mock userId
			setOrders(res.data);
		};
		fetchOrders();
	}, []);

	return (
		<div>
			<h2>Order History</h2>
			{orders.map(order => <div key={order.id}>Order #{order.id} - ${order.total}</div>)}
		</div>
	);
};

export default OrderHistory;
