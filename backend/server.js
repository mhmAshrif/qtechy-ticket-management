const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');

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

// Connect to MongoDB and seed default users
const initializeApp = async () => {
  await connectDB();

  const defaultUsers = [
    { name: 'Admin User', email: 'admin@test.com', password: 'password123', role: 'Admin' },
    { name: 'Agent User', email: 'agent@test.com', password: 'password123', role: 'Agent' },
    { name: 'Regular User', email: 'user@test.com', password: 'password123', role: 'User' }
  ];

  for (const userData of defaultUsers) {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      try {
        await User.create(userData);
        console.log(`Created default user: ${userData.email} (${userData.role})`);
      } catch (error) {
        console.error(`Failed to create default user ${userData.email}:`, error.message);
      }
    }
  }
};

initializeApp().catch((error) => {
  console.error('Failed to initialize app:', error);
});

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



// Define the port and the Alwaysdata IP
const PORT = process.env.PORT || 5000;
const HOST = process.env.IP || "0.0.0.0";

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});