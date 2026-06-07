// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');

const auth = require('./src/middleware/auth');
const { errorHandler } = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');
const userRoutes = require('./src/routes/user');
const authRoutes = require('./src/routes/auth');
const doctorRoutes = require('./src/routes/doctor');
const pharmacyRoutes = require('./src/routes/pharmacist');

const { PORT, ALLOWED_ORIGINS, NODE_ENV } = require('./constant.js');
const { ConnectDB } = require('./src/db/connection');

const app = express();

// ===== SECURITY MIDDLEWARE =====
// Helmet - Set security HTTP headers
app.use(helmet());

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many signup/login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// CORS with origin validation
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200,
}));

// General request logging
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.path}`);
  next();
});

// Apply rate limiting
app.use('/api/auth/', authLimiter);
app.use(generalLimiter);

// ===== ROUTES =====
app.use('/api/v1', authRoutes);
app.use('/user', userRoutes);
app.use('/doctor', doctorRoutes);
app.use('/pharmacy', pharmacyRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Global error handler
app.use(errorHandler);

// ===== DATABASE & SERVER =====
ConnectDB().catch((err) => {
  logger.error('Database connection failed:', err);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT} in ${NODE_ENV} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
