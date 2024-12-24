// backend/src/routes/admin.js
const express = require('express');
const router = express.Router();
const { createAdmin, createCompany } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/roleAuth');

router.use(protect); // All routes require authentication

// Only SUPERADMIN can access these routes
router.post('/create-company', restrictTo('SUPERADMIN'), createCompany);
router.post('/create-admin', restrictTo('SUPERADMIN'), createAdmin);

module.exports = router;