const client = require('prom-client');

// Collect default Node.js & process metrics
client.collectDefaultMetrics({ timeout: 5000 });

// Histogram for request durations (seconds)
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

// Counter for total requests
const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code']
});

module.exports = {
  client,
  httpRequestDurationSeconds,
  httpRequestTotal
};
