import React, { useState } from 'react';
import './assets/style.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Home from './pages/Home';
import CartPage from './pages/CartPage';
import OrderHistory from './pages/OrderHistory';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [user, setUser] = useState(null);

  return (
    <CartProvider>
      <Router>
        <Header user={user} setUser={setUser} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/login" element={<Login setUser={setUser} />}/>
          <Route path="/register" element={<Register setUser={setUser} />}/>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;