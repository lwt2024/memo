import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (email: string, password: string, nickname?: string) =>
    api.post('/auth/register', { email, password, nickname }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

export default api;
