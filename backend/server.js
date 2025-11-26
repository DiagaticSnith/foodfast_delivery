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
const rateLimit = require('express-rate-limit');
const { startDroneDispatcher } = require('./src/utils/droneDispatcher');
const dbMetrics = require('./src/dbMetrics');

const app = express();

if (process.env.TRUST_PROXY && String(process.env.TRUST_PROXY).toLowerCase() === 'false') {
	// explicit opt-out: do not set trust proxy
} else if (process.env.TRUST_PROXY) {
	// use provided value (number or string)
	const val = isNaN(Number(process.env.TRUST_PROXY)) ? process.env.TRUST_PROXY : Number(process.env.TRUST_PROXY);
	app.set('trust proxy', val);
} else {
	// sensible default: trust first proxy hop
	app.set('trust proxy', 1);
}
// Middleware
app.use(cors()); // Cho phép CORS

// Early middleware: measure request bytes (via stream) and response bytes
// This middleware is placed BEFORE body-parsers so we can measure raw incoming bytes
let metricsAvailable = false;
let register, httpRequestDurationSeconds, httpRequestTotal, httpRequestBytesTotal, httpResponseBytesTotal;
try {
	const metrics = require('./src/metrics');
	register = metrics.register;
	httpRequestDurationSeconds = metrics.httpRequestDurationSeconds;
	httpRequestTotal = metrics.httpRequestTotal;
	httpRequestBytesTotal = metrics.httpRequestBytesTotal;
	httpResponseBytesTotal = metrics.httpResponseBytesTotal;
	// blocked counter (optional)
	var blockedByRateLimit = metrics.blockedByRateLimit;
	metricsAvailable = true;
} catch (e) {
	// prom-client / metrics module not available — continue without metrics
	// eslint-disable-next-line no-console
	console.info('Prometheus metrics not available at startup:', e && e.message);
}

app.use((req, res, next) => {
	const start = process.hrtime();

	// Track request size by listening to the data stream (works before body-parsers)
	req._measuredRequestSize = 0;
	req.on('data', (chunk) => {
		try {
			if (chunk) req._measuredRequestSize += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(String(chunk));
		} catch (e) {}
	});

	// Wrap response methods once to count bytes written
	let bytesWritten = 0;
	if (!res.__metrics_wrapped) {
		res.__metrics_wrapped = true;
		const origWrite = res.write;
		const origEnd = res.end;
		// eslint-disable-next-line func-names
		res.write = function (chunk, encoding, cb) {
			try {
				if (chunk) bytesWritten += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(String(chunk), encoding);
			} catch (e) {}
			return origWrite.apply(this, arguments);
		};
		// eslint-disable-next-line func-names
		res.end = function (chunk, encoding, cb) {
			try {
				if (chunk) bytesWritten += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(String(chunk), encoding);
			} catch (e) {}
			return origEnd.apply(this, arguments);
		};
	}

	res.on('finish', () => {
		try {
			const diff = process.hrtime(start);
			const durationSeconds = diff[0] + diff[1] / 1e9;
			const route = (req.baseUrl || '') + (req.route && req.route.path ? req.route.path : req.path);
			const measuredReqSize = req._measuredRequestSize || Number(req.headers['content-length'] || 0) || 0;
			if (metricsAvailable && httpRequestDurationSeconds) {
				httpRequestDurationSeconds.labels(req.method, route, String(res.statusCode)).observe(durationSeconds);
				httpRequestTotal.labels(req.method, route, String(res.statusCode)).inc();
				httpRequestBytesTotal.labels(req.method, route, String(res.statusCode)).inc(measuredReqSize || 0);
				httpResponseBytesTotal.labels(req.method, route, String(res.statusCode)).inc(bytesWritten || 0);
			}
		} catch (e) {
			// eslint-disable-next-line no-console
			console.warn('metrics error', e && e.message);
		}
	});

	next();
});

// Expose /metrics if prom-client / metrics registry was loaded
if (metricsAvailable && register) {
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
}

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

// (Prometheus metrics were initialised earlier to preserve measurement before body parsers)

// Kết nối database
connectDB();

// Rate limiting for API routes (in-memory store). For production use a Redis store.
const apiLimiter = rateLimit({
	windowMs: process.env.RATE_LIMIT_WINDOW_MS ? Number(process.env.RATE_LIMIT_WINDOW_MS) : 60 * 1000,
	max: process.env.RATE_LIMIT_MAX ? Number(process.env.RATE_LIMIT_MAX) : 120,
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res /*, next*/) => {
		try {
			// identify client IP (trusting x-forwarded-for if present)
			const ipHeader = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip || '';
			const ip = String(ipHeader).split(',')[0].trim();
			const route = (req.baseUrl || '') + (req.route && req.route.path ? req.route.path : req.path);
			// increment Prometheus counter (if available)
			try {
				if (metricsAvailable && blockedByRateLimit) blockedByRateLimit.labels(route).inc();
			} catch (e) {}

			// maintain an in-memory top-IP map for debugging (not persistent)
			try {
				if (!global.__blockedIpMap) global.__blockedIpMap = new Map();
				const map = global.__blockedIpMap;
				const now = Date.now();
				const existing = map.get(ip) || { count: 0, lastSeen: 0, routes: {} };
				existing.count += 1;
				existing.lastSeen = now;
				existing.routes[route] = (existing.routes[route] || 0) + 1;
				map.set(ip, existing);
			} catch (e) {}
		} catch (e) {
			// swallow
		}
		res.status(429).json({ message: 'Too many requests, please try again later.' });
	}
});

// Apply rate limiter to all /api routes
app.use('/api', apiLimiter);

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
// Debug endpoint to view recent RUM events received (lightweight)
app.get('/debug/rum-recent', rumController.getRecent);
// Debug endpoint to view top blocked IPs (in-memory) — small, for incident investigation only
app.get('/debug/top-ips', (req, res) => {
	try {
		const map = global.__blockedIpMap || new Map();
		const items = Array.from(map.entries()).map(([ip, v]) => ({ ip, count: v.count, lastSeen: v.lastSeen, routes: v.routes }));
		items.sort((a, b) => b.count - a.count);
		const top = items.slice(0, 50);
		return res.json({ top });
	} catch (e) {
		return res.status(500).json({ error: 'failed to read top ips' });
	}
});
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