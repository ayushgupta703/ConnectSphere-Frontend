import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, MoreHorizontal, Send, Loader2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { likeService } from '../../services/likeService';
import { commentService } from '../../services/commentService';
import { Button } from '../ui/Button';
import FollowButton from '../ui/FollowButton';
import Avatar from '../ui/Avatar';
import AuthenticatedImage from '../ui/AuthenticatedImage';
import Skeleton from '../ui/Skeleton';
import { getFullUrl } from '../../utils/urlUtils';
import useUserProfile from '../../hooks/useUserProfile';
import useAuthStore from '../../store/useAuthStore';
import { postService } from '../../services/postService';
import { Globe, Lock, Users, Trash2 } from 'lucide-react';


const CommentItem = ({ comment, isReply = false, onReplyClick, onToggleReplies }) => {
  const { displayName, profilePicUrl } = useUserProfile(comment.userId);
  return (
    <div className={`flex gap-2 ${isReply ? 'ml-8 mt-2' : 'mt-3'}`}>
      <Avatar src={profilePicUrl} name={displayName} size={isReply ? "xs" : "sm"} />
      <div className="flex-1">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-2.5 backdrop-blur-md shadow-sm">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[13px] font-bold text-gray-200 tracking-wide">{displayName}</span>
            <span className="text-[11px] text-gray-500 font-medium">
              {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'now'}
            </span>
          </div>
          <p className="text-[14px] text-gray-300 leading-relaxed">{comment.content}</p>
        </div>
        
        {/* Actions under the comment bubble */}
        <div className="flex items-center gap-4 mt-1 ml-2">
          {!isReply && (
            <button 
              onClick={() => onReplyClick(comment, displayName)}
              className="text-[12px] text-gray-500 hover:text-gray-300 font-semibold transition-colors"
            >
              Reply
            </button>
          )}
          
          {!isReply && comment.repliesCount > 0 && (
            <button 
              onClick={() => onToggleReplies(comment.id)}
              className="text-[12px] text-primary-500 hover:text-primary-400 font-semibold flex items-center gap-1.5 transition-colors"
            >
              {comment.loadingReplies && <Loader2 className="h-3 w-3 animate-spin" />}
              {comment.showReplies ? 'Hide replies' : `View ${comment.repliesCount} repl${comment.repliesCount === 1 ? 'y' : 'ies'}`}
            </button>
          )}
        </div>

        {/* Nested Replies */}
        {!isReply && comment.showReplies && comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                isReply={true} 
                onReplyClick={onReplyClick} 
                onToggleReplies={onToggleReplies}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FeedVideo = ({ url }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    // Ensure time doesn't go below 0 visually due to rounding
    const safeTime = Math.max(0, time);
    const minutes = Math.floor(safeTime / 60);
    const seconds = Math.floor(safeTime % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;

        if (entry.isIntersecting) {
          videoRef.current.play().catch(e => console.log("Autoplay blocked:", e));
        } else {
          videoRef.current.pause();
        }
      },
      { threshold: 0.7 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={url}
        autoPlay
        muted={isMuted}
        loop
        playsInline
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        className="w-full h-full object-cover"
      />
      
      {/* 🔊 Mute Toggle */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsMuted(!isMuted);
        }}
        className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-md border border-white/10 text-white p-2.5 rounded-full z-10 transition-all hover:bg-black/60 shadow-lg"
      >
        {isMuted ? "🔇" : "🔊"}
      </button>

      {/* ⏱ Duration Left */}
      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-full z-10 shadow-lg tracking-wider">
        {formatTime(duration - currentTime)}
      </div>
    </div>
  );
};

const PostCard = ({ post, showVisibility = false }) => {
  // Resolve userId → real username and profile pic.
  // Own posts: instant (from auth store). Others: fetched + cached from auth-service.
  const { displayName, profilePicUrl } = useUserProfile(post?.userId);

  const [isLiked, setIsLiked] = useState(post?.likedByCurrentUser || false);
  const [likesCount, setLikesCount] = useState(post?.likesCount || 0);
  const [isLiking, setIsLiking] = useState(false);

  // Comment state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post?.commentsCount || 0);
  const [replyingTo, setReplyingTo] = useState(null); // { id, displayName }

  // Carousel state
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const mediaItems = [...(post?.mediaUrls || []), (post?.mediaUrl)].filter(Boolean);

  const { user: currentUser } = useAuthStore();
  const isOwner = currentUser?.id === post?.userId;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    setIsDeleting(true);
    try {
      await postService.deletePost(post.id);
      // Refresh the page or use a callback to remove from state
      window.location.reload(); 
    } catch (err) {
      console.error("Failed to delete post", err);
      alert("Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };


  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      if (isLiked) {
        await likeService.removeReaction(post.id);
      } else {
        await likeService.addReaction(post.id, 'LIKE');
      }
    } catch (error) {
      // Revert if error
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      console.error("Failed to react to post", error);
    } finally {
      setIsLiking(false);
    }
  };

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setCommentsLoading(true);
      try {
        // commentService.getComments always returns a plain array
        // (extracts .content from the paginated Page<> response)
        const data = await commentService.getComments(post.id);
        const commentsWithState = (Array.isArray(data) ? data : []).map(c => ({
          ...c,
          replies: [],
          showReplies: false,
          loadingReplies: false
        }));
        setComments(commentsWithState);
      } catch (err) {
        console.error('Failed to load comments', err);
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleReplyClick = (comment, displayName) => {
    setReplyingTo({ id: comment.id, displayName });
    // Focus logic could be added here if we had a ref to the input
  };

  const handleToggleReplies = async (commentId) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    if (!comment.showReplies && comment.replies.length === 0 && comment.repliesCount > 0) {
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, loadingReplies: true } : c));
      try {
        const repliesData = await commentService.getReplies(commentId);
        setComments(prev => prev.map(c => 
          c.id === commentId ? { ...c, replies: repliesData, showReplies: true, loadingReplies: false } : c
        ));
      } catch(err) {
        console.error('Failed to load replies', err);
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, loadingReplies: false } : c));
      }
    } else {
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, showReplies: !c.showReplies } : c
      ));
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      if (replyingTo) {
        const addedReply = await commentService.addComment(post.id, newComment, replyingTo.id);
        
        setComments(prev => prev.map(c => {
          if (c.id === replyingTo.id) {
            return {
              ...c,
              repliesCount: (c.repliesCount || 0) + 1,
              replies: [...(c.replies || []), addedReply],
              showReplies: true
            };
          }
          return c;
        }));
        setCommentsCount(prev => prev + 1);
        setReplyingTo(null);
      } else {
        const addedComment = await commentService.addComment(post.id, newComment);
        setComments(prev => [...prev, { ...addedComment, replies: [], showReplies: false, loadingReplies: false }]);
        setCommentsCount(prev => prev + 1);
      }
      setNewComment('');
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-white/[0.03] p-6 sm:p-8 hover:bg-white/[0.015] transition-all duration-500 group/post"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3.5">
          <Avatar src={profilePicUrl} name={displayName} size="md" className="ring-2 ring-dark-900 shadow-xl" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-100 tracking-tight text-[15px]">
                {displayName}
              </h3>
              <FollowButton userId={post.userId} />
            </div>
            <p className="text-[12px] text-gray-500 font-medium tracking-wide flex items-center gap-2">
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now'}
              {showVisibility && post.visibility && (
                <>
                  <span className="opacity-30">•</span>
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary-500/80 font-bold bg-primary-500/5 px-2 py-0.5 rounded-full border border-primary-500/10">
                    {post.visibility === 'PUBLIC' && <Globe className="h-2.5 w-2.5" />}
                    {post.visibility === 'FOLLOWERS_ONLY' && <Users className="h-2.5 w-2.5" />}
                    {post.visibility === 'PRIVATE' && <Lock className="h-2.5 w-2.5" />}
                    {post.visibility.replace('_', ' ')}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="relative group">
          <button 
            className="text-gray-500 hover:text-gray-300 p-2 rounded-full hover:bg-white/5 transition-all duration-300"
            onClick={() => isOwner && setShowDeleteConfirm(!showDeleteConfirm)}
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          
          <AnimatePresence>
          {showDeleteConfirm && isOwner && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 bg-dark-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 py-1.5 z-50 overflow-hidden"
            >
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isDeleting ? 'Deleting...' : 'Delete Post'}
              </button>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>


      <div className="mt-4">
        <p className="text-gray-200 whitespace-pre-wrap leading-relaxed text-[15px] tracking-tight">{post.content}</p>

        {/* Media Carousel */}
        {mediaItems.length > 0 && (
          <div className="mt-4 relative group rounded-[2rem] overflow-hidden bg-dark-950 border border-white/5 shadow-2xl transition-transform duration-500 hover:scale-[1.005]">
            {/* Media Items */}
            <div
              className="flex transition-transform duration-300 ease-out h-full"
              style={{ transform: `translateX(-${currentMediaIndex * 100}%)` }}
            >
              {mediaItems.map((url, idx) => {
                const normalizedUrl = url.toLowerCase();
                const isVideoItem = normalizedUrl.endsWith('.mp4') || normalizedUrl.endsWith('.webm') || normalizedUrl.endsWith('.mov');

                return (
                  <div key={idx} className="min-w-full flex items-center justify-center bg-black aspect-square sm:aspect-video max-h-[512px]">
                    {isVideoItem ? (
                      <FeedVideo url={getFullUrl(url)} />
                    ) : (
                      <AuthenticatedImage
                        url={url}
                        alt={`Post attachment ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            {mediaItems.length > 1 && (
              <>
                {/* Previous Button */}
                {currentMediaIndex > 0 && (
                  <button
                    onClick={() => setCurrentMediaIndex(prev => prev - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Next Button */}
                {currentMediaIndex < mediaItems.length - 1 && (
                  <button
                    onClick={() => setCurrentMediaIndex(prev => prev + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

                {/* Media Counter Badge */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10 shadow-lg">
                  {currentMediaIndex + 1} / {mediaItems.length}
                </div>

                {/* Progress Indicators (Dots) */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {mediaItems.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${i === currentMediaIndex ? 'bg-white w-3' : 'bg-white/40'
                        }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center space-x-8 text-gray-500">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center space-x-2 transition-all duration-300 group ${isLiked ? 'text-red-500' : 'hover:text-red-400'
            }`}
        >
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors"
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current scale-110 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'group-hover:scale-110 transition-transform'}`} />
          </motion.div>
          <span className="text-[13px] font-bold tracking-tight">{likesCount}</span>
        </button>

        <button
          onClick={toggleComments}
          className={`flex items-center space-x-2 transition-all duration-300 group ${showComments ? 'text-primary-500' : 'hover:text-primary-400'
            }`}
        >
          <div className="p-2 rounded-full group-hover:bg-primary-500/10 transition-colors">
            <MessageCircle className={`h-5 w-5 ${showComments ? 'fill-current opacity-20' : 'group-hover:scale-110 transition-transform'}`} />
          </div>
          <span className="text-[13px] font-bold">{commentsCount}</span>
        </button>


      </div>

      {/* Comments Section */}
      {showComments && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-white/5"
        >
          
          {replyingTo && (
            <div className="flex items-center justify-between bg-white/5 backdrop-blur-md text-[13px] text-gray-300 px-4 py-2 rounded-t-xl border-b border-white/10 mb-[-4px] z-10 relative">
              <span>Replying to <span className="font-bold text-gray-100">{replyingTo.displayName}</span></span>
              <button 
                onClick={() => setReplyingTo(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <form onSubmit={handleAddComment} className="flex gap-2 mb-6 relative z-20">
            <input
              type="text"
              placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
              className={`flex-1 bg-white/[0.03] border border-white/[0.08] px-6 py-3.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/[0.05] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] backdrop-blur-xl ${replyingTo ? 'rounded-b-2xl rounded-t-none' : 'rounded-full'}`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isCommenting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isCommenting}
              className="p-3 rounded-full text-white bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:bg-dark-800 disabled:text-gray-500 transition-all self-end shadow-[0_4px_15px_rgba(16,185,129,0.3)] disabled:shadow-none"
            >
              {isCommenting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </form>

          <div className="space-y-4">
            {commentsLoading ? (
              <div className="space-y-4 py-4">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8" variant="circle" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-10 w-full rounded-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !Array.isArray(comments) || comments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-2">No comments yet. Be the first!</p>
            ) : (
              comments.map(comment => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  onReplyClick={handleReplyClick}
                  onToggleReplies={handleToggleReplies}
                />
              ))
            )}
          </div>
        </motion.div>
      )}
    </motion.article>
  );
};

export default React.memo(PostCard);
