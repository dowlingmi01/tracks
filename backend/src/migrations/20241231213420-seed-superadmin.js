// backend/src/migrations/20241231213403-seed-superadmin.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Creating superadmin user...');
    try {
      const bcrypt = require('bcryptjs');
      const { v4: uuidv4 } = require('uuid');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('superadmin123', salt);

      await queryInterface.bulkInsert('Users', [{
        id: uuidv4(),
        email: 'superadmin@tracks.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPERADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
      console.log('Superadmin user created successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('Error creating superadmin:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', { email: 'superadmin@tracks.com' });
  }
};