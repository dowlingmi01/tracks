import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCohort } from '../../services/cohortService';
import CohortForm from '../../components/cohorts/CohortForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditCohort = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cohort, setCohort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCohort = async () => {
      try {
        const data = await getCohort(id);
        setCohort(data);
      } catch (err) {
        setError('Failed to load cohort');
        console.error('Error fetching cohort:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCohort();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-red-500">{error}</div>
    </div>
  );
  if (!cohort) return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-gray-500">Cohort not found</div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Cohort: {cohort.name}</h1>
      <CohortForm 
        initialData={cohort}
        mode="edit"
      />
    </div>
  );
};

export default EditCohort;