// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it exists
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in! Please log in to get access.'
      });
    }

    // 2) Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded); // Keep the debug logging
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Your token has expired. Please log in again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token. Please log in again.',
          code: 'INVALID_TOKEN'
        });
      }
      throw err;
    }

    // 3) Check if user still exists
    const currentUser = await User.findByPk(decoded.userId, {
      include: {
        model: User.sequelize.models.Company,
        as: 'company',
        attributes: ['id', 'name']
      }
    });

    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.',
        code: 'USER_NOT_FOUND'
      });
    }

    // 4) Check if user is still active
    // if (!currentUser.active) {
    //   return res.status(401).json({
    //     status: 'error',
    //     message: 'This user account has been deactivated.',
    //     code: 'USER_INACTIVE'
    //   });
    // }

    // 5) Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed. Please try again.',
      code: 'AUTH_ERROR'
    });
  }
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '1d' 
    }
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    { 
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d' 
    }
  );
};

module.exports = { 
  protect,
  generateToken,
  generateRefreshToken
};