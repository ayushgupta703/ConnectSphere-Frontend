import { mediaApi } from '../api/axios';
import { getFullUrl } from '../utils/urlUtils';

// Simple cache for blob URLs to avoid refetching
const mediaBlobCache = new Map();

export const mediaService = {
  // =========================
  // 📤 UPLOAD APIS
  // =========================

  /**
   * Upload multiple media files.
   * Returns an array of media URLs.
   */
  uploadMedia: async (files) => {
    const fileArray = Array.isArray(files) || files instanceof FileList 
      ? Array.from(files) 
      : [files];

    const uploadPromises = fileArray.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await mediaApi.post('/media/upload', formData);
        return response.data.mediaUrl || response.data;
      } catch (err) {
        console.error("Individual media upload error", err);
        throw err;
      }
    });

    return Promise.all(uploadPromises);
  },

  /**
   * Upload a single file for profile picture.
   */
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await mediaApi.post('/media/profile-picture', formData);
      return response.data.profilePicUrl;
    } catch (err) {
      console.error("Profile picture upload error", err);
      throw err;
    }
  },

  // =========================
  // 📚 STORIES APIS
  // =========================

  getActiveStories: async () => {
    try {
      // const response = await mediaApi.get('/media/stories/active');
      const response = await mediaApi.get('/stories/active');
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error("Failed to fetch stories", err);
      return [];
    }
  },

  getUserStories: async (userId) => {
    try {
      // const response = await mediaApi.get(`/media/stories/user/${userId}`);
      const response = await mediaApi.get(`/stories/user/${userId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error(`Failed to fetch stories for user ${userId}`, err);
      return [];
    }
  },

  createStory: async (file, caption = '') => {
    if (!file) throw new Error("No file selected");
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);

    try {
      // const response = await mediaApi.post('/media/stories', formData);
      const response = await mediaApi.post('/stories', formData);
      return response?.data || null;
    } catch (err) {
      console.error("Failed to create story", err);
      throw err;
    }
  },

  viewStory: async (storyId) => {
    try {
      const userJson = localStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;
      const userId = user?.id;
      
      // await mediaApi.post(`/media/stories/${storyId}/view`, { userId: userId });
      await mediaApi.post(`/stories/${storyId}/view`, { userId: userId });
    } catch (err) {
      console.error(`Failed to mark story ${storyId} as viewed:`, err.message);
    }
  },

  deleteStory: async (storyId) => {
    try {
      // const response = await mediaApi.delete(`/media/stories/${storyId}`);
      const response = await mediaApi.delete(`/stories/${storyId}`);
      return response.data;
    } catch (err) {
      console.error(`Failed to delete story ${storyId}:`, err);
      throw err;
    }
  },

  // =========================
  // 📥 FETCH APIS (Media Retrieval)
  // =========================

  /**
   * Fetch a media file as a Blob URL using Authorization header.
   * Utilizes a local cache to prevent duplicate fetches.
   */
  fetchMediaBlob: async (url, token) => {
    if (!url) return null;
    const fullUrl = getFullUrl(url);

    if (mediaBlobCache.has(fullUrl)) {
      return mediaBlobCache.get(fullUrl);
    }

    try {
      const response = await mediaApi.get(fullUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        responseType: 'blob'
      });
      const objectUrl = URL.createObjectURL(response.data);
      mediaBlobCache.set(fullUrl, objectUrl);
      return objectUrl;
    } catch (err) {
      console.warn("Failed to load authenticated media, falling back to direct URL", fullUrl, err);
      // Fallback is just the URL itself
      return fullUrl;
    }
  }
};
