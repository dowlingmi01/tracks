// backend/src/controllers/cohortController.js
const { Cohort, User, CohortMember, Company } = require('../models');
const { Op } = require('sequelize');

// Get all cohorts for a company
const getCohorts = async (req, res) => {
  try {
    const { companyId } = req.params;
    const cohorts = await Cohort.findAll({
      where: { companyId },
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: { attributes: ['role', 'joinedAt'] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(cohorts);
  } catch (error) {
    console.error('Error getting cohorts:', error);
    res.status(500).json({ message: 'Error retrieving cohorts' });
  }
};

// Get a single cohort by ID
const getCohort = async (req, res) => {
  try {
    const { id } = req.params;
    const cohort = await Cohort.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: { attributes: ['role', 'joinedAt'] }
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!cohort) {
      return res.status(404).json({ message: 'Cohort not found' });
    }

    res.json(cohort);
  } catch (error) {
    console.error('Error getting cohort:', error);
    res.status(500).json({ message: 'Error retrieving cohort' });
  }
};

// Create a new cohort
const createCohort = async (req, res) => {
  try {
    const { name, description, companyId, startDate, endDate } = req.body;

    const cohort = await Cohort.create({
      name,
      description,
      companyId,
      startDate: startDate || null,
      endDate: endDate || null,
      status: 'active'
    });

    res.status(201).json(cohort);
  } catch (error) {
    console.error('Error creating cohort:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating cohort' });
  }
};

// Update a cohort
const updateCohort = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, startDate, endDate } = req.body;

    const cohort = await Cohort.findByPk(id);
    if (!cohort) {
      return res.status(404).json({ message: 'Cohort not found' });
    }

    await cohort.update({
      name: name || cohort.name,
      description: description || cohort.description,
      status: status || cohort.status,
      startDate: startDate || cohort.startDate,
      endDate: endDate || cohort.endDate
    });

    res.json(cohort);
  } catch (error) {
    console.error('Error updating cohort:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating cohort' });
  }
};

// Delete a cohort
const deleteCohort = async (req, res) => {
  try {
    const { id } = req.params;
    const cohort = await Cohort.findByPk(id);
    
    if (!cohort) {
      return res.status(404).json({ message: 'Cohort not found' });
    }

    await cohort.destroy();
    res.json({ message: 'Cohort deleted successfully' });
  } catch (error) {
    console.error('Error deleting cohort:', error);
    res.status(500).json({ message: 'Error deleting cohort' });
  }
};

// Get cohort members
const getMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const members = await CohortMember.findAll({
      where: { cohortId: id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['joinedAt', 'DESC']]
    });

    res.json(members);
  } catch (error) {
    console.error('Error getting members:', error);
    res.status(500).json({ message: 'Error retrieving cohort members' });
  }
};

// Add members to a cohort
const addMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds, role = 'member' } = req.body;

    const cohort = await Cohort.findByPk(id);
    if (!cohort) {
      return res.status(404).json({ message: 'Cohort not found' });
    }

    const memberships = await Promise.all(
      userIds.map(async (userId) => {
        try {
          return await CohortMember.create({
            cohortId: id,
            userId,
            role
          });
        } catch (error) {
          if (error.name === 'SequelizeUniqueConstraintError') {
            return null; // Skip if user is already a member
          }
          throw error;
        }
      })
    );

    const validMemberships = memberships.filter(m => m !== null);
    res.status(201).json({
      message: `Added ${validMemberships.length} members to cohort`,
      memberships: validMemberships
    });
  } catch (error) {
    console.error('Error adding members:', error);
    res.status(500).json({ message: 'Error adding members to cohort' });
  }
};

// Remove members from a cohort
const removeMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;

    const deleted = await CohortMember.destroy({
      where: {
        cohortId: id,
        userId: { [Op.in]: userIds }
      }
    });

    res.json({ 
      message: `Removed ${deleted} members from cohort`
    });
  } catch (error) {
    console.error('Error removing members:', error);
    res.status(500).json({ message: 'Error removing members from cohort' });
  }
};

// Update member role
const updateMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    const membership = await CohortMember.findOne({
      where: { cohortId: id, userId }
    });

    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    await membership.update({ role });
    res.json(membership);
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ message: 'Error updating member role' });
  }
};

module.exports = {
  getCohorts,
  getCohort,
  createCohort,
  updateCohort,
  deleteCohort,
  addMembers,
  removeMembers,
  updateMemberRole,
  getMembers
};