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

// Core middleware — allow configured origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
