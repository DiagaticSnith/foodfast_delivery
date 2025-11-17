const client = require('prom-client');

// Use a dedicated Registry instead of the global one to avoid conflicts
const register = new client.Registry();

// Collect default Node.js / process metrics
client.collectDefaultMetrics({ register, timeout: 5000 });

// HTTP metrics
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestBytesTotal = new client.Counter({
  name: 'http_request_bytes_total',
  help: 'Total bytes received in HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpResponseBytesTotal = new client.Counter({
  name: 'http_response_bytes_total',
  help: 'Total bytes sent in HTTP responses',
  labelNames: ['method', 'route', 'status']
});

// Register custom metrics
register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(httpRequestTotal);
register.registerMetric(httpRequestBytesTotal);
register.registerMetric(httpResponseBytesTotal);

// Business metrics
const ordersCreated = new client.Counter({
  name: 'orders_created_total',
  help: 'Total number of orders created',
  labelNames: ['source']
});

const checkoutSuccess = new client.Counter({
  name: 'checkout_success_total',
  help: 'Total number of successful checkouts',
  labelNames: ['source']
});

const stripeErrors = new client.Counter({
  name: 'stripe_errors_total',
  help: 'Total number of Stripe errors encountered',
  labelNames: ['type']
});

register.registerMetric(ordersCreated);
register.registerMetric(checkoutSuccess);
register.registerMetric(stripeErrors);

module.exports = {
  client,
  register,
  httpRequestDurationSeconds,
  httpRequestTotal
  ,httpRequestBytesTotal
  ,httpResponseBytesTotal
  ,ordersCreated
  ,checkoutSuccess
  ,stripeErrors
};
