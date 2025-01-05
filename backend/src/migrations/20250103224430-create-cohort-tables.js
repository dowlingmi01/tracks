'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First drop any existing types to ensure clean state
      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS "enum_Cohorts_status" CASCADE;
        DROP TYPE IF EXISTS "enum_CohortMembers_role" CASCADE;
      `);

      // Create enum types
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_Cohorts_status" AS ENUM ('active', 'archived');
      `);

      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_CohortMembers_role" AS ENUM ('member', 'admin');
      `);

      // Create Cohorts table using raw SQL to ensure proper enum handling
      await queryInterface.sequelize.query(`
        CREATE TABLE "Cohorts" (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          description TEXT,
          "companyId" UUID NOT NULL REFERENCES "Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE,
          status "enum_Cohorts_status" NOT NULL DEFAULT 'active'::"enum_Cohorts_status",
          "startDate" TIMESTAMP WITH TIME ZONE,
          "endDate" TIMESTAMP WITH TIME ZONE,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
        );

        CREATE INDEX cohorts_company_id_idx ON "Cohorts"("companyId");
        CREATE INDEX cohorts_status_idx ON "Cohorts"(status);
        CREATE INDEX cohorts_name_idx ON "Cohorts"(name);
      `);

      // Create CohortMembers table using raw SQL
      await queryInterface.sequelize.query(`
        CREATE TABLE "CohortMembers" (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "cohortId" UUID NOT NULL REFERENCES "Cohorts"(id) ON UPDATE CASCADE ON DELETE CASCADE,
          "userId" UUID NOT NULL REFERENCES "Users"(id) ON UPDATE CASCADE ON DELETE CASCADE,
          "joinedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          role "enum_CohortMembers_role" NOT NULL DEFAULT 'member'::"enum_CohortMembers_role",
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          UNIQUE("cohortId", "userId")
        );

        CREATE INDEX cohort_members_cohort_id_idx ON "CohortMembers"("cohortId");
        CREATE INDEX cohort_members_user_id_idx ON "CohortMembers"("userId");
        CREATE INDEX cohort_members_role_idx ON "CohortMembers"(role);
      `);

    } catch (error) {
      console.error('Migration Error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Drop tables first
      await queryInterface.sequelize.query(`
        DROP TABLE IF EXISTS "CohortMembers";
        DROP TABLE IF EXISTS "Cohorts";
      `);

      // Drop enum types
      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS "enum_CohortMembers_role";
        DROP TYPE IF EXISTS "enum_Cohorts_status";
      `);
    } catch (error) {
      console.error('Migration Rollback Error:', error);
      throw error;
    }
  }
};