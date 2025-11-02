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

// Error handler (kept as last middleware)
app.use(errorHandler);

module.exports = app;
