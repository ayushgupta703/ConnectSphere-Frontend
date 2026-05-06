import { create } from 'zustand';
import { authService } from '../services/authService';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(credentials);
      // Backend returns token, refreshToken, and user (UserResponse)
      const { token, refreshToken, user } = data;

      // Migrate property name if needed (from old profilePicture to profilePicUrl)
      if (user && user.profilePicture && !user.profilePicUrl) {
        user.profilePicUrl = user.profilePicture;
      }

      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user || {})); 

      set({
        user: user || {}, 
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed. Please try again.', 
        isLoading: false 
      });
      return { success: false, error };
    }
  },

  updateUser: (updatedData) => {
    set((state) => {
      const newUser = { ...state.user, ...updatedData };
      localStorage.setItem('user', JSON.stringify(newUser));
      return { user: newUser };
    });
  },

  refreshUser: async () => {
    try {
      const userData = await authService.getCurrentUser();
      // Ensure property name consistency
      if (userData && userData.profilePicture && !userData.profilePicUrl) {
        userData.profilePicUrl = userData.profilePicture;
      }
      set({ user: userData });
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.warn("Failed to refresh user profile", error);
      const status = error.response?.status;
      if (status === 401 || status === 403 || status === 404) {
        useAuthStore.getState().logout();
      }
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(userData);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Registration failed. Please try again.', 
        isLoading: false 
      });
      return { success: false, error };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setTokenAndUser: async (token, refreshToken, user) => {
    localStorage.setItem('token', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    } else {
      set({ token, isAuthenticated: true });
      // If no user object is provided, fetch it from the backend
      try {
        const userData = await authService.getCurrentUser();
        if (userData && userData.profilePicture && !userData.profilePicUrl) {
          userData.profilePicUrl = userData.profilePicture;
        }
        set({ user: userData });
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.error("Failed to fetch user after OAuth login", error);
      }
    }
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;
