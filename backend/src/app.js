const express = require('express');
const cors = require('cors');
const errorHandler = require('./utils/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Lightweight health endpoint for integration tests
app.get('/__health', (req, res) => {
  res.json({ ok: true });
});
// liveness: app có chạy không (nhẹ, không check DB)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// readiness: kiểm tra phụ thuộc (ví dụ DB). Sử dụng sequelize nếu bạn đã khởi tạo sequelize.
app.get('/ready', async (req, res) => {
  try {
    // nếu bạn có export `sequelize` từ src/config/db.js
    const { sequelize } = require('./config/db');
    await sequelize.authenticate(); // timeout nhanh, không block lâu
    return res.status(200).json({ ready: true });
  } catch (err) {
    return res.status(503).json({ ready: false, error: err.message });
  }
});
// Error handler (kept as last middleware)
app.use(errorHandler);

module.exports = app;
