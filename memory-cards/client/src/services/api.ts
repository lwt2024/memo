import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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

export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: FormData) =>
    api.put('/user/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.put('/user/password', { oldPassword, newPassword }),
};

export default api;
