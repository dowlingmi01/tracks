//backend/src/routes/companies.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect } = require('../middleware/auth'); 
const { restrictTo } = require('../middleware/roleAuth');

// All routes require authentication
router.use(protect);

// GET all companies - restrict to SUPERADMIN and ADMIN
router.get('/', restrictTo('SUPERADMIN', 'ADMIN'), companyController.getAll);

// GET single company
router.get('/:id', restrictTo('SUPERADMIN', 'ADMIN'), companyController.getById);

// POST new company - restrict to SUPERADMIN
router.post('/', restrictTo('SUPERADMIN'), companyController.create);

// PUT update company - restrict to SUPERADMIN
router.put('/:id', restrictTo('SUPERADMIN'), companyController.update);

// DELETE company - restrict to SUPERADMIN
router.delete('/:id', restrictTo('SUPERADMIN'), companyController.delete);

module.exports = router;