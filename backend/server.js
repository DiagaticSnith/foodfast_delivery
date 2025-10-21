require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db');
// Đảm bảo các model và association được load
require('./src/models');

const userRoutes = require('./src/routes/userRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const restaurantRoutes = require('./src/routes/restaurantRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const errorHandler = require('./src/utils/errorHandler'); // Sửa lại import
const droneRoutes = require('./src/routes/droneRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const stripeRoutes = require('./src/routes/stripeRoutes');
const checkoutSuccessRoutes = require('./src/routes/checkoutSuccessRoutes');
const webhookRoutes = require('./src/routes/webhookRoutes');
const orderDetailRoutes = require('./src/routes/orderDetailRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');

const app = express();

// Middleware
app.use(cors()); // Cho phép CORS

// Stripe webhook needs raw body
app.use('/api/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
	// Lưu raw body để Stripe xác thực
	req.rawBody = req.body;
	next();
});
app.use(express.json()); // Parse JSON requests

// Kết nối database
connectDB();

// Routes

app.use('/api/users', userRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/cart', cartRoutes);

app.use('/api/payment', paymentRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/drones', droneRoutes);
app.use('/api/upload', uploadRoutes);

app.use('/api/webhook', webhookRoutes);
app.use('/api/order-details', orderDetailRoutes);
app.use('/api/checkout', checkoutSuccessRoutes);

// Error handling
app.use(errorHandler);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));