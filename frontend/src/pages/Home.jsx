import React, { useState, useEffect } from 'react';
import { menuAPI } from '../api/api';
import MenuItem from '../components/MenuItem';


const Home = () => {
	const [menus, setMenus] = useState([]);
	const [search, setSearch] = useState('');
	const [sort, setSort] = useState('default'); // 'asc' | 'desc' | 'default'
	const [page, setPage] = useState(1);
	const pageSize = 12;

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

	// Sort menus by price
	const sortedMenus = React.useMemo(() => {
		if (sort === 'asc') {
			return [...menus].sort((a, b) => a.price - b.price);
		} else if (sort === 'desc') {
			return [...menus].sort((a, b) => b.price - a.price);
		}
		return menus;
	}, [menus, sort]);

	// Pagination
	const totalPages = Math.ceil(sortedMenus.length / pageSize) || 1;
	const pagedMenus = sortedMenus.slice((page-1)*pageSize, page*pageSize);

	return (
		<div>
			<h2 style={{textAlign: 'center', color: '#ff4d4f', margin: '32px 0 16px'}}>Khám phá thực đơn Fastfood</h2>
			<div style={{textAlign: 'center', marginBottom: 24, display:'flex', justifyContent:'center', gap:16}}>
				<input
					type="text"
					placeholder="Tìm món ăn, combo, nhà hàng..."
					style={{padding: '8px 16px', borderRadius: 6, border: '1px solid #ddd', width: 320}}
					onChange={(e) => { setSearch(e.target.value); setPage(1); }}
				/>
				<select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} style={{padding:'8px 16px', borderRadius:6, border:'1px solid #ddd', fontSize:16}}>
					<option value="default">Sắp xếp theo mặc định</option>
					<option value="asc">Giá tăng dần</option>
					<option value="desc">Giá giảm dần</option>
				</select>
			</div>
			<div className="menu-list">
				{pagedMenus.map(menu => <MenuItem key={menu.id} item={menu} />)}
			</div>
			{totalPages > 1 && (
				<div style={{display:'flex',justifyContent:'center',gap:8,margin:'32px 0'}}>
					<button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{padding:'8px 18px',borderRadius:6,border:'1px solid #eee',background:'#fff',color:'#333',fontWeight:600,cursor:page===1?'not-allowed':'pointer'}}>Trước</button>
					{Array.from({length:totalPages},(_,i)=>(
						<button key={i} onClick={()=>setPage(i+1)} style={{padding:'8px 14px',borderRadius:6,border:'none',background:page===i+1?'#ff4d4f':'#eee',color:page===i+1?'#fff':'#333',fontWeight:600,cursor:'pointer'}}>{i+1}</button>
					))}
					<button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{padding:'8px 18px',borderRadius:6,border:'1px solid #eee',background:'#fff',color:'#333',fontWeight:600,cursor:page===totalPages?'not-allowed':'pointer'}}>Sau</button>
				</div>
			)}
		</div>
	);
};

export default Home;
