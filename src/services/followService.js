import { followApi } from '../api/axios';
import { extractList } from '../utils/apiUtils';

export const followService = {
  followUser: async (userId) => {
    const response = await followApi.post(`/follows/${userId}`);
    return response.data;
  },
  
  unfollowUser: async (userId) => {
    const response = await followApi.delete(`/follows/${userId}`);
    return response.status === 204;
  },
  
  getFollowers: async (userId) => {
    const response = await followApi.get(`/follows/${userId}/followers`);
    return extractList(response.data);
  },
  
  getFollowing: async (userId) => {
    const response = await followApi.get(`/follows/${userId}/following`);
    return extractList(response.data);
  },

  isFollowing: async (targetUserId) => {
    try {
      const response = await followApi.get(`/follows/${targetUserId}/is-following`);
      const data = response.data;
      
      // Handle string "false" or "true", boolean false/true, or an object wrapper
      if (typeof data === 'string') {
        return data.toLowerCase() === 'true';
      }
      if (typeof data === 'boolean') {
        return data;
      }
      if (data && typeof data === 'object') {
        return data.isFollowing === true || data.following === true || data.value === true;
      }
      
      return !!data;
    } catch (error) {
      console.error("Error checking follow status:", error);
      return false;
    }
  }
};
