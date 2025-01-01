const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin'); 
const companiesRouter = require('./routes/companies');
const userRoutes = require('./routes/users');
const { sequelize } = require('./models');

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  console.log('Request body:', req.body);
  next();
});
app.get('/debug/companies-structure', async (req, res) => {
  try {
    const [results] = await sequelize.query('SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = \'Companies\'');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/companies', companiesRouter);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Invalid token' });
  } else if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
  } else {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;