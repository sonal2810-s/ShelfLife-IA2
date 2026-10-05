require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const Book = require('./models/Book');
const seedData = require('./utils/seed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is currently empty
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      console.log('[Server] Database is empty. Auto-seeding initial demo data...');
      await seedData();
    }
    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`  ShelfLife API Server running on port ${PORT}`);
      console.log(`  Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Librarian Login: POST /api/auth/login`);
      console.log(`===============================================`);
    });

    const shutdown = async () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] MongoDB disconnected and server stopped.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('[Server] Critical failure during startup:', err.message);
    process.exit(1);
  }
};

startServer();
