import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({  
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage')
    ? JSON.parse(localStorage.getItem('auth-storage')!).state.token
    : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Add response logging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const apiClient = {
  // Login
  adminLogin: (email: string, password: string) =>
    api.post('/api/admin-login', { email, password }),

  // Licenses
  getLicenses: () => api.get('/api/licenses'),
  createLicense: (plan: string, maxDevices: number, strictMode: boolean) =>
    api.post('/api/licenses?action=create', {
      plan,
      max_devices: maxDevices,
      strict_mode: strictMode,
    }),
  revokeLicense: (licenseKey: string) =>
    api.post('/api/licenses?action=revoke', { license_key: licenseKey }),

  // Logs
  getLogs: (limit = 50, offset = 0, status?: string, country?: string) =>
    api.get('/api/logs', {
      params: { limit, offset, status, country },
    }),
};
