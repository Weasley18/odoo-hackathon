import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Define base URL for API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create Axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    
    // If token exists, add it to Authorization header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const auth = {
  signup: async (email: string, password: string, username?: string) => {
    const response = await api.post('/api/auth/signup', {
      email,
      password,
      username,
    });
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
  
  updateProfile: async (userData: { username?: string }) => {
    const response = await api.put('/api/auth/me', userData);
    return response.data;
  },
};

// Export the API instance for other services to use
export default api;