const { Company } = require('../models');

const companyController = {
  // Get all companies
  async getAll(req, res) {
    try {
      const companies = await Company.findAll();
      res.json(companies);
    } catch (error) {
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
      res.status(500).json({ error: error.message });
    }
  },

  // Create new company
  async create(req, res) {
    try {
      const company = await Company.create(req.body);
      res.status(201).json(company);
    } catch (error) {
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
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = companyController;