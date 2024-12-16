// frontend/src/services/auth.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await refreshToken();
        localStorage.setItem('auth_token', response.token);
        originalRequest.headers.Authorization = `Bearer ${response.token}`;
        return axiosInstance(originalRequest);
      } catch (error) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export async function loginUser(email, password) {
  const response = await axiosInstance.post('/auth/login', {
    email,
    password,
  });
  return response.data;
}

export async function registerUser(userData) {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
}

export async function logoutUser() {
  await axiosInstance.post('/auth/logout');
}

export async function refreshToken() {
  const response = await axiosInstance.post('/auth/refresh-token');
  return response.data;
}