// backend/src/migrations/20241224190822-create-superadmin.js
'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('superadmin123', 12);
    
    await queryInterface.bulkInsert('Users', [{
      id: uuidv4(),
      email: 'superadmin@tracks.com',
      password: hashedPassword,
      firstName: 'Super',  // Added required firstName
      lastName: 'Admin',   // Added lastName if it's required
      role: 'SUPERADMIN',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', { email: 'superadmin@tracks.com' });
  }
};