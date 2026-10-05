import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shelflife_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to normalize error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired, clear token and notify
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('shelflife_token');
        localStorage.removeItem('shelflife_user');
      }
    }
    return Promise.reject(error);
  }
);
