const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env'), override: true });
console.log('Loaded MONGO_URI:', process.env.MONGO_URI);

// Initialize Express app
const app = express();

// Connect to MongoDB
(async () => {
  await connectDB();
})();

// Middleware
app.use(express.json()); 

// Simple request logger to help debug Network / CORS issues
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} -> ${req.method} ${req.originalUrl} Origin: ${req.headers.origin || 'none'}`);
  next();
});

// CORS configuration
if (process.env.NODE_ENV === 'development') {
  // Development: allow any origin to avoid CORS issues with local frontends
  app.use(cors({ origin: true, credentials: true }));
} else {
  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const allowedOrigins = [process.env.FRONTEND_URL];
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  };
  app.use(cors(corsOptions));
}

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'QTechy Ticket Management API is running...' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Define the port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});