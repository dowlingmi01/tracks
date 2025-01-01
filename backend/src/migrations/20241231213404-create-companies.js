// backend/src/migrations/20241231213404-create-companies.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Starting Companies migration...');
    try {
      await queryInterface.createTable('Companies', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });

      console.log('Companies table created successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('Error creating Companies table:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Companies');
  }
};