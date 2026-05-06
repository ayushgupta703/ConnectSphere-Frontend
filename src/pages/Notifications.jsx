import React, { useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import { Bell, Heart, MessageCircle, UserPlus, CheckCircle2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useUserProfile from '../hooks/useUserProfile';
import Avatar from '../components/ui/Avatar';

/**
 * Builds a human-readable message from the notification fields
 * the backend actually provides: actorId, type, targetId.
 */
const NotificationMessage = ({ notif, actorName }) => {
  const actionText = (() => {
    switch (notif.type) {
      case 'LIKE':    return 'liked your post';
      case 'COMMENT': return 'commented on your post';
      case 'FOLLOW':  return 'started following you';
      default:        return 'interacted with you';
    }
  })();

  return (
    <p className="text-gray-900 text-sm">
      <span className="font-semibold">{actorName || 'Someone'}</span>{' '}
      {actionText}
    </p>
  );
};

const NotificationItem = ({ notif }) => {
  const { displayName: actorName, profilePicUrl: actorProfilePic } = useUserProfile(notif.actorId);

  const getIcon = (type) => {
    switch(type) {
      case 'LIKE':    return <Heart className="h-5 w-5 text-red-500 fill-current" />;
      case 'COMMENT': return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'FOLLOW':  return <UserPlus className="h-5 w-5 text-primary-500" />;
      default:        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const isUnread = (notif) => !(notif.isRead || notif.read);

  return (
    <div 
      className={`p-4 sm:p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors ${isUnread(notif) ? 'bg-primary-50/30' : ''}`}
    >
      <div className="relative">
        <Avatar src={actorProfilePic || notif.actorProfilePicture} name={actorName} size="md" />
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
          {getIcon(notif.type)}
        </div>
      </div>
      <div className="flex-1">
        <NotificationMessage notif={notif} actorName={actorName} />
        <p className="text-xs text-gray-500 mt-1">
          {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : 'Just now'}
        </p>
      </div>
      {isUnread(notif) && (
        <div className="w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
      )}
    </div>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Could not load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        <button 
          onClick={handleMarkAllRead}
          className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1 transition-colors"
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark as read
        </button>
      </div>

      <div className="divide-y divide-gray-50">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : !Array.isArray(notifications) || notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Bell className="h-12 w-12 text-gray-300 mb-4" />
            <p>You're all caught up!</p>
          </div>
        ) : (
          notifications.map(notif => (
            <NotificationItem key={notif.id} notif={notif} />
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
