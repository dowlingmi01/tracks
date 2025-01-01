// backend/src/middleware/roleAuth.js
const { User, Company } = require('../models');

// Role-based access control
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. Required role: ${roles.join(' or ')}`,
        code: 'INSUFFICIENT_ROLE'
      });
    }
    next();
  };
};

// Company-specific access control
const restrictToCompany = async (req, res, next) => {
  try {
    // Skip company check for SUPERADMIN
    if (req.user.role === 'SUPERADMIN') {
      return next();
    }

    // Get companyId from various possible sources
    const companyId = req.params.companyId || 
                     req.body.companyId || 
                     req.query.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID is required',
        code: 'COMPANY_ID_REQUIRED'
      });
    }

    if (!req.user.companyId) {
      return res.status(403).json({
        status: 'error',
        message: 'User is not associated with any company',
        code: 'NO_COMPANY_ASSOCIATION'
      });
    }

    // Check if user belongs to the requested company
    if (req.user.companyId.toString() !== companyId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied for this company',
        code: 'COMPANY_ACCESS_DENIED'
      });
    }

    // Fetch and attach company data if needed
    if (!req.company) {
      const company = await Company.findByPk(companyId);
      if (!company) {
        return res.status(404).json({
          status: 'error',
          message: 'Company not found',
          code: 'COMPANY_NOT_FOUND'
        });
      }
      req.company = company;
    }

    next();
  } catch (error) {
    console.error('Company access check error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error verifying company access',
      code: 'COMPANY_CHECK_ERROR'
    });
  }
};

// Company admin verification
const isCompanyAdmin = async (req, res, next) => {
  try {
    // Allow SUPERADMIN unrestricted access
    if (req.user.role === 'SUPERADMIN') {
      return next();
    }

    // Verify user exists and is an admin
    const user = await User.findByPk(req.user.id, {
      include: {
        model: Company,
        as: 'company',
        attributes: ['id', 'name']
      }
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin privileges required',
        code: 'ADMIN_REQUIRED'
      });
    }

    // For company-specific operations, verify admin belongs to the right company
    const targetCompanyId = req.params.companyId || 
                          req.body.companyId || 
                          req.query.companyId;

    if (targetCompanyId && user.companyId.toString() !== targetCompanyId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access restricted to own company',
        code: 'COMPANY_ADMIN_MISMATCH'
      });
    }

    // Attach fresh user data to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error verifying admin status',
      code: 'ADMIN_CHECK_ERROR'
    });
  }
};

// Combined middleware for user modification authorization
const authorizeUserModification = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    
    // SUPERADMIN can modify any user
    if (req.user.role === 'SUPERADMIN') {
      return next();
    }

    // Get target user
    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Target user not found',
        code: 'TARGET_USER_NOT_FOUND'
      });
    }

    // Users can modify their own data
    if (targetUserId === req.user.id) {
      return next();
    }

    // ADMIN can only modify non-admin users in their company
    if (req.user.role === 'ADMIN') {
      if (targetUser.companyId !== req.user.companyId) {
        return res.status(403).json({
          status: 'error',
          message: 'Cannot modify users from other companies',
          code: 'COMPANY_MISMATCH'
        });
      }

      if (targetUser.role === 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Cannot modify other admin users',
          code: 'ADMIN_MODIFICATION_DENIED'
        });
      }

      return next();
    }

    // Regular users can't modify other users
    return res.status(403).json({
      status: 'error',
      message: 'Insufficient permissions to modify user',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  } catch (error) {
    console.error('User modification authorization error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error checking modification permissions',
      code: 'AUTH_CHECK_ERROR'
    });
  }
};

module.exports = {
  restrictTo,
  restrictToCompany,
  isCompanyAdmin,
  authorizeUserModification
};