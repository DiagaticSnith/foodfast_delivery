import React, { useState, useEffect } from 'react';
import { menuAPI } from '../api/api';
import MenuItem from '../components/MenuItem';

const Home = () => {
	const [menus, setMenus] = useState([]);
	const [search, setSearch] = useState('');


	useEffect(() => {
		const fetchMenus = async () => {
			let res;
			if (search && search.trim() !== '') {
				res = await menuAPI.getMenus({ search });
			} else {
				res = await menuAPI.getMenus();
			}
			setMenus(res.data);
		};
		fetchMenus();
	}, [search]);

		return (
			<div>
				<h2 style={{textAlign: 'center', color: '#ff4d4f', margin: '32px 0 16px'}}>Khám phá thực đơn Fastfood</h2>
				<div style={{textAlign: 'center', marginBottom: 24}}>
					<input
						type="text"
						placeholder="Tìm món ăn, combo, nhà hàng..."
						style={{padding: '8px 16px', borderRadius: 6, border: '1px solid #ddd', width: 320}}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<div className="menu-list">
					{menus.map(menu => <MenuItem key={menu.id} item={menu} />)}
				</div>
			</div>
		);
};

export default Home;
