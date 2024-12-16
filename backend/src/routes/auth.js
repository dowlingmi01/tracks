const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../models');
const jwt = require('jsonwebtoken');

// Registration route
router.post('/register', [
  // Validation middleware remains the same
], async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Pre-save hash:', hashedPassword);

    // Create user
    const user = await db.User.create({
      email,
      password: hashedPassword,
      name
    });

    // Verify the stored hash
    const savedUser = await db.User.findOne({ where: { email } });
    console.log('Post-save hash:', savedUser.password);
    
    // Test verification
    const verifyOriginal = await bcrypt.compare(password, hashedPassword);
    const verifySaved = await bcrypt.compare(password, savedUser.password);
    console.log('Verification results:', {
      originalHash: verifyOriginal,
      savedHash: verifySaved
    });
    // Rest of the registration code remains the same
    const userResponse = user.toJSON();
    delete userResponse.password;

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  
    res.status(201).json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route stays the same

  router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);

        // Find user by email
        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }
       
        // Compare password
        console.log('Comparing passwords...');
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            console.log('Invalid password');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send response
        const userResponse = user.toJSON();
        delete userResponse.password;

        console.log('Login successful');
        res.json({
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
module.exports = router;