import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getMembers, addMembers, removeMembers, updateMemberRole } from '../../services/cohortService';
import { Button } from '../../components/common/Button';
import LoadingSpinner from '../common/LoadingSpinner';  // Fixed import
import AddMembersModal from './AddMembersModal';

const CohortMembers = ({ cohortId }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [cohortId]);

  const fetchMembers = async () => {
    try {
      const data = await getMembers(cohortId);
      setMembers(data);
    } catch (err) {
      setError('Failed to load members');
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMembers = async (userIds) => {
    try {
      const response = await addMembers(cohortId, { userIds });
      await fetchMembers(); // Refresh the list
      return response;
    } catch (err) {
      setError('Failed to add members');
      console.error('Error adding members:', err);
      throw err;
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateMemberRole(cohortId, userId, newRole);
      setMembers(members.map(member => 
        member.user.id === userId 
          ? { ...member, role: newRole }
          : member
      ));
    } catch (err) {
      setError('Failed to update member role');
      console.error('Error updating role:', err);
    }
  };

  const handleRemoveMembers = async () => {
    if (!selectedMembers.length) return;
    
    if (!window.confirm(`Are you sure you want to remove ${selectedMembers.length} member(s)?`)) {
      return;
    }

    try {
      await removeMembers(cohortId, selectedMembers);
      setMembers(members.filter(member => !selectedMembers.includes(member.user.id)));
      setSelectedMembers([]);
    } catch (err) {
      setError('Failed to remove members');
      console.error('Error removing members:', err);
    }
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      {/* Actions Bar */}
      <div className="mb-6 flex justify-between items-center">
        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Members
        </Button>
        {selectedMembers.length > 0 && (
          <Button
            variant="danger"
            onClick={handleRemoveMembers}
          >
            Remove Selected ({selectedMembers.length})
          </Button>
        )}
      </div>

      {/* Members Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedMembers.length === members.length}
                  onChange={(e) => setSelectedMembers(e.target.checked ? members.map(m => m.user.id) : [])}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.user.id)}
                    onChange={() => toggleMemberSelection(member.user.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {member.user.firstName} {member.user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.user.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.user.id, e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {members.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No members found
          </div>
        )}
      </div>

      {/* Add Members Modal */}
      <AddMembersModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddMembers}
        cohortId={cohortId}
        companyId={user?.companyId}
      />
    </div>
  );
};

export default CohortMembers;