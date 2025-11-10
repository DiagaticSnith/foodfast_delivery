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
const reviewRoutes = require('./src/routes/reviewRoutes');
const { startDroneDispatcher } = require('./src/utils/droneDispatcher');

const app = express();

// Middleware
app.use(cors()); // Cho phép CORS

// Stripe webhook needs raw body
app.use('/api/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
	// Lưu raw body để Stripe xác thực
	req.rawBody = req.body;
	next();
});
// Parse JSON requests and keep a copy of the raw body for debugging malformed JSON
app.use(express.json({
	verify: (req, res, buf) => {
		// store raw body (string) so error handlers can log it when parse fails
		try { req.rawBody = buf.toString(); } catch (e) { req.rawBody = undefined; }
	}
}));

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
// review routes (menus/:id/reviews, reviews/:id)
app.use('/api', reviewRoutes);

// Error handling
// Catch body-parser / JSON parse errors and return a 400 with diagnostic logging
app.use((err, req, res, next) => {
	if (err && err instanceof SyntaxError && err.status === 400 && 'body' in err) {
		// Log useful context to help correlate with deployment logs (request id from proxy if present)
		console.error('Malformed JSON in request body', {
			message: err.message,
			url: req.originalUrl,
			method: req.method,
			headers: req.headers,
			rawBody: req.rawBody
		});
		return res.status(400).json({ message: 'Malformed JSON in request body' });
	}
	next(err);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running on port ${PORT}`);
	startDroneDispatcher({ intervalMs: 4000, burst: 5 });
});