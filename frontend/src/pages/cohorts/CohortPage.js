import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCohort, deleteCohort } from '../../services/cohortService';
import CohortDetail from '../../components/cohorts/CohortDetail';
import CohortMembers from '../../components/cohorts/CohortMembers';
import { Button } from '../../components/common/Button';
import  LoadingSpinner from '../../components/common/LoadingSpinner';

const CohortPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cohort, setCohort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchCohort = async () => {
      try {
        const data = await getCohort(id);
        setCohort(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load cohort');
        console.error('Error fetching cohort:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCohort();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this cohort?')) {
      return;
    }

    try {
      await deleteCohort(id);
      navigate('/cohorts');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete cohort');
      console.error('Error deleting cohort:', err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!cohort) return <div className="text-gray-500">Cohort not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{cohort.name}</h1>
        <div className="space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate(`/cohorts/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 font-medium rounded-t-lg ${
              activeTab === 'details'
                ? 'bg-white border-t border-x text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 font-medium rounded-t-lg ${
              activeTab === 'members'
                ? 'bg-white border-t border-x text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Members
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'details' ? (
          <CohortDetail cohort={cohort} />
        ) : (
          <CohortMembers cohortId={id} />
        )}
      </div>
    </div>
  );
};

export default CohortPage;