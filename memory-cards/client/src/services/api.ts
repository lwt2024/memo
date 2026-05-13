import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

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
  deleteTag: (tagId: string) => api.delete(`/tags/${tagId}`),
};

export const deckApi = {
  getDeckStats: (deckId: string) => api.get(`/decks/${deckId}/stats`),
};

export const checkInApi = {
  checkIn: () => api.post('/checkin'),
  getStats: () => api.get('/checkin/stats'),
  getCalendar: (months?: number) => api.get(`/checkin/calendar${months ? `?months=${months}` : ''}`),
};

export const shareApi = {
  getPublicDecks: (params?: { sortBy?: string; search?: string }) =>
    api.get('/share/public', { params }),

  getPublicDeckDetail: (deckId: string) =>
    api.get(`/share/public/${deckId}`),

  importByCode: (inviteCode: string) =>
    api.post('/share/import', { inviteCode }),

  importPublicDeck: (deckId: string) =>
    api.post('/share/import/public', { deckId }),

  setPublic: (deckId: string, isPublic: boolean) =>
    api.post(`/share/${deckId}/public`, { isPublic }),

  generateInvite: (deckId: string) =>
    api.post(`/share/${deckId}/invite`),

  togglePublic: (deckId: string) =>
    api.put(`/decks/${deckId}/public`),

  getShareInfo: (deckId: string) =>
    api.get(`/decks/${deckId}/share`),
};

export default api;
