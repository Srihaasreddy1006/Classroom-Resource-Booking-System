const mongoose = require('mongoose');

let mongoServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/classroom_resource_booking';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Local MongoDB connection at ${uri} failed: ${err.message}`);
    console.log('[Database] Initializing seamless in-memory MongoDB instance for development/demo...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServerInstance = await MongoMemoryServer.create();
      const memoryUri = mongoServerInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] In-Memory MongoDB Connected at ${memoryUri}`);

      // Auto-seed in-memory database if needed
      const seedDatabase = require('../../scripts/seedData');
      if (typeof seedDatabase === 'function') {
        console.log('[Database] Auto-seeding initial classrooms, resources, and demo accounts...');
        await seedDatabase();
      }

      return conn;
    } catch (memErr) {
      console.error('[Database] Fatal: Failed to initialize in-memory MongoDB fallback:', memErr);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServerInstance) {
    await mongoServerInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
