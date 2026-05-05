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

export const tagApi = {
  getUserTags: () => api.get('/tags'),
  createTag: (name: string, color: string) => api.post('/tags', { name, color }),
  getDeckTags: (deckId: string) => api.get(`/tags/deck/${deckId}`),
  addTagToCard: (cardId: string, tagId: string) => api.post('/tags/card-tags', { cardId, tagId }),
  removeTagFromCard: (cardId: string, tagId: string) => api.delete(`/tags/card-tags/${cardId}/${tagId}`),
};

export default api;
