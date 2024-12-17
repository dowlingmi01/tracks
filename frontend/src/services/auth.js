// frontend/src/services/auth.js
import axios from 'axios';

// Remove '/api' from the base URL since it's included in the routes
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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
  try {
    console.log('Attempting login at:', `${API_URL}/auth/login`);
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    throw error;
  }
}

export async function registerUser(userData) {
  try {
    console.log('Registering at:', `${API_URL}/auth/register`);
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    throw error;
  }
}

export async function logoutUser() {
  try {
    console.log('Logging out at:', `${API_URL}/auth/logout`);
    await axiosInstance.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    throw error;
  }
}

export async function refreshToken() {
  try {
    console.log('Refreshing token at:', `${API_URL}/auth/refresh-token`);
    const response = await axiosInstance.post('/auth/refresh-token');
    return response.data;
  } catch (error) {
    console.error('Token refresh error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    throw error;
  }
}