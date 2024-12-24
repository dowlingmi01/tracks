// backend/src/tests/setup.js
const { sequelize } = require('../models');

beforeAll(async () => {
  try {
    // Drop all tables first
    await sequelize.query('DROP SCHEMA public CASCADE;');
    await sequelize.query('CREATE SCHEMA public;');
    
    // Sync database with force
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error('Test database sync error:', error);
    throw error; // Re-throw to fail tests if sync fails
  }
});

afterAll(async () => {
  await sequelize.close();
});