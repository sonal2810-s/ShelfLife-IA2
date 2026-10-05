const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shelflife';

  try {
    // Attempt standard connection with 2.5s server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`[Database] MongoDB connected successfully to: ${mongoose.connection.host}`);
  } catch (primaryErr) {
    console.warn(`[Database] Could not connect to primary MongoDB at ${uri}: ${primaryErr.message}`);
    
    // In development or when local mongod is not running, provide automatic in-memory fallback
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[Database] Initializing in-memory MongoDB fallback (mongodb-memory-server)...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const memUri = mongoMemoryServer.getUri();
        await mongoose.connect(memUri);
        console.log(`[Database] In-memory MongoDB connected successfully at: ${memUri}`);
      } catch (memErr) {
        console.error('[Database] Failed to initialize in-memory MongoDB fallback:', memErr.message);
        throw primaryErr;
      }
    } else {
      throw primaryErr;
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
