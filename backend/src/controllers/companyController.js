// backend/src/controllers/companyController.js
const { Company } = require('../models');

const companyController = {
  // Get all companies
  async getAll(req, res) {
    try {
      console.log('Getting all companies...');
      const companies = await Company.findAll();
      console.log('Found companies:', companies.length);
      res.json(companies);
    } catch (error) {
      console.error('Error getting companies:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get single company by ID
  async getById(req, res) {
    try {
      const company = await Company.findByPk(req.params.id);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      res.json(company);
    } catch (error) {
      console.error('Error getting company by ID:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create new company
  async create(req, res) {
    try {
      console.log('Creating company with data:', req.body);
      const company = await Company.create(req.body);
      console.log('Created company:', company);
      res.status(201).json(company);
    } catch (error) {
      console.error('Error creating company:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Update company
  async update(req, res) {
    try {
      const company = await Company.findByPk(req.params.id);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      await company.update(req.body);
      res.json(company);
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Delete company
  async delete(req, res) {
    try {
      const company = await Company.findByPk(req.params.id);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      await company.destroy();
      res.json({ message: 'Company deleted successfully' });
    } catch (error) {
      console.error('Error deleting company:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

// Remove the duplicate exports.getById at the bottom
module.exports = companyController;