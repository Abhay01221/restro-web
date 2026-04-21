const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shiv-shankar-food';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('[DB] MongoDB error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] MongoDB disconnected. Attempting reconnect...');
    });

  } catch (err) {
    console.error('[DB] MongoDB connection failed:', err.message);
    console.warn('[DB] Server will run without database. Orders will not be persisted.');
    // Don't exit — allow server to run for chat/health endpoints
  }
};

module.exports = connectDB;
