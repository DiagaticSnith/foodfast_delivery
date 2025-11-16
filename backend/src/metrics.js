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

// Register custom metrics
register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(httpRequestTotal);

module.exports = {
  client,
  register,
  httpRequestDurationSeconds,
  httpRequestTotal
};
