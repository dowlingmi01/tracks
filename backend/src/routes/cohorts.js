const express = require('express');
const router = express.Router();
const cohortController = require('../controllers/cohortController');
const { protect } = require('../middleware/auth');
const { checkCohortAccess, requireCohortAdmin } = require('../middleware/cohortAuth');
const { restrictToCompany } = require('../middleware/roleAuth');

// Debug logs
console.log('Controller:', cohortController);
console.log('Auth:', protect);
console.log('CohortAuth:', { checkCohortAccess, requireCohortAdmin });
console.log('RoleAuth:', { restrictToCompany });

// List and create cohorts for a company
  
  router.get('/:companyId', 
  protect, 
  restrictToCompany, 
  cohortController.getCohorts
);

router.post('/', 
  protect, 
  restrictToCompany, 
  cohortController.createCohort
);

// Specific cohort operations
router.get('/:id/details', 
  protect, 
  checkCohortAccess, 
  cohortController.getCohort
);

router.put('/:id', 
  protect, 
  requireCohortAdmin, 
  cohortController.updateCohort
);

router.delete('/:id', 
  protect, 
  requireCohortAdmin, 
  cohortController.deleteCohort
);

// Membership management
router.get('/:id/members', 
  protect, 
  checkCohortAccess, 
  cohortController.getMembers
);

router.post('/:id/members', 
  protect, 
  requireCohortAdmin, 
  cohortController.addMembers
);

router.delete('/:id/members', 
  protect, 
  requireCohortAdmin, 
  cohortController.removeMembers
);

router.put('/:id/members/:userId', 
  protect, 
  requireCohortAdmin, 
  cohortController.updateMemberRole
);

module.exports = router;