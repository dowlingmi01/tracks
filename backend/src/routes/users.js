// backend/src/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { 
  restrictTo, 
  restrictToCompany, 
  isCompanyAdmin, 
  authorizeUserModification 
} = require('../middleware/roleAuth');

// Apply auth middleware to all routes
router.use(protect);

// Routes for searching and viewing users
router.get('/search', userController.searchUsers);
router.get('/', restrictTo('ADMIN', 'SUPERADMIN'), userController.getUsers);
router.get('/:id', protect, userController.getUserById);

// Routes for company-specific user management
router.get('/company/:companyId', 
  restrictTo('ADMIN', 'SUPERADMIN'), 
  restrictToCompany, 
  userController.getUsersByCompany
);

// Routes for user creation and modification
router.post('/', 
  restrictTo('SUPERADMIN', 'ADMIN'), 
  userController.createUser
);

router.put('/:id', 
  protect,
  authorizeUserModification,
  userController.updateUser
);

router.delete('/:id', 
  restrictTo('SUPERADMIN'), 
  userController.deleteUser
);

// Password update route with special handling
router.put('/:id/password',
  protect,
  authorizeUserModification,
  userController.updatePassword
);

module.exports = router;