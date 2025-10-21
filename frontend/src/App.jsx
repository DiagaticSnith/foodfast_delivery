import React, { useState, useEffect } from 'react';
import { setAuthToken } from './api/api';
import './assets/style.css';
import './styles/admin.css';
import './styles/modal.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Home from './pages/Home';
import UserDashboard from './pages/UserDashboard';
import RestaurantDashboard from './pages/RestaurantDashboard';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import Restaurants from './pages/Restaurants';
import AdminDashboard from './pages/AdminDashboard';
import ShipperDashboard from './pages/ShipperDashboard';
import UserInfo from './pages/UserInfo';
import RestaurantDetail from './pages/RestaurantDetail';
import MenuDetail from './pages/MenuDetail';
import CheckoutSuccess from './pages/CheckoutSuccess';


function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    // Nếu có token trong localStorage thì set lại cho axios
    const token = localStorage.getItem('token');
    if (token) setAuthToken(token);
  }, []);

  return (
    <CartProvider>
      <Router>
        <Header user={user} setUser={setUser} />
        <Routes>
          {/* Trang chủ sẽ tự động điều hướng về dashboard phù hợp nếu đã đăng nhập */}
          <Route path="/" element={
            user ? (
              user.role === 'admin' ? <AdminDashboard /> :
              user.role === 'restaurant' ? <RestaurantDashboard /> :
              <Home />
            ) : <Home />
          } />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/login" element={<Login setUser={setUser} />}/>
          <Route path="/register" element={<Register setUser={setUser} />}/>
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/shipper-dashboard" element={<ShipperDashboard />} />
          <Route path="/user-info" element={<UserInfo user={user} setUser={setUser} />} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
          <Route path="/menu/:id" element={<MenuDetail />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;