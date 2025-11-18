const safeRequire = (p) => {
  try { return require(p); } catch (e) { return null; }
};

const metrics = safeRequire('./metrics');
const { sequelize } = safeRequire('./models') || {};

// This module polls MySQL for status metrics and exports them as Gauges
// so they appear on the existing /metrics endpoint. It is resilient: if
// permissions or queries fail it logs and keeps trying.

let intervalHandle = null;

function createGauges(client) {
  if (!client) return null;
  const Gauge = client.Gauge;
  return {
    threads_connected: new Gauge({ name: 'mysql_threads_connected', help: 'Threads connected', registers: [client.register] }),
    threads_running: new Gauge({ name: 'mysql_threads_running', help: 'Threads running', registers: [client.register] }),
    queries_total: new Gauge({ name: 'mysql_queries_total', help: 'Global queries total (counter snapshot)', registers: [client.register] }),
    slow_queries_total: new Gauge({ name: 'mysql_slow_queries_total', help: 'Slow queries total', registers: [client.register] }),
    innodb_buffer_pool_pages_free: new Gauge({ name: 'mysql_innodb_buffer_pool_pages_free', help: 'InnoDB buffer pool pages free', registers: [client.register] }),
    innodb_buffer_pool_pages_total: new Gauge({ name: 'mysql_innodb_buffer_pool_pages_total', help: 'InnoDB buffer pool pages total', registers: [client.register] })
  };
}

async function collectOnce(gauges) {
  if (!sequelize || !gauges) return;
  try {
    // Prefer SHOW GLOBAL STATUS (widely supported)
    const [rows] = await sequelize.query("SHOW GLOBAL STATUS");
    const map = {};
    for (const r of rows) map[r.Variable_name] = Number(r.Value);

    if (map.Threads_connected !== undefined) gauges.threads_connected.set(map.Threads_connected);
    if (map.Threads_running !== undefined) gauges.threads_running.set(map.Threads_running);
    if (map.Queries !== undefined) gauges.queries_total.set(map.Queries);
    if (map.Slow_queries !== undefined) gauges.slow_queries_total.set(map.Slow_queries);
    if (map.Innodb_buffer_pool_pages_free !== undefined) gauges.innodb_buffer_pool_pages_free.set(map.Innodb_buffer_pool_pages_free);
    if (map.Innodb_buffer_pool_pages_total !== undefined) gauges.innodb_buffer_pool_pages_total.set(map.Innodb_buffer_pool_pages_total);
  } catch (err) {
    // Some managed DBs restrict access; warn and continue.
    console.warn('dbMetrics: failed to collect MySQL status:', err && err.message);
  }
}

module.exports = {
  start: (opts = {}) => {
    if (!metrics || !metrics.client) {
      console.info('dbMetrics: prom-client not available; skipping DB metrics');
      return;
    }
    if (!sequelize) {
      console.info('dbMetrics: sequelize not available; skipping DB metrics');
      return;
    }
    const client = metrics.client;
    const gauges = createGauges(client);
    const intervalMs = (opts.intervalMs) ? opts.intervalMs : 15000;
    // Do an initial collection
    collectOnce(gauges).catch(() => {});
    intervalHandle = setInterval(() => collectOnce(gauges), intervalMs);
    console.info('dbMetrics: started polling MySQL status every', intervalMs, 'ms');
  },
  stop: () => {
    if (intervalHandle) clearInterval(intervalHandle);
  }
};
