const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db');
// Đảm bảo các model và association được load
require('./src/models');
const userRoutes = require('./src/routes/userRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const errorHandler = require('./src/utils/errorHandler'); // Sửa lại import

const app = express();

// Middleware
app.use(cors()); // Cho phép CORS
app.use(express.json()); // Parse JSON requests

// Kết nối database
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);

// Error handling
app.use(errorHandler);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));