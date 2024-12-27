// src/pages/admin/Companies.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001/api';

const Companies = () => {
  const { user, isSuperAdmin } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    active: true
  });

  const getAuthHeaders = () => {
    try {
      const token = localStorage.getItem('auth_token'); // Updated to match AuthContext
      console.log('Retrieved token:', token); // Debug log
      
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

  const fetchCompanies = async () => {
    try {
      const headers = getAuthHeaders();
      console.log('Fetch companies with headers:', headers);

      if (!headers.Authorization) {
        console.error('No authorization header available');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/companies`, {
        headers,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched companies:', data);
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching companies...');
      fetchCompanies();
    }
  }, [user]);

  // Protect the route - after hooks
  if (!user || !isSuperAdmin()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!editingCompany;

    try {
      const url = isEditing 
        ? `${API_BASE_URL}/companies/${editingCompany.id}` 
        : `${API_BASE_URL}/companies`;
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingCompany(null);
        setFormData({ name: '', active: true });
        fetchCompanies();
      } else {
        const errorText = await response.text();
        console.error('Error saving company:', errorText);
      }
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const handleDelete = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
          credentials: 'include'
        });
        
        if (response.ok) {
          fetchCompanies();
        } else {
          const errorText = await response.text();
          console.error('Error deleting company:', errorText);
        }
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    }
  };

  const openEditModal = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      active: company.active
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingCompany(null);
    setFormData({ name: '', active: true });
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Company Management</h1>
        <Button
          onClick={openCreateModal}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Company
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{company.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      company.active 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {company.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{formatDate(company.createdAt)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(company)}
                      className="inline-flex items-center gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(company.id)}
                      className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCompany ? 'Edit Company' : 'Create Company'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCompany ? 'Save Changes' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;