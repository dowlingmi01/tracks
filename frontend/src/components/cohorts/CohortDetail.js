import React from 'react';

const CohortDetail = ({ cohort }) => {
  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="flex justify-end">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          cohort.status === 'active' 
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {cohort.status}
        </span>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Description</h3>
        <p className="mt-2 text-gray-600">
          {cohort.description || 'No description provided'}
        </p>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Start Date</h3>
          <p className="mt-2 text-gray-600">
            {cohort.startDate 
              ? new Date(cohort.startDate).toLocaleDateString()
              : 'Not set'
            }
          </p>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">End Date</h3>
          <p className="mt-2 text-gray-600">
            {cohort.endDate 
              ? new Date(cohort.endDate).toLocaleDateString()
              : 'Not set'
            }
          </p>
        </div>
      </div>

      {/* Company Info */}
      {cohort.company && (
        <div>
          <h3 className="text-lg font-medium text-gray-900">Company</h3>
          <p className="mt-2 text-gray-600">{cohort.company.name}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="bg-gray-50 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cohort Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Total Members</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {cohort.members?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="mt-1 text-gray-900">
              {new Date(cohort.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="mt-1 text-gray-900">
              {new Date(cohort.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CohortDetail;