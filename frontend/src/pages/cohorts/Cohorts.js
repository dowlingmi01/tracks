import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import CohortList from '../../components/cohorts/CohortList';

const Cohorts = () => {
  const { user } = useAuth();
  const companyId = user?.companyId;

  if (!companyId) {
    return <div className="text-center text-gray-500">No company associated with this account.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CohortList companyId={companyId} />
    </div>
  );
};

export default Cohorts;