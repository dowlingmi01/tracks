import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { Button } from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';


const AddMembersModal = ({ isOpen, onClose, onAdd, cohortId, companyId }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, companyId]);

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsersForCompany(companyId);
      const users = response.data; // Extract the data from axios response
      console.log('Received users:', users); // Debug log
      setUsers(users);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUsers.length) return;

    try {
      await onAdd(selectedUsers);
      onClose();
      setSelectedUsers([]);
    } catch (err) {
      setError('Failed to add members');
      console.error('Error adding members:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add Members</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 text-red-500">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="max-h-60 overflow-y-auto mb-4">
              {users.map(user => (
                <label
                  key={user.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      setSelectedUsers(prev =>
                        e.target.checked
                          ? [...prev, user.id]
                          : prev.filter(id => id !== user.id)
                      );
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.email}
                    </div>
                  </div>
                </label>
              ))}

              {users.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No users available
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={selectedUsers.length === 0}
              >
                Add Members ({selectedUsers.length})
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddMembersModal;