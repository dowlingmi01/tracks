// backend/src/controllers/userController.js
const { User, Company } = require('../models');
const { Op } = require('sequelize');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Company,
        as: 'company',
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{
        model: Company,
        as: 'company',
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsersByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const users = await User.findAll({
      where: { companyId },
      include: [{
        model: Company,
        as: 'company',
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, companyId } = req.body;

    // Check for existing user with same email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // If companyId is provided, verify it exists
    if (companyId) {
      const company = await Company.findByPk(companyId);
      if (!company) {
        return res.status(400).json({ error: 'Invalid company ID' });
      }
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role,
      companyId
    });

    // Use the toSafeObject method we created in the model
    res.status(201).json(user.toSafeObject());
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, role, companyId } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If email is being changed, check it's not already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: id } // Exclude current user from check
        }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    // If companyId is provided, verify it exists
    if (companyId && companyId !== user.companyId) {
      const company = await Company.findByPk(companyId);
      if (!company) {
        return res.status(400).json({ error: 'Invalid company ID' });
      }
    }

    // Update user
    await user.update({
      email,
      firstName,
      lastName,
      role,
      companyId
    });

    // Fetch updated user with company information
    const updatedUser = await User.findByPk(id, {
      include: [{
        model: Company,
        as: 'company',
        attributes: ['id', 'name']
      }]
    });

    res.json(updatedUser.toSafeObject());
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Find user with password included
    const user = await User.scope('withPassword').findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    await user.update({ password: newPassword });
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deletion of SUPERADMIN users
    if (user.role === 'SUPERADMIN') {
      return res.status(403).json({ error: 'SUPERADMIN users cannot be deleted' });
    }

    await user.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search users with pagination
exports.searchUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      companyId,
      role 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add search condition
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Add company filter
    if (companyId) {
      whereClause.companyId = companyId;
    }

    // Add role filter
    if (role) {
      whereClause.role = role;
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      include: [{
        model: Company,
        as: 'company',
        attributes: ['id', 'name']
      }],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};