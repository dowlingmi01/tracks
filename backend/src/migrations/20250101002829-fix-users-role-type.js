'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Step 1: Remove the default constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" 
        ALTER COLUMN "role" DROP DEFAULT;
      `);

      // Step 2: Update any null or empty values to 'USER'
      await queryInterface.sequelize.query(`
        UPDATE "Users" 
        SET role = 'USER' 
        WHERE role IS NULL OR role = '';
      `);

      // Step 3: Convert the column to use enum
      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" 
        ALTER COLUMN "role" TYPE "enum_Users_role" 
        USING role::"enum_Users_role";
      `);

      // Step 4: Add back the default value with the enum type
      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" 
        ALTER COLUMN "role" SET DEFAULT 'USER'::"enum_Users_role";
      `);

    } catch (error) {
      console.error('Migration Error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Convert back to VARCHAR
      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" 
        ALTER COLUMN "role" TYPE VARCHAR(255) 
        USING role::text;
      `);

      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" 
        ALTER COLUMN "role" SET DEFAULT 'USER';
      `);
    } catch (error) {
      console.error('Migration Rollback Error:', error);
      throw error;
    }
  }
};