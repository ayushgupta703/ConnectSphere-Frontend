import { commentApi } from '../api/axios';
import { extractList } from '../utils/apiUtils';

export const commentService = {
  /**
   * Fetch comments for a post.
   * Backend returns a paginated Page<CommentResponseDto>:
   *   { content: [...], totalElements: N, ... }
   * We extract .content to always return a plain array.
   */
  getComments: async (postId, page = 0, size = 20) => {
    const response = await commentApi.get(`/comments/${postId}`, {
      params: { page, size },
    });
    return extractList(response.data);
  },
  
  addComment: async (postId, content, parentCommentId = null) => {
    const payload = { content };
    if (parentCommentId) {
      payload.parentCommentId = parentCommentId;
    }
    const response = await commentApi.post(`/comments/${postId}`, payload);
    return response.data;
  },
  
  deleteComment: async (commentId) => {
    const response = await commentApi.delete(`/comments/${commentId}`);
    return response.data;
  },
  
  /**
   * Fetch replies for a comment.
   * Backend returns a plain List<CommentResponseDto> (not paginated).
   */
  getReplies: async (commentId) => {
    const response = await commentApi.get(`/comments/replies/${commentId}`);
    return extractList(response.data);
  },
  
  updateComment: async (commentId, content) => {
    const response = await commentApi.put(`/comments/${commentId}`, { content });
    return response.data;
  }
};
