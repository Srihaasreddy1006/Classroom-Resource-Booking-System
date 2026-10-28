require('dotenv').config();
const { connectDB, disconnectDB } = require('../server/config/db');
const seedData = require('./seedData');

const run = async () => {
  try {
    console.log('--- Starting Classroom Resource Booking Seeder ---');
    await connectDB();
    await seedData();
    console.log('--- Seeding Finished Successfully ---');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Seeder execution error:', err);
    process.exit(1);
  }
};

run();
