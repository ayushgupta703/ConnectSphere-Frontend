import { notificationApi } from '../api/axios';
import { extractList } from '../utils/apiUtils';

export const notificationService = {
  getNotifications: async () => {
    const response = await notificationApi.get('/notifications');
    console.log('[notificationService] raw response.data:', response.data);
    return extractList(response.data);
  },
  
  getUnreadCount: async () => {
    const response = await notificationApi.get('/notifications/unread-count');
    return response.data;
  },
  
  markAsRead: async (id) => {
    const response = await notificationApi.put(`/notifications/${id}/read`);
    return response.data;
  },
  
  markAllAsRead: async () => {
    const response = await notificationApi.put('/notifications/read-all');
    return response.data;
  }
};
