import { mediaApi } from '../api/axios';

export const storyService = {
  /**
   * Fetch active stories for the feed.
   */
  getActiveStories: async () => {
    try {
      const response = await mediaApi.get('/stories/active');
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error("Failed to fetch stories", err);
      return [];
    }
  },

  /**
   * Create a new story.
   */
  createStory: async (file, caption = '') => {
    if (!file) {
      throw new Error("No file selected");
    }

    console.log("Uploading file:", file);

    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);

    try {
      const response = await mediaApi.post('/stories', formData);
      return response?.data || null;
    } catch (err) {
      console.error("Failed to create story", err);
      throw err;
    }

  },

  /**
   * Mark a story as viewed.
   */
  viewStory: async (storyId) => {
    try {
      // Get current user ID from localStorage
      const userJson = localStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;
      const userId = user?.id;
      
      // Some backend versions require the userId in the body, others expect {}
      // We'll send it just in case, or fall back to {}
      const response = await mediaApi.post(`/stories/${storyId}/view`, { userId: userId });
      
    } catch (err) {
      console.error(`Failed to mark story ${storyId} as viewed:`, err.response?.status, err.response?.data || err.message);
    }
  },

  /**
   * Delete a story.
   */
  deleteStory: async (storyId) => {
    try {
      const response = await mediaApi.delete(`/stories/${storyId}`);
      return response.data;
    } catch (err) {
      console.error(`Failed to delete story ${storyId}:`, err);
      throw err;
    }
  }
};

