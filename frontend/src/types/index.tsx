// src/types/index.ts

export type UserRole = 'SUPERADMIN' | 'COMPANY_ADMIN' | 'PROGRAM_ADMIN' | 'MODERATOR' | 'MEMBER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  admins: string[];  // User IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface Cohort {
  id: string;
  name: string;
  companyId: string;
  moderators: string[];  // User IDs
  members: string[];     // User IDs
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentModule {
  id: string;
  title: string;
  description: string;
  type: 'READING' | 'VIDEO' | 'QUIZ';
  content: string;
  createdById: string;
  assignedTo: {
    companies?: string[];
    cohorts?: string[];
  };
  pacing: {
    type: 'TIME_BASED' | 'COMPLETION_BASED' | 'IMMEDIATE';
    rules?: any;  // Define specific rules based on pacing type
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  cohortId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  recurring?: boolean;
  recurringRules?: any;  // Define recurring meeting rules
  contentModules?: string[];  // Content module IDs
  createdAt: Date;
  updatedAt: Date;
}