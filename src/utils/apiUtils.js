/**
 * Safely extracts a plain array from a backend response.
 * Handles both:
 *   - Spring Page<>:  { content: [...], totalElements: N, ... }
 *   - Plain list:     [...]
 */
export const extractList = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  return [];
};

/**
 * Standardizes API error responses into user-friendly messages.
 */
export const extractErrorMessage = (error, defaultMessage = "An unexpected error occurred. Please try again.") => {
  if (!error.response) {
    // Network error or server unreachable
    return "Network error or service unavailable. Please check your connection.";
  }
  
  if (error.response.status >= 500) {
    return "The server encountered an error. Please try again later.";
  }
  
  return error.response.data?.message || error.response.data?.error || defaultMessage;
};
