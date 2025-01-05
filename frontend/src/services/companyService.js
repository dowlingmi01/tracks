// frontend/src/services/companyService.js
import axiosInstance from './axiosConfig';

// Add debugging log
const loggedGet = async (url) => {
  console.log('Making GET request to:', url);
  return axiosInstance.get(url);
};

export const companyService = {
  getAll: () => axiosInstance.get('/companies'),
  getById: (id) => axiosInstance.get(`/companies/${id}`),
  create: (data) => axiosInstance.post('/companies', data),
  update: (id, data) => axiosInstance.put(`/companies/${id}`, data),
  delete: (id) => axiosInstance.delete(`/companies/${id}`)
};