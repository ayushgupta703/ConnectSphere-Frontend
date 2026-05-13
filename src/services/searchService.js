import { searchApi } from '../api/axios';
import { extractList } from '../utils/apiUtils';

export const searchService = {
  /**
   * Search users using the smart search API.
   * Returns a prioritized and deduplicated list of users.
   */
  searchUsers: async (query) => {
    try {
      const response = await searchApi.get(`/search/users?query=${encodeURIComponent(query)}`);
      return extractList(response.data);
    } catch (err) {
      console.error("User search error", err);
      return [];
    }
  },

  /**
   * Search posts by hashtag.
   * Returns an array of posts.
   */
  searchHashtags: async (tag) => {
    try {
      const response = await searchApi.get(`/search/hashtags?tag=${encodeURIComponent(tag)}`);
      return extractList(response.data);
    } catch (err) {
      console.error("Hashtag search error", err);
      return [];
    }
  },

  getTrendingHashtags: async (limit = 5) => {
    try {
      const response = await searchApi.get(`/hashtags/trending?limit=${limit}`);
      return response.data; // This endpoint returns a direct list based on my controller review
    } catch (err) {
      console.error("Failed to fetch trending hashtags", err);
      return [];
    }
  }
};

