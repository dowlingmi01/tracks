'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Step 1: Drop the default value if it exists
      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" ALTER COLUMN "role" DROP DEFAULT;
      `);

      // Step 2: Drop NOT NULL constraint if it exists
      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" ALTER COLUMN "role" DROP NOT NULL;
      `);

      // Step 3: Convert existing values to the enum type
      await queryInterface.sequelize.query(`
        UPDATE "Users" SET role = 'USER' WHERE role IS NULL OR role = '';
      `);

      // Step 4: Set the column type to use the existing enum
      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" 
        ALTER COLUMN "role" TYPE "enum_Users_role" 
        USING CASE 
          WHEN role = 'SUPERADMIN' THEN 'SUPERADMIN'::"enum_Users_role"
          WHEN role = 'ADMIN' THEN 'ADMIN'::"enum_Users_role"
          ELSE 'USER'::"enum_Users_role"
        END;
      `);

      // Step 5: Set the default value
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
      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" 
        ALTER COLUMN "role" TYPE VARCHAR(255),
        ALTER COLUMN "role" SET DEFAULT 'USER';
      `);
    } catch (error) {
      console.error('Migration Rollback Error:', error);
      throw error;
    }
  }
};