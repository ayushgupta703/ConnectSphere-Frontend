import { likeApi } from '../api/axios';

// Supported reaction types — extend here when adding new reactions to the UI
export const ReactionType = {
  LIKE: 'LIKE',
  LOVE: 'LOVE',
  HAHA: 'HAHA',
  WOW: 'WOW',
  SAD: 'SAD',
  ANGRY: 'ANGRY',
};

export const likeService = {
  /**
   * Add or update a reaction on a post.
   * @param {string} postId
   * @param {string} reactionType - one of ReactionType values (defaults to 'LIKE')
   */
  addReaction: async (postId, reactionType = ReactionType.LIKE) => {
    const response = await likeApi.post('/reactions', { postId, reactionType });
    return response.data;
  },

  /**
   * Remove the current user's reaction from a post.
   * @param {string} postId
   */
  removeReaction: async (postId) => {
    const response = await likeApi.delete(`/reactions/${postId}`);
    return response.data;
  },

  /**
   * Get total reaction count for a post.
   * @param {string} postId
   */
  getReactionCount: async (postId) => {
    const response = await likeApi.get(`/reactions/${postId}/count`);
    return response.data;
  },

  /**
   * Get a breakdown of reactions by type for a post.
   * @param {string} postId
   */
  getReactionSummary: async (postId) => {
    const response = await likeApi.get(`/reactions/${postId}/summary`);
    return response.data;
  },

  /**
   * Check if the current user has reacted to a post.
   * @param {string} postId
   */
  checkReaction: async (postId) => {
    try {
      const response = await likeApi.get(`/reactions/${postId}/has-reacted`);
      return !!response.data; // Ensure boolean
    } catch (err) {
      console.error(`Failed to check reaction for post ${postId}:`, err.message);
      return false; // Default to false safely
    }
  },
};
