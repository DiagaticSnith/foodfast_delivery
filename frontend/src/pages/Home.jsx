import React, { useState, useEffect, useMemo } from 'react';
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
		const menusToShow = useMemo(() => {
			const copy = [...menus];
			for (let i = copy.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[copy[i], copy[j]] = [copy[j], copy[i]];
			}
			return copy.slice(0, 8);
		}, [menus]);

	return (
		<div className="site-container">
			{/* Restaurants section */}
			<div className="section">
				<div className="section-header">
					<h2 className="title-accent">🍽️ Nhà hàng nổi bật</h2>
					<button onClick={() => navigate('/restaurants')} className="btn btn-outline">Xem tất cả nhà hàng</button>
				</div>
				{restaurants.length === 0 ? (
					<div className="muted">Chưa có nhà hàng nào.</div>
				) : (
					<div className="grid-4">
						{restaurantsToShow.map(r => (
							<RestaurantCard key={r.id} restaurant={r} />
						))}
					</div>
				)}
			</div>

			{/* Menus section */}
			<div className="section">
				<div className="section-header">
					<h2 className="title-accent">🥡 Món ngon hôm nay</h2>
					<button onClick={() => navigate('/menus')} className="btn btn-outline">Xem tất cả món</button>
				</div>

				{menus.length === 0 ? (
					<div className="muted">Chưa có món ăn nào.</div>
				) : (
					<div className="grid-auto-240">
						{menusToShow.map(menu => (
							<MenuItem key={menu.id} item={menu} />
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Home;
