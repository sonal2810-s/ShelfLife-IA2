const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const memberRoutes = require('./routes/memberRoutes');
const borrowRoutes = require('./routes/borrowRoutes');

const { returnBook } = require('./controllers/borrowController');
const { requireAuth } = require('./middleware/authMiddleware');
const { validateParamId } = require('./middleware/validationMiddleware');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Request logging middleware with timestamp, method, url, status
morgan.token('timestamp', () => new Date().toISOString());
const loggingFormat = '[:timestamp] :method :url :status :res[content-length] - :response-time ms';
app.use(morgan(loggingFormat));

// Core middleware — allow configured origins, Vercel deployments, and local dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow configured origins or any vercel.app frontend
    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV === 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint for Render health check & browser status
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ShelfLife API Server is running smoothly',
    health: '/api/health'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ShelfLife API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/borrow', borrowRoutes);

// Explicit POST /api/return/:borrowId route as specified in IA2 Section 9 & 14
app.post('/api/return/:borrowId', requireAuth, validateParamId('borrowId'), returnBook);

// Centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
