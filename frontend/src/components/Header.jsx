import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ user, setUser }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    // Xác định đường dẫn về dashboard phù hợp
    let homePath = '/';
    if (user) {
        if (user.role === 'admin') homePath = '/admin-dashboard';
        else if (user.role === 'restaurant') homePath = '/restaurant-dashboard';
        else homePath = '/';
    }
    
    return (
        <header className="modern-header">
            <div className="header-container">
                {/* Logo Section */}
                <div className="logo-section">
                    <Link className="brand-logo" to={homePath}>
                        <span className="logo-icon">🍕</span>
                        <span className="brand-text">
                            <span className="brand-name">Foodfast</span>
                            <span className="brand-subtitle">Delivery</span>
                        </span>
                    </Link>
                </div>
                
                {/* Navigation Links - Empty for now */}
                <nav className="nav-links">
                </nav>
                
                {/* User Section */}
                <div className="user-section">
                    {user ? (
                        <>
                            {/* Cart Button - Only for regular users */}
                            {(!user || (user.role !== 'admin' && user.role !== 'restaurant')) && (
                                <Link to="/cart" className="cart-button">
                                    <span className="cart-icon">🛒</span>
                                    <span className="cart-text">Giỏ hàng</span>
                                </Link>
                            )}
                            
                            {/* User Dropdown */}
                            <div className="user-dropdown">
                                <button 
                                    className="user-button"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                                >
                                    <div className="user-avatar">
                                        <span className="avatar-text">
                                            {user.username?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div className="user-info">
                                        <span className="user-greeting">Xin chào</span>
                                        <span className="user-name">{user.username}</span>
                                    </div>
                                    <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>▼</span>
                                </button>
                                
                                {dropdownOpen && (
                                    <div className="dropdown-menu">
                                        <Link to="/user-info" className="dropdown-item">
                                            <span className="dropdown-icon">👤</span>
                                            <span>Thông tin cá nhân</span>
                                        </Link>
                                        
                                        {/* Order History - Only for regular users */}
                                        {(!user || (user.role !== 'admin' && user.role !== 'restaurant')) && (
                                            <Link to="/order-history" className="dropdown-item">
                                                <span className="dropdown-icon">📋</span>
                                                <span>Lịch sử đơn</span>
                                            </Link>
                                        )}
                                        
                                        {user.role === 'shipper' && (
                                            <Link to="/shipper-dashboard" className="dropdown-item shipper">
                                                <span className="dropdown-icon">🚚</span>
                                                <span>Shipper Dashboard</span>
                                            </Link>
                                        )}
                                        
                                        <button 
                                            className="dropdown-item logout"
                                            onClick={() => {
                                                setUser(null);
                                                localStorage.clear();
                                                window.location.href = '/';
                                            }}
                                        >
                                            <span className="dropdown-icon">🚪</span>
                                            <span>Đăng xuất</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link to="/login" className="login-button">
                            <span className="login-icon">🔑</span>
                            <span>Đăng nhập</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
