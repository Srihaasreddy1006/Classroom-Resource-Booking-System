require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(' 🎓 CLASSROOM RESOURCE BOOKING SYSTEM (CRBS) ');
      console.log(' Web Technology (23CS2048) - Internal Assessment 3  ');
      console.log('====================================================');
      console.log(` Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(` Local URL: http://localhost:${PORT}`);
      console.log(` API Endpoint: http://localhost:${PORT}/api`);
      console.log('====================================================');
    });

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[Fatal] Unhandled Rejection: ${err.message}`);
      if (process.env.NODE_ENV === 'production') {
        server.close(() => process.exit(1));
      }
    });

    // Handle SIGTERM/SIGINT
    process.on('SIGINT', () => {
      console.log('\n[System] Gracefully shutting down Classroom Booking Server...');
      server.close(() => {
        console.log('[System] Server closed.');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error(`[Fatal] Server failed to start: ${err.message}`);
    process.exit(1);
  }
};

startServer();
