import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuAPI, api } from '../api/api';
import MenuItem from '../components/MenuItem';
import RestaurantCard from '../components/RestaurantCard';

const Home = () => {
		const navigate = useNavigate();
		const [restaurants, setRestaurants] = useState([]);
		const [menus, setMenus] = useState([]);

	useEffect(() => {
		const load = async () => {
			try {
				const [restRes, menuRes] = await Promise.all([
					api.get('/api/restaurants'),
					menuAPI.getMenus(),
				]);
				setRestaurants(restRes.data || []);
				setMenus(menuRes.data || []);
			} catch (e) {
				console.error('Lỗi tải dữ liệu trang chủ:', e);
			}
		};
		load();
	}, []);

		const restaurantsToShow = restaurants.slice(0, 4);
		const menusToShow = menus.slice(0, 8);

	return (
		<div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px' }}>
			{/* Restaurants section */}
			<div style={{ marginTop: 16, marginBottom: 32 }}>
				<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
					<h2 style={{ margin: '8px 0', color: '#ff4d4f' }}>🍽️ Nhà hàng nổi bật</h2>
											<button
												onClick={() => navigate('/restaurants')}
												style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 600 }}
											>
												Xem tất cả nhà hàng
											</button>
				</div>
				{restaurants.length === 0 ? (
					<div style={{ color: '#888' }}>Chưa có nhà hàng nào.</div>
				) : (
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
						{restaurantsToShow.map(r => (
							<div key={r.id} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #eee', overflow: 'hidden' }}>
								<RestaurantCard restaurant={r} />
							</div>
						))}
					</div>
				)}
								{/* Removed duplicate center button for restaurants to avoid confusion */}
			</div>

			{/* Menus section */}
			<div style={{ marginTop: 16, marginBottom: 16 }}>
				<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
					<h2 style={{ margin: '8px 0', color: '#ff4d4f' }}>🥡 Món ngon hôm nay</h2>
											<button
												onClick={() => navigate('/menus')}
												style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 600 }}
											>
												Xem tất cả món
											</button>
				</div>

				{menus.length === 0 ? (
					<div style={{ color: '#888' }}>Chưa có món ăn nào.</div>
				) : (
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
						{menusToShow.map(menu => (
							<MenuItem key={menu.id} item={menu} />
						))}
					</div>
				)}

								{/* Removed duplicate center button for menus to avoid confusion */}
			</div>
		</div>
	);
};

export default Home;
