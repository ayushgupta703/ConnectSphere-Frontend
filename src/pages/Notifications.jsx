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
    <p className="text-gray-200 text-[15px]">
      <span className="font-bold text-gray-100">{actorName || 'Someone'}</span>{' '}
      <span className="text-gray-400">{actionText}</span>
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
      className={`p-4 sm:p-5 flex items-start gap-4 hover:bg-white/5 transition-all duration-300 border-b border-white/5 ${isUnread(notif) ? 'bg-primary-500/5 border-l-2 border-l-primary-500' : ''}`}
    >
      <div className="relative">
        <Avatar src={actorProfilePic || notif.actorProfilePicture} name={actorName} size="md" className="shadow-lg" />
        <div className="absolute -bottom-1.5 -right-1.5 bg-dark-900 rounded-full p-1 shadow-sm border border-white/10">
          {getIcon(notif.type)}
        </div>
      </div>
      <div className="flex-1 pt-1">
        <NotificationMessage notif={notif} actorName={actorName} />
        <p className="text-[12px] text-gray-500 font-medium mt-1.5 tracking-wide">
          {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : 'Just now'}
        </p>
      </div>
      {isUnread(notif) && (
        <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
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
    <div className="w-full min-h-screen bg-dark-950">
      <div className="sticky top-0 z-10 bg-dark-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-black text-gray-100 tracking-tight">Notifications</h1>
        <button 
          onClick={handleMarkAllRead}
          className="text-sm text-primary-400 font-bold hover:text-primary-300 flex items-center gap-1.5 transition-colors bg-primary-500/10 hover:bg-primary-500/20 px-3 py-1.5 rounded-full"
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark as read
        </button>
      </div>

      <div className="flex flex-col">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : !Array.isArray(notifications) || notifications.length === 0 ? (
          <div className="p-20 text-center text-gray-500 flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-dark-900 rounded-full flex items-center justify-center mb-5 border border-white/5 shadow-inner">
              <Bell className="h-10 w-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-100">You're all caught up!</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">When people interact with your posts, you'll see it here.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map(notif => (
              <NotificationItem key={notif.id} notif={notif} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
