import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user, setUser }) => {
    // Xác định đường dẫn về dashboard phù hợp
    let homePath = '/';
    if (user) {
        if (user.role === 'admin') homePath = '/admin-dashboard';
        else if (user.role === 'restaurant') homePath = '/restaurant-dashboard';
        else homePath = '/';
    }
    return (
	<header className="header">
		<nav className="navbar">
			<Link className="navbar-brand" to={homePath}>Fastfood Delivery</Link>
			<div>
				{(!user || user.role !== 'admin') && (
					<>
						<Link to="/cart">Giỏ hàng</Link>
						<Link to="/order-history">Lịch sử đơn</Link>
					</>
				)}
						{user ? (
                                                                <div style={{position:'relative',display:'inline-block',marginLeft:24}}>
                                                                    <button
                                                                        style={{background:'none',border:'none',color:'#ffd666',fontWeight:'bold',fontSize:16,cursor:'pointer',padding:'6px 18px',borderRadius:8}}
                                                                        onClick={e => {
                                                                            const menu = document.getElementById('user-menu-dropdown');
                                                                            if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                                                                        }}
                                                                        onBlur={e => {
                                                                            setTimeout(() => {
                                                                                const menu = document.getElementById('user-menu-dropdown');
                                                                                if (menu) menu.style.display = 'none';
                                                                            }, 150);
                                                                        }}
                                                                    >
                                                                        Xin chào, {user.username} &#x25BC;
                                                                    </button>
                                                                    <div id="user-menu-dropdown" style={{display:'none',position:'absolute',right:0,top:'110%',background:'#fff',boxShadow:'0 2px 8px #eee',borderRadius:8,minWidth:180,zIndex:1000}}>
                                                                                                                                                <a href="/user-info" style={{display:'block',padding:'12px 20px',color:'#333',textDecoration:'none',borderBottom:'1px solid #eee',borderRadius:0,fontWeight:500}}>Thông tin cá nhân</a>
                                                                                                                                                {user.role === 'shipper' && (
                                                                                                                                                    <a href="/shipper-dashboard" style={{display:'block',padding:'12px 20px',color:'#189c38',textDecoration:'none',borderBottom:'1px solid #eee',fontWeight:500}}>Shipper Dashboard</a>
                                                                                                                                                )}
                                                                        <button
                                                                            style={{
                                                                                width: '100%',
                                                                                background: 'none',
                                                                                border: 'none',
                                                                                color: '#ff4d4f',
                                                                                padding: '12px 20px',
                                                                                textAlign: 'left',
                                                                                fontWeight: 500,
                                                                                borderRadius: 0,
                                                                                borderTop: '1px solid #eee',
                                                                                cursor: 'pointer',
                                                                                outline: 'none',
                                                                                transition: 'background 0.2s, color 0.2s'
                                                                            }}
                                                                            onMouseOver={e => {
                                                                                e.currentTarget.style.background = '#f5f5f5';
                                                                                e.currentTarget.style.color = '#d32f2f';
                                                                            }}
                                                                            onMouseOut={e => {
                                                                                e.currentTarget.style.background = 'none';
                                                                                e.currentTarget.style.color = '#ff4d4f';
                                                                            }}
                                                                            onClick={() => { setUser(null); localStorage.clear(); window.location.href = '/'; }}
                                                                        >Đăng xuất</button>
                                                                    </div>
                                                                </div>
						) : (
							<Link to="/login">Đăng nhập</Link>
						)}
			</div>
		</nav>
	</header>

    );
};

export default Header;
