import React, { useState, useEffect } from 'react';
import { setAuthToken } from './api/api';
import './assets/style.css';
import './styles/admin.css';
import './styles/pages.css';
import './styles/modal.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/ToastProvider';
import Header from './components/Header';
import Home from './pages/Home';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RestaurantReviews from './pages/RestaurantReviews';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import Restaurants from './pages/Restaurants';
import Menus from './pages/Menus';
import UserInfo from './pages/UserInfo';
import RestaurantDetail from './pages/RestaurantDetail';
import MenuDetail from './pages/MenuDetail';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import OrderTracking from './pages/OrderTracking';


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
      <ToastProvider>
        <Router>
          <Header user={user} setUser={setUser} />
          <Routes>
          {/* Trang chủ sẽ tự động điều hướng về dashboard phù hợp nếu đã đăng nhập */}
          <Route path="/" element={
            user ? (
              user.role === 'restaurant' ? <RestaurantDashboard /> :
              <Home />
            ) : <Home />
          } />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/login" element={<Login setUser={setUser} />}/>
          <Route path="/register" element={<Register setUser={setUser} />}/>
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/menus" element={<Menus />} />
          <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
          <Route path="/restaurant-reviews" element={<RestaurantReviews />} />
          <Route path="/user-info" element={<UserInfo user={user} setUser={setUser} />} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
          <Route path="/menu/:id" element={<MenuDetail />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
        </Routes>
        </Router>
      </ToastProvider>
    </CartProvider>
  );
}

export default App;