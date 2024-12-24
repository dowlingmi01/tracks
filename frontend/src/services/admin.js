// frontend/src/services/admin.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const createAdmin = async (adminData) => {
  const response = await axios.post(`${API_URL}/admin/create-admin`, adminData);
  return response.data;
};

export const createCompany = async (companyData) => {
  const response = await axios.post(`${API_URL}/admin/create-company`, companyData);
  return response.data;
};