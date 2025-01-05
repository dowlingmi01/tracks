import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import CohortForm from '../../components/cohorts/CohortForm';

const CreateCohort = () => {
  const { user } = useAuth();
  const companyId = user?.companyId;

  if (!companyId) {
    return <div className="text-center text-gray-500">No company associated with this account.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Cohort</h1>
      <CohortForm companyId={companyId} mode="create" />
    </div>
  );
};

export default CreateCohort;