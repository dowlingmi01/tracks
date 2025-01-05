import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCohorts } from '../../services/cohortService';
import { Button } from '../../components/common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const CohortList = ({ companyId }) => {
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const data = await getCohorts(companyId);
        setCohorts(data);
      } catch (err) {
        setError('Failed to load cohorts');
        console.error('Error fetching cohorts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCohorts();
  }, [companyId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cohorts</h2>
        <Link to="/cohorts/new">
          <Button>Create Cohort</Button>
        </Link>
      </div>

      {cohorts.length === 0 ? (
        <p className="text-gray-500">No cohorts found</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cohorts.map((cohort) => (
            <Link 
              key={cohort.id} 
              to={`/cohorts/${cohort.id}`}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{cohort.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {cohort.members?.length || 0} members
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  cohort.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {cohort.status}
                </span>
              </div>
              
              {cohort.description && (
                <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                  {cohort.description}
                </p>
              )}

              <div className="mt-4 text-sm text-gray-500">
                <div>Start: {cohort.startDate ? new Date(cohort.startDate).toLocaleDateString() : 'Not set'}</div>
                <div>End: {cohort.endDate ? new Date(cohort.endDate).toLocaleDateString() : 'Not set'}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CohortList;