import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { likeService } from '../../services/likeService';
import { commentService } from '../../services/commentService';
import { Button } from '../ui/Button';
import FollowButton from '../ui/FollowButton';
import Avatar from '../ui/Avatar';
import AuthenticatedImage from '../ui/AuthenticatedImage';
import { getFullUrl } from '../../utils/urlUtils';
import useUserProfile from '../../hooks/useUserProfile';
import useAuthStore from '../../store/useAuthStore';
import { postService } from '../../services/postService';
import { Trash2 } from 'lucide-react';


const CommentItem = ({ comment }) => {
  const { displayName, profilePicUrl } = useUserProfile(comment.userId);
  return (
    <div className="flex gap-2">
      <Avatar src={profilePicUrl} name={displayName} size="sm" />
      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2 flex-1">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-sm font-medium text-gray-900">{displayName}</span>
          <span className="text-xs text-gray-500">
            {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'now'}
          </span>
        </div>
        <p className="text-sm text-gray-800">{comment.content}</p>
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
        className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full z-10 transition-colors hover:bg-black/70"
      >
        {isMuted ? "🔇" : "🔊"}
      </button>

      {/* ⏱ Duration Left */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">
        {formatTime(duration - currentTime)}
      </div>
    </div>
  );
};

const PostCard = ({ post }) => {
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
        setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load comments', err);
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      const addedComment = await commentService.addComment(post.id, newComment);
      setComments(prev => [...prev, addedComment]);
      setCommentsCount(prev => prev + 1);
      setNewComment('');
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <article className="border-b border-gray-100 p-4 sm:p-6 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar src={profilePicUrl} name={displayName} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 leading-tight">
                {displayName}
              </h3>
              <FollowButton userId={post.userId} />
            </div>
            <p className="text-xs text-gray-500">
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now'}
            </p>
          </div>
        </div>
        <div className="relative group">
          <button 
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => isOwner && setShowDeleteConfirm(!showDeleteConfirm)}
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          
          {showDeleteConfirm && isOwner && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isDeleting ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          )}
        </div>
      </div>


      <div className="mt-4">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>

        {/* Media Carousel */}
        {mediaItems.length > 0 && (
          <div className="mt-3 relative group rounded-xl overflow-hidden bg-gray-900 border border-gray-100 shadow-sm">
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

      <div className="mt-4 flex items-center space-x-6 text-gray-500">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'
            }`}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{likesCount}</span>
        </button>

        <button
          onClick={toggleComments}
          className={`flex items-center space-x-2 transition-colors ${showComments ? 'text-primary-600' : 'hover:text-primary-600'
            }`}
        >
          <MessageCircle className={`h-5 w-5 ${showComments ? 'fill-current opacity-20' : ''}`} />
          <span className="text-sm font-medium">{commentsCount}</span>
        </button>

        <button className="flex items-center space-x-2 hover:text-green-600 transition-colors">
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Write a comment..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isCommenting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isCommenting}
              className="p-2 rounded-full text-primary-600 hover:bg-primary-50 disabled:opacity-50 transition-colors"
            >
              {isCommenting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </form>

          <div className="space-y-3">
            {commentsLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
            ) : !Array.isArray(comments) || comments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-2">No comments yet. Be the first!</p>
            ) : (
              comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default React.memo(PostCard);
