const { Cohort, CohortMember } = require('../models');

// Check if user has access to cohort
const checkCohortAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Allow SUPERADMIN users to bypass checks
    if (req.user.role === 'SUPERADMIN') {
      return next();
    }

    const cohort = await Cohort.findByPk(id);
    if (!cohort) {
      return res.status(404).json({ message: 'Cohort not found' });
    }

    // Check if user is an admin of their company
    if (req.user.role === 'ADMIN' && req.user.companyId === cohort.companyId) {
      return next();
    }

    // Check if user is a member/admin of the cohort
    const membership = await CohortMember.findOne({
      where: { cohortId: id, userId }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add membership info to request for use in controllers
    req.cohortMembership = membership;
    next();
  } catch (error) {
    console.error('Error checking cohort access:', error);
    res.status(500).json({ message: 'Error checking access' });
  }
};

// Check if user is a cohort admin
const requireCohortAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Allow SUPERADMIN users to bypass checks
    if (req.user.role === 'SUPERADMIN') {
      return next();
    }

    // Check if user is an admin of their company
    const cohort = await Cohort.findByPk(id);
    if (req.user.role === 'ADMIN' && req.user.companyId === cohort.companyId) {
      return next();
    }

    // Check if user is a cohort admin
    const membership = await CohortMember.findOne({
      where: { cohortId: id, userId }
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.cohortMembership = membership;
    next();
  } catch (error) {
    console.error('Error checking cohort admin:', error);
    res.status(500).json({ message: 'Error checking access' });
  }
};

module.exports = {
  checkCohortAccess,
  requireCohortAdmin
};