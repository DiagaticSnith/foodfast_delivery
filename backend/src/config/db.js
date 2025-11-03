require('dotenv').config();
const { Sequelize } = require('sequelize');
const net = require('net');

// Build a connection URI from common Railway-provided envs or fall back to individual vars
function resolveDatabaseUri() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.MYSQL_URL) return process.env.MYSQL_URL;
  if (process.env.MYSQL_PUBLIC_URL) return process.env.MYSQL_PUBLIC_URL;

  // Railway typically exposes RAILWAY_PRIVATE_DOMAIN and RAILWAY_TCP_PROXY_DOMAIN
  // The project may also have MYSQLHOST / MYSQL_* envs set as shown in Railway variables
  const host = process.env.DB_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.RAILWAY_PRIVATE_DOMAIN || process.env.RAILWAY_TCP_PROXY_DOMAIN;
  const port = process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT || '3306';
  const database = process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE;
  const user = process.env.DB_USER || process.env.MYSQLUSER || process.env.MYSQL_USER || process.env.MYSQLUSER || 'root';
  const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || '';

  if (database && user && host) {
    return `mysql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  }

  return null;
}

const connectionUri = resolveDatabaseUri();

const commonOptions = {
  dialect: 'mysql',
  timezone: '+07:00',
  dialectOptions: {
    charset: 'utf8mb4',
    dateStrings: true,
    typeCast: true,
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  logging: false,
};

let sequelize;
if (connectionUri) {
  console.log('Using DB connection URI');
  sequelize = new Sequelize(connectionUri, commonOptions);
} else {
  console.log('Using individual DB env vars');
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || process.env.MYSQLHOST || process.env.RAILWAY_PRIVATE_DOMAIN || process.env.RAILWAY_TCP_PROXY_DOMAIN,
      port: process.env.DB_PORT || '3306',
      ...commonOptions,
    }
  );
}

const connectDB = async () => {
  const maxRetries = parseInt(process.env.DB_CONNECT_RETRIES || '10', 10);
  const baseDelay = parseInt(process.env.DB_CONNECT_RETRY_DELAY_MS || '1000', 10);
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      await sequelize.authenticate();
      console.log('MySQL Connected');
      try {
        await sequelize.query("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");
      } catch (e) {
        console.warn('Warning: failed to set UTF8MB4 at session level:', e?.message || e);
      }
      return;
    } catch (err) {
      attempt += 1;
      console.error(`MySQL connection attempt ${attempt} failed:`, err?.message || err);
      if (attempt > maxRetries) {
        console.error('All MySQL connection attempts failed. Exiting.');
        process.exit(1);
      }
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying DB connect in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};

module.exports = { sequelize, connectDB };