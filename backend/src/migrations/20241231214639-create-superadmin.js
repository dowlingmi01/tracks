// backend/src/migrations/20241231214639-create-superadmin.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Creating/Updating superadmin user...');
    try {
      // First, check if superadmin exists
      const existingUser = await queryInterface.sequelize.query(
        'SELECT id FROM "Users" WHERE email = :email',
        {
          replacements: { email: 'superadmin@tracks.com' },
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );

      const bcrypt = require('bcryptjs');
      const { v4: uuidv4 } = require('uuid');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('superadmin123', salt);
      const now = new Date();

      if (existingUser && existingUser.length > 0) {
        // Update existing superadmin
        await queryInterface.bulkUpdate('Users', 
          {
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: 'SUPERADMIN',
            updatedAt: now
          },
          { email: 'superadmin@tracks.com' }
        );
        console.log('Superadmin user updated successfully');
      } else {
        // Create new superadmin
        await queryInterface.bulkInsert('Users', [{
          id: uuidv4(),
          email: 'superadmin@tracks.com',
          password: hashedPassword,
          firstName: 'Super',
          lastName: 'Admin',
          role: 'SUPERADMIN',
          createdAt: now,
          updatedAt: now
        }]);
        console.log('Superadmin user created successfully');
      }
    } catch (error) {
      console.error('Error managing superadmin:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', { 
      email: 'superadmin@tracks.com' 
    });
  }
};