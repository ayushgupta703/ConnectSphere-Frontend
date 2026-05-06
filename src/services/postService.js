import { postApi } from '../api/axios';
import { extractList } from '../utils/apiUtils';

export const postService = {
  /**
   * Returns paginated feed posts as a plain array.
   * Backend: GET /posts/feed → Page<PostResponseDto>
   */
  getFeed: async (page = 0, size = 20) => {
    const response = await postApi.get('/posts/feed', { params: { page, size } });
    return extractList(response.data);
  },

  getPost: async (postId) => {
    try {
      const response = await postApi.get(`/posts/${postId}`);
      return response.data;
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        throw new Error('Not authorized to view this post.');
      }
      throw err;
    }
  },

  /**
   * Returns all posts paginated.
   * Backend: GET /posts → Page<PostResponseDto>
   */
  getAllPosts: async (page = 0, size = 20) => {
    const response = await postApi.get('/posts', { params: { page, size } });
    return extractList(response.data);
  },

  /**
   * Search posts by keyword.
   * Backend: GET /posts/search?query=... → Page<PostResponseDto>
   */
  searchPosts: async (query, page = 0, size = 20) => {
    const response = await postApi.get('/posts/search', { params: { keyword: query, page, size } });
    return extractList(response.data);
  },

  /**
   * Fetch multiple posts by ID safely.
   * Backend: POST /posts/bulk → List<PostResponseDto>
   */
  getPostsByIds: async (postIds) => {
    if (!postIds || postIds.length === 0) return [];
    try {
      const response = await postApi.post('/posts/bulk', postIds);
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error("Bulk fetch failed:", err);
      return []; // Return empty array safely instead of crashing
    }
  },

  /**
   * Returns a user's posts as a plain array.
   * Backend: GET /posts/user/{userId} → Page<PostResponseDto>
   */
  getUserPosts: async (userId, page = 0, size = 20) => {
    const response = await postApi.get(`/posts/user/${userId}`, { params: { page, size } });
    return extractList(response.data);
  },

  createPost: async (postData) => {
    const response = await postApi.post('/posts', postData);
    return response.data;
  },

  updatePost: async (postId, postData) => {
    const response = await postApi.put(`/posts/${postId}`, postData);
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await postApi.delete(`/posts/${postId}`);
    return response.data;
  },
};
