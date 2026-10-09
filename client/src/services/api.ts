import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edugo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiration handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config && !error.config.__isAuthCheck) {
      // Token invalid or expired
      if (localStorage.getItem('edugo_token')) {
        localStorage.removeItem('edugo_token');
        localStorage.removeItem('edugo_user');
      }
    }
    return Promise.reject(error);
  }
);
