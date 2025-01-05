import axios from './axiosConfig';

export const getCohorts = async (companyId) => {
  const response = await axios.get(`/cohorts/${companyId}`);
  return response.data;
};

export const getCohort = async (id) => {
  const response = await axios.get(`/cohorts/${id}/details`);
  return response.data;
};

export const createCohort = async (cohortData) => {
  const response = await axios.post('/cohorts', cohortData);
  return response.data;
};

export const updateCohort = async (id, cohortData) => {
  const response = await axios.put(`/cohorts/${id}`, cohortData);
  return response.data;
};

export const deleteCohort = async (id) => {
  const response = await axios.delete(`/cohorts/${id}`);
  return response.data;
};

export const getMembers = async (id) => {
  const response = await axios.get(`/cohorts/${id}/members`);
  return response.data;
};

export const addMembers = async (id, memberData) => {
  const response = await axios.post(`/cohorts/${id}/members`, memberData);
  return response.data;
};

export const removeMembers = async (id, memberIds) => {
  const response = await axios.delete(`/cohorts/${id}/members`, { data: { userIds: memberIds } });
  return response.data;
};

export const updateMemberRole = async (cohortId, userId, role) => {
  const response = await axios.put(`/cohorts/${cohortId}/members/${userId}`, { role });
  return response.data;
};