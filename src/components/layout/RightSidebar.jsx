import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, MoreHorizontal, UserPlus, Check, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import Avatar from '../ui/Avatar';
import { Button } from '../ui/Button';
import useAuthStore from '../../store/useAuthStore';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { followService } from '../../services/followService';
import { searchService } from '../../services/searchService';
import Skeleton from '../ui/Skeleton';

const RightSidebar = () => {
  const { user: currentUser } = useAuthStore();
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [followingIds, setFollowingIds] = useState(new Set());
  
  // States for 'Show More'
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [trendingLimit, setTrendingLimit] = useState(5);
  const [isExpandingTrending, setIsExpandingTrending] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoadingSuggestions(true);
        let exclude = [];
        if (currentUser?.id) {
          const following = await followService.getFollowing(currentUser.id);
          const ids = following.map(f => f.followingId);
          setFollowingIds(new Set(ids));
          exclude = ids;
        }

        const data = await authService.getSuggestions(exclude, 3);
        setSuggestions(data);
      } catch (error) {
        console.error("Failed to fetch suggestions", error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [currentUser?.id]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoadingTrending(true);
        const data = await searchService.getTrendingHashtags(trendingLimit);
        setTrending(data);
      } catch (error) {
        console.error("Failed to fetch trending", error);
      } finally {
        setLoadingTrending(false);
        setIsExpandingTrending(false);
      }
    };

    fetchTrending();
  }, [trendingLimit]);

  const handleFollow = async (userId) => {
    try {
      if (followingIds.has(userId)) {
        await followService.unfollowUser(userId);
        setFollowingIds(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      } else {
        await followService.followUser(userId);
        setFollowingIds(prev => new Set(prev).add(userId));
      }
    } catch (error) {
      console.error("Follow action failed", error);
    }
  };

  const handleExpandTrending = () => {
    setIsExpandingTrending(true);
    setTrendingLimit(prev => prev + 5);
  };

  return (
    <>
      <aside className="hidden xl:flex flex-col w-80 fixed right-8 top-8 bottom-8 space-y-6 overflow-y-auto no-scrollbar pb-8">
        {/* Suggested Users */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 border-white/5"
        >
          <h3 className="text-lg font-black text-gray-100 tracking-tight mb-5 flex items-center justify-between">
            Who to follow
            <button 
              onClick={() => setShowAllSuggestions(true)}
              className="text-xs font-bold text-primary-500 hover:underline cursor-pointer"
            >
              Show more
            </button>
          </h3>
          
          <div className="space-y-5">
            {loadingSuggestions ? (
              [1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10" variant="circle" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
              ))
            ) : suggestions.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-2 italic">No new suggestions found.</p>
            ) : (
              <AnimatePresence>
                {suggestions.map((user) => (
                  <motion.div 
                    key={user.id} 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between group"
                  >
                    <Link to={`/profile/${user.id}`} className="flex items-center gap-3">
                      <Avatar src={user.profilePicUrl} name={user.fullName} size="sm" className="ring-2 ring-dark-900" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-200 group-hover:text-primary-400 transition-colors leading-none truncate max-w-[100px]">{user.fullName}</span>
                        <span className="text-xs text-gray-500">@{user.username}</span>
                      </div>
                    </Link>
                    <button 
                      onClick={() => handleFollow(user.id)}
                      className={`text-[11px] font-black px-4 py-1.5 rounded-full transition-all shadow-md flex items-center gap-1 ${
                        followingIds.has(user.id) 
                          ? 'bg-dark-800 text-gray-400 hover:text-red-400 border border-white/5' 
                          : 'bg-white text-dark-950 hover:bg-primary-500 hover:text-white'
                      }`}
                    >
                      {followingIds.has(user.id) ? (
                        <>
                          <Check className="h-3 w-3" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3" />
                          Follow
                        </>
                      )}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>

        {/* Trending Topics */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 border-white/5"
        >
          <h3 className="text-lg font-black text-gray-100 tracking-tight mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-500" />
            Trends for you
          </h3>
          <div className="space-y-6">
            {trending.map((item, index) => (
              <motion.div 
                key={index} 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col cursor-pointer group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Trending</span>
                  <MoreHorizontal className="h-4 w-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-[15px] font-bold text-gray-200 mt-0.5 group-hover:text-primary-400 transition-colors">#{item.tag}</span>
                <span className="text-xs text-gray-500 mt-0.5">{item.postCount} posts</span>
              </motion.div>
            ))}
            
            {loadingTrending && (
              <div className="flex justify-center py-2">
                <Skeleton className="h-4 w-full" />
              </div>
            )}
          </div>
          
          <button 
            onClick={handleExpandTrending}
            disabled={isExpandingTrending}
            className="w-full mt-6 text-sm font-bold text-primary-500 hover:bg-primary-500/10 py-2 rounded-xl transition-colors border border-primary-500/20 disabled:opacity-50"
          >
            {isExpandingTrending ? 'Expanding...' : 'Show more'}
          </button>
        </motion.div>

        {/* Footer Links */}
        <div className="px-6 flex flex-wrap gap-x-4 gap-y-2">
          {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Accessibility', 'Ads info', 'More'].map(link => (
            <span key={link} className="text-[11px] text-gray-600 hover:text-gray-400 cursor-pointer transition-colors font-medium">
              {link}
            </span>
          ))}
          <span className="text-[11px] text-gray-600 font-bold mt-2">© 2026 ConnectSphere Inc.</span>
        </div>
      </aside>

      {/* Suggestions Modal */}
      <SuggestionsModal 
        isOpen={showAllSuggestions} 
        onClose={() => setShowAllSuggestions(false)} 
        currentUser={currentUser}
        followingIds={followingIds}
        handleFollow={handleFollow}
      />
    </>
  );
};

const SuggestionsModal = ({ isOpen, onClose, currentUser, followingIds, handleFollow }) => {
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchAll = async () => {
        try {
          setLoading(true);
          const data = await authService.getSuggestions([...followingIds], 15);
          setAllSuggestions(data);
        } catch (error) {
          console.error("Failed to fetch all suggestions", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAll();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md glass-card border-white/10 shadow-4xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-dark-900/50">
          <h2 className="text-xl font-black text-white tracking-tight">Connect with others</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto no-scrollbar space-y-6">
          {loading ? (
            [1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12" variant="circle" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-9 w-20 rounded-full" />
              </div>
            ))
          ) : (
            allSuggestions.map(user => (
              <div key={user.id} className="flex items-center justify-between group">
                <Link to={`/profile/${user.id}`} onClick={onClose} className="flex items-center gap-4">
                  <Avatar src={user.profilePicUrl} name={user.fullName} size="md" className="ring-2 ring-dark-800" />
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-gray-100 group-hover:text-primary-400 transition-colors leading-tight">{user.fullName}</span>
                    <span className="text-sm text-gray-500">@{user.username}</span>
                  </div>
                </Link>
                <button 
                  onClick={() => handleFollow(user.id)}
                  className={`text-sm font-black px-6 py-2 rounded-full transition-all shadow-lg flex items-center gap-2 ${
                    followingIds.has(user.id) 
                      ? 'bg-dark-800 text-gray-400 hover:text-red-400 border border-white/5' 
                      : 'bg-white text-dark-950 hover:bg-primary-500 hover:text-white'
                  }`}
                >
                  {followingIds.has(user.id) ? 'Following' : 'Follow'}
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 bg-dark-900/50 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500">Showing people you might know from around the sphere</p>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default RightSidebar;
