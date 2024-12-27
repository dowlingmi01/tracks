'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Companies', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('Companies', 'address', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Companies', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Companies', 'description');
    await queryInterface.removeColumn('Companies', 'address');
    await queryInterface.removeColumn('Companies', 'phoneNumber');
  }
};