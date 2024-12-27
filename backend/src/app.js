const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin'); 
const companiesRouter = require('./routes/companies');
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

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;