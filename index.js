require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. TRUST PROXY (Critical for Render/Proxy)
// '1' means trust the first proxy (Render/Nginx)
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => res.status(200).json({ status: 'online', uptime: process.uptime() }));
app.use('/auth', authRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
