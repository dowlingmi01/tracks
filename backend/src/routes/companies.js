//backend/src/routes/companies.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect } = require('../middleware/auth'); // Changed from { auth } to { protect }

// All routes require authentication
router.use(protect);

// GET all companies
router.get('/', companyController.getAll);

// GET single company
router.get('/:id', companyController.getById);

// POST new company
router.post('/', companyController.create);

// PUT update company
router.put('/:id', companyController.update);

// DELETE company
router.delete('/:id', companyController.delete);

module.exports = router;