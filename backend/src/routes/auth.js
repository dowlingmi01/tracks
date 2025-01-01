const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../models');
const jwt = require('jsonwebtoken');

// Register route
router.post('/register', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName } = req.body;
    
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await db.User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'USER' // Set default role
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  
    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error' 
    });
  }
});

// Login route
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Use unscoped to get the password field
    const user = await db.User.unscoped().findOne({
      where: { email },
      include: [{
        model: db.Company,
        as: 'company',
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid credentials' 
      });
    }

    // Log for debugging
    console.log('Found user:', {
      id: user.id,
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    });

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      status: 'success',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;