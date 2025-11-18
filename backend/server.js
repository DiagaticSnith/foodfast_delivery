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
const rumController = require('./src/controllers/rumController');
const { startDroneDispatcher } = require('./src/utils/droneDispatcher');
const dbMetrics = require('./src/dbMetrics');

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

// ---- Prometheus metrics (minimal) ----
let metricsAvailable = false;
try {
	const { register, httpRequestDurationSeconds, httpRequestTotal, httpRequestBytesTotal, httpResponseBytesTotal } = require('./src/metrics');
	metricsAvailable = true;

	// request + bytes metrics middleware
	app.use((req, res, next) => {
		const start = process.hrtime();
		// request size: prefer parsed raw body (set in express.json verify or raw webhook handler),
		// fallback to Content-Length header (may be missing for chunked requests)
		let reqSize = 0;
		try {
			if (req.rawBody) {
				if (Buffer.isBuffer(req.rawBody)) reqSize = req.rawBody.length;
				else if (typeof req.rawBody === 'string') reqSize = Buffer.byteLength(req.rawBody);
			} else {
				reqSize = Number(req.headers['content-length'] || 0);
			}
		} catch (e) {
			reqSize = Number(req.headers['content-length'] || 0) || 0;
		}
		let bytesWritten = 0;
		const origWrite = res.write;
		const origEnd = res.end;

		// wrap write to count bytes
		res.write = function (chunk, encoding, cb) {
			try {
				if (chunk) {
					bytesWritten += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(String(chunk), encoding);
				}
			} catch (e) {}
			return origWrite.apply(this, arguments);
		};

		res.end = function (chunk, encoding, cb) {
			try {
				if (chunk) {
					bytesWritten += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(String(chunk), encoding);
				}
			} catch (e) {}
			return origEnd.apply(this, arguments);
		};

		res.on('finish', () => {
			try {
				const diff = process.hrtime(start);
				const durationSeconds = diff[0] + diff[1] / 1e9;
				const route = (req.baseUrl || '') + (req.route && req.route.path ? req.route.path : req.path);
				httpRequestDurationSeconds.labels(req.method, route, String(res.statusCode)).observe(durationSeconds);
				httpRequestTotal.labels(req.method, route, String(res.statusCode)).inc();
				// increment byte counters (use measured bytesWritten for response, reqSize for request)
				httpRequestBytesTotal.labels(req.method, route, String(res.statusCode)).inc(reqSize || 0);
				httpResponseBytesTotal.labels(req.method, route, String(res.statusCode)).inc(bytesWritten || 0);
			} catch (e) {
				console.warn('metrics error', e && e.message);
			}
		});

		next();
	});

	// expose /metrics (optional token protection via METRICS_TOKEN)
	app.get('/metrics', async (req, res) => {
		try {
			if (process.env.METRICS_TOKEN) {
				const token = req.get('x-metrics-token') || req.query.token;
				if (!token || token !== process.env.METRICS_TOKEN) return res.status(403).send('forbidden');
			}
			res.set('Content-Type', register.contentType);
			res.end(await register.metrics());
		} catch (err) {
			res.status(500).end(err && err.message ? err.message : 'metrics error');
		}
	});
} catch (err) {
	// prom-client not installed or metrics file missing — continue without metrics
	// eslint-disable-next-line no-console
	console.info('Prometheus metrics not available:', err && err.message);
}
// ---- end metrics ----

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
// Ingest frontend RUM (client -> backend -> Prometheus)
// Accept both application/json and sendBeacon/text payloads. If body is text,
// try to JSON.parse it before handing to the controller.
app.post('/api/rum', express.text({ type: '*/*' }), (req, res, next) => {
	if (typeof req.body === 'string') {
		try {
			req.body = JSON.parse(req.body);
		} catch (e) {
			// leave as string; controller will validate
		}
	}
	next();
}, rumController.handleRum);
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
	// Start app-level DB metrics collector (polling)
	try {
		dbMetrics.start({ intervalMs: process.env.DB_METRICS_INTERVAL_MS ? Number(process.env.DB_METRICS_INTERVAL_MS) : 15000 });
	} catch (e) {
		console.warn('Failed to start dbMetrics', e && e.message);
	}
});