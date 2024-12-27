// backend/src/controllers/authController.js
const { User } = require('../models');
const jwt = require('jsonwebtoken');

const authController = {
  register: async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      console.log('Register attempt for:', email);
      
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user with default role
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role: 'USER' // Default role
      });

      // Generate token
      const token = jwt.sign(
        { 
          userId: user.id,
          role: user.role // Include role in token
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role // Include role in response
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        console.log('User not found:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token with role
      const token = jwt.sign(
        { 
          id: user.id,
          role: user.role // Include role in token
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );

      res.json({
        message: 'Logged in successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role, // Include role in response
          companyID: user.companyID
        }
      });
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        stack: error.stack 
      });
      res.status(500).json({ message: 'Error logging in' });  
    }
  }
};

module.exports = authController;