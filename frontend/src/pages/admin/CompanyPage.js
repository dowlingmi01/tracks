// src/pages/admin/CompanyDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { ArrowLeft, Building2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001/api';

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('No auth_token found in localStorage');
        return {};
      }

      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': '*/*'
      };
    } catch (error) {
      console.error('Error getting auth headers:', error);
      return {};
    }
  };

  const fetchCompanyDetails = async () => {
    try {
      const headers = getAuthHeaders();

      if (!headers.Authorization) {
        console.error('No authorization header available');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched company details:', data);
      setCompany(data);
    } catch (error) {
      console.error('Error fetching company details:', error);
      setError('Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCompanyDetails();
    }
  }, [user, id]);

  // Protect the route
  if (!user || !isSuperAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/companies')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Companies
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/companies')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Companies
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-gray-500" />
            <h1 className="text-2xl font-bold">{company.name}</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Status</h3>
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                company.active 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {company.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Created</h3>
              <p className="text-gray-600">
                {new Date(company.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Add any additional company details you want to display */}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;