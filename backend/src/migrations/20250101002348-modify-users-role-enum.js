'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Step 1: Create the enum type if it doesn't exist
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
            CREATE TYPE "enum_Users_role" AS ENUM ('SUPERADMIN', 'ADMIN', 'USER');
          END IF;
        END
        $$;
      `);

      // Step 2: Drop the default value if it exists
      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" ALTER COLUMN "role" DROP DEFAULT;
      `);

      // Step 3: Convert the column to use the enum type
      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" 
        ALTER COLUMN "role" TYPE "enum_Users_role" 
        USING role::text::"enum_Users_role";
      `);

      // Step 4: Set the new default value
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
      // Revert the changes
      await queryInterface.sequelize.query(`
        ALTER TABLE "Users" 
        ALTER COLUMN "role" TYPE VARCHAR(255),
        ALTER COLUMN "role" SET DEFAULT 'USER';
      `);

      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS "enum_Users_role";
      `);
    } catch (error) {
      console.error('Migration Rollback Error:', error);
      throw error;
    }
  }
};