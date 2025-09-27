import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user, setUser }) => (
	<header className="header">
		<nav className="navbar">
			<Link className="navbar-brand" to="/">Fastfood Delivery</Link>
			<div>
				<Link to="/cart">Giỏ hàng</Link>
				<Link to="/order-history">Lịch sử đơn</Link>
						{user ? (
							<span style={{marginLeft: 24, color: '#ffd666', fontWeight: 'bold'}}>
								Xin chào, {user.username}!
								<button style={{marginLeft: 16, background: 'none', border: 'none', color: '#fff', cursor: 'pointer'}} onClick={() => setUser(null)}>Đăng xuất</button>
							</span>
						) : (
							<Link to="/login">Đăng nhập</Link>
						)}
			</div>
		</nav>
	</header>
);

export default Header;
