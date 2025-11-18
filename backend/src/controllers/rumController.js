const safeRequire = (path) => {
  try {
    return require(path);
  } catch (e) {
    return null;
  }
};

const metrics = safeRequire('../metrics');

// Handler for frontend push RUM events
// Accepts either a single event or an array of events. Each event should be an object like:
// { type: 'page_load', route: '/checkout', duration_ms: 1234, origin: 'https://app.example' }
// { type: 'js_error', route: '/menu', severity: 'error' }
// { type: 'resource_error', route: '/', resource_type: 'img' }
// { type: 'request', route: '/api/menus', method: 'GET', status: '200', count: 1 }
exports.handleRum = async (req, res) => {
  const body = req.body;
  if (!body) return res.status(400).json({ message: 'empty body' });

  const events = Array.isArray(body) ? body : [body];
  try {
    for (const ev of events) {
      if (!ev || typeof ev !== 'object' || !ev.type) continue;
      const type = ev.type;

      if (metrics && metrics.frontendPageLoadSeconds && type === 'page_load') {
        const durationMs = Number(ev.duration_ms || ev.duration || 0);
        const route = String(ev.route || ev.path || ev.url || 'unknown');
        const origin = String(ev.origin || ev.host || 'unknown');
        if (durationMs > 0) metrics.frontendPageLoadSeconds.labels(route, origin).observe(durationMs / 1000);
      }

      if (metrics && metrics.frontendJsErrors && type === 'js_error') {
        const route = String(ev.route || ev.path || 'unknown');
        const severity = String(ev.severity || 'error');
        metrics.frontendJsErrors.labels(route, severity).inc(1);
      }

      if (metrics && metrics.frontendResourceErrors && type === 'resource_error') {
        const route = String(ev.route || 'unknown');
        const rtype = String(ev.resource_type || ev.resource || 'unknown');
        metrics.frontendResourceErrors.labels(route, rtype).inc(1);
      }

      if (metrics && metrics.frontendRequests && type === 'request') {
        const route = String(ev.route || 'unknown');
        const method = String(ev.method || 'GET');
        const status = String(ev.status || '0');
        const count = Number(ev.count || 1) || 1;
        metrics.frontendRequests.labels(route, method, status).inc(count);
      }
    }

    // Accept, but do not block the client
    return res.status(202).json({ accepted: events.length });
  } catch (err) {
    // Log but return 202 to avoid disturbing UX
    console.warn('RUM ingest error', err && err.message);
    return res.status(202).json({ accepted: 0 });
  }
};
