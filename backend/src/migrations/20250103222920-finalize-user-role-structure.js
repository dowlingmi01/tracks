'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Step 1: Update any invalid values first
      await queryInterface.sequelize.query(`
        UPDATE "Users" 
        SET role = CASE 
          WHEN role IS NULL OR role = '' THEN 'USER'
          WHEN role = 'SUPERADMIN' THEN 'SUPERADMIN'
          WHEN role = 'ADMIN' THEN 'ADMIN'
          ELSE 'USER'
        END;
      `);

      // Step 2: Convert the column to use the enum
      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" 
        ALTER COLUMN role TYPE "enum_Users_role" 
        USING role::text::"enum_Users_role";
      `);

      // Step 3: Set the default value
      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" 
        ALTER COLUMN role SET DEFAULT 'USER'::"enum_Users_role";
      `);

      // Step 4: Make role NOT NULL
      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" 
        ALTER COLUMN role SET NOT NULL;
      `);

    } catch (error) {
      console.error('Migration Error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Step 1: Remove not null constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" 
        ALTER COLUMN role DROP NOT NULL;
      `);

      // Step 2: Remove default
      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" 
        ALTER COLUMN role DROP DEFAULT;
      `);

      // Step 3: Convert back to varchar
      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" 
        ALTER COLUMN role TYPE VARCHAR(255) 
        USING role::text;
      `);
    } catch (error) {
      console.error('Migration Rollback Error:', error);
      throw error;
    }
  }
};