const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDb, pool } = require('./db/db');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route for health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Function to connect to the database with retries
const connectWithRetry = async (maxRetries = 5, delay = 5000) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      console.log(`Attempting to connect to database (attempt ${retries + 1}/${maxRetries})...`);
      await initDb();
      console.log('Database initialized successfully');
      return true;
    } catch (error) {
      retries++;
      console.error(`Database connection failed (attempt ${retries}/${maxRetries}):`, error.message);
      
      if (retries >= maxRetries) {
        console.error('Max retries reached. Could not connect to database.');
        return false;
      }
      
      console.log(`Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Initialize server
const startServer = async () => {
  try {
    // Try to connect to the database first
    const dbConnected = await connectWithRetry();
    
    if (!dbConnected) {
      console.log('Warning: Starting server without database connection. Some features may not work.');
    }

    // Routes
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/feedback', require('./routes/feedback'));
    app.use('/api/students', require('./routes/students'));
    app.use('/api/projects', require('./routes/projects'));

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();

module.exports = app;