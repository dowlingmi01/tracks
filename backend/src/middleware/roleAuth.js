// backend/src/middleware/roleAuth.js
const { User } = require('../models');

const restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to perform this action'
        });
      }
      next();
    };
  };
  
  // Add new middleware for company-specific access
const restrictToCompany = async (req, res, next) => {
    try {
      // Skip company check for SUPERADMIN
      if (req.user.role === 'SUPERADMIN') {
        return next();
      }
  
      const { companyId } = req.params;
      
      // If no companyId in request or user isn't associated with a company
      if (!companyId || !req.user.companyId) {
        return res.status(403).json({
          status: 'error',
          message: 'Company access denied'
        });
      }
  
      // Check if user belongs to the requested company
      if (req.user.companyId.toString() !== companyId) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to access this company'
        });
      }
  
      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error checking company access'
      });
    }
  };
  
  // Add middleware to verify admin status within company
  const isCompanyAdmin = async (req, res, next) => {
    try {
      if (req.user.role === 'SUPERADMIN') {
        return next();
      }
  
      const user = await User.findByPk(req.user.id);
      
      if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Admin privileges required'
        });
      }
  
      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error checking admin status'
      });
    }
  };
  
  module.exports = {
    restrictTo,
    restrictToCompany,
    isCompanyAdmin
  };