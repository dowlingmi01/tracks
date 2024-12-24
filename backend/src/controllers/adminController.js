// backend/src/controllers/adminController.js
const { User, Company } = require('../models');
const bcrypt = require('bcryptjs');

const createCompany = async (req, res) => {
  try {
    const { name } = req.body;

    const company = await Company.create({
      name
    });

    res.status(201).json({
      status: 'success',
      data: company
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName, companyId } = req.body;

    // Verify company exists if companyId provided
    if (companyId) {
      const company = await Company.findByPk(companyId);
      if (!company) {
        return res.status(404).json({
          status: 'error',
          message: 'Company not found'
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'ADMIN',
      companyId
    });

    // Remove password from response
    const adminData = admin.toJSON();
    delete adminData.password;

    res.status(201).json({
      status: 'success',
      data: adminData
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  createCompany,
  createAdmin
};