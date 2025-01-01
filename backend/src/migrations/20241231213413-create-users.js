// backend/src/migrations/20241231213413-create-users.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Starting Users migration...');
    try {
      await queryInterface.createTable('Users', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false
        },
        firstName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        lastName: {
          type: Sequelize.STRING,
          allowNull: true
        },
        role: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'USER',
          validate: {
            isIn: [['SUPERADMIN', 'ADMIN', 'USER']]
          }
        },
        companyId: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'Companies',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
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

      console.log('Users table created successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('Error creating Users table:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};