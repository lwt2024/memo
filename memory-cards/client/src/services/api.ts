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
  register: (username: string, password: string, nickname?: string) =>
    api.post('/auth/register', { username, password, nickname }),
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
};

export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: FormData) =>
    api.put('/user/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.put('/user/password', { oldPassword, newPassword }),
  deleteAccount: (password: string) =>
    api.delete('/user/account', { data: { password } }),
};

export default api;
