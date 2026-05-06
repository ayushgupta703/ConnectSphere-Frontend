import { authApi } from '../api/axios';

export const authService = {
  login: async (credentials) => {
    const response = await authApi.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await authApi.post('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await authApi.get('/auth/me');
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await authApi.get(`/auth/users/${userId}`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await authApi.put('/auth/profile', profileData);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await authApi.delete('/auth/me');
    return response.data;
  }
};

