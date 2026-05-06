import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Loader2, Eye, Trash2 } from 'lucide-react';

import { mediaService } from '../../services/mediaService';
import { followService } from '../../services/followService';
import Avatar from '../ui/Avatar';
import AuthenticatedImage from '../ui/AuthenticatedImage';
import { getFullUrl } from '../../utils/urlUtils';
import useAuthStore from '../../store/useAuthStore';
import useUserProfile from '../../hooks/useUserProfile';

// Helper to determine if it's an image
const isImage = (story) => story?.mediaType?.toUpperCase() === "IMAGE";
const isVideo = (story) => story?.mediaType?.toUpperCase() === "VIDEO";

const StoryGroup = ({ group, onClick }) => {
  const targetId = group.userId || group.creatorId || group.authorId;
  const { displayName, profilePicUrl: userProfilePic } = useUserProfile(targetId);

  // Check if all stories in the group have been viewed
  const isViewed = group.stories.every(s => s.viewed || s.isViewed);

  // Use the fetched profile picture if available, fallback to group data
  const profilePic = userProfilePic || group.profilePicUrl || group.profilePicture;

  const nameToDisplay = (displayName && displayName !== 'Unknown' && !displayName.includes('…'))
    ? displayName
    : (group.username !== 'Unknown' ? group.username : targetId || 'User');

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 min-w-[72px]"
    >
      <div className={`h-16 w-16 rounded-full border-2 p-0.5 flex items-center justify-center transition-colors ${isViewed ? 'border-gray-200' : 'border-primary-500'
        }`}>
        <Avatar
          src={profilePic}
          name={nameToDisplay}
          size="lg"
          className={`h-full w-full ${isViewed ? 'opacity-70' : ''}`}
        />
      </div>

      <span className="text-[11px] font-medium text-gray-700 truncate w-16">
        {nameToDisplay}
      </span>
    </button>
  );
};

const UsernameDisplay = ({ userId, fallback }) => {
  const { displayName, profilePicUrl } = useUserProfile(userId);
  return (
    <>
      <Avatar src={profilePicUrl} name={displayName || fallback} size="sm" />
      <span className="text-white font-semibold text-sm">
        {displayName || fallback}
      </span>
    </>
  );
};

const StoryBar = () => {


  const { user: currentUser } = useAuthStore();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroupIndex, setActiveGroupIndex] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyDuration, setStoryDuration] = useState(5000);
  const [followedIds, setFollowedIds] = useState([]);
  const [selectedStoryFile, setSelectedStoryFile] = useState(null);
  const [storyPreviewUrl, setStoryPreviewUrl] = useState(null);
  const [storyCaption, setStoryCaption] = useState('');
  const videoRef = React.useRef(null);
  const progressTimerRef = React.useRef(null);

  // Group and filter stories
  const groupedStories = React.useMemo(() => {
    const groups = {};

    // 1. Filter stories by following status
    const visibleStories = stories.filter(story => {
      const storyAuthorId = String(story.userId || story.creatorId || story.authorId);
      const currentId = String(currentUser?.id);

      // Always show own stories
      if (storyAuthorId === currentId) return true;

      // Show stories from people the current user follows
      return followedIds.includes(storyAuthorId);
    });

    // 2. Group the filtered stories
    visibleStories.forEach(story => {
      const id = story.userId || story.creatorId || story.authorId;
      const name = story.username || 'Unknown';
      const key = id || name;

      if (!groups[key]) {
        groups[key] = {
          userId: id,
          username: name,
          profilePicUrl: story.profilePicUrl || story.profilePicture || story.userProfilePicture || story.authorProfilePicture,
          stories: []
        };
      }
      groups[key].stories.push(story);
    });
    return Object.values(groups);
  }, [stories, followedIds, currentUser]);

  const activeGroup = activeGroupIndex !== null ? groupedStories[activeGroupIndex] : null;
  const currentStory = activeGroup ? activeGroup.stories[currentStoryIndex] : null;

  // Separate current user's group from others
  const currentUserGroup = groupedStories.find(g =>
    String(g.userId) === String(currentUser?.id)
  );

  const otherGroups = groupedStories.filter(g =>
    String(g.userId) !== String(currentUser?.id)
  );

  const isCurrentUserViewed = currentUserGroup?.stories.every(s => s.viewed || s.isViewed);

  // Handle progress timer
  useEffect(() => {
    if (activeGroupIndex === null) {
      setStoryProgress(0);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    const story = groupedStories[activeGroupIndex].stories[currentStoryIndex];
    const isVid = isVideo(story);

    // Reset progress
    setStoryProgress(0);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    if (isVid) {
      // For videos, we rely on onTimeUpdate
      setStoryDuration(0); // Will be set by metadata
    } else {
      // For images, set 5s timer
      const duration = 5000;
      setStoryDuration(duration);
      const startTime = Date.now();

      progressTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed / duration) * 100;

        if (progress >= 100) {
          setStoryProgress(100);
          clearInterval(progressTimerRef.current);
          nextStory();
        } else {
          setStoryProgress(progress);
        }
      }, 30);
    }

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [activeGroupIndex, currentStoryIndex]);

  const handleVideoMetadata = (e) => {
    setStoryDuration(e.target.duration * 1000);
  };

  const handleVideoTimeUpdate = (e) => {
    if (e.target.duration) {
      setStoryProgress((e.target.currentTime / e.target.duration) * 100);
    }
  };

  const fetchStories = useCallback(async () => {
    try {
      // Fetch followed users concurrently
      if (currentUser?.id) {
        followService.getFollowing(currentUser.id).then(following => {
          // Correctly map to the ID of the person being followed (followingId or nested following.id)
          const ids = following.map(u => String(u.followingId || (u.following?.id) || u.userId || u.id));
          setFollowedIds(ids);
        }).catch(err => console.error("Failed to fetch following list", err));
      }

      const data = await mediaService.getActiveStories();

      // Merge with locally persisted viewed state
      const viewedIds = JSON.parse(localStorage.getItem('viewedStories') || '[]');
      const enrichedStories = (data || []).map(s => ({
        ...s,
        viewed: s.viewed || s.isViewed || viewedIds.includes(s.id),
        isViewed: s.viewed || s.isViewed || viewedIds.includes(s.id)
      }));

      setStories(enrichedStories);
    } catch (err) {
      console.error("Failed to load stories", err);
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleCreateStory = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview instead of immediate upload
    const url = URL.createObjectURL(file);
    setSelectedStoryFile(file);
    setStoryPreviewUrl(url);
    setStoryCaption('');

    // Reset the input so the same file can be selected again if needed
    e.target.value = '';
  };

  const handleConfirmUpload = async () => {
    if (!selectedStoryFile || isCreating) return;

    setIsCreating(true);
    try {
      const newStory = await mediaService.createStory(selectedStoryFile, storyCaption);
      if (newStory) {
        // Refresh stories to show the new one
        await fetchStories();
        closeUploadModal();
      }
    } catch (err) {
      console.error("Failed to share story", err);
      alert("Failed to share story. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const closeUploadModal = () => {
    if (storyPreviewUrl) URL.revokeObjectURL(storyPreviewUrl);
    setSelectedStoryFile(null);
    setStoryPreviewUrl(null);
    setStoryCaption('');
  };

  const openGroup = async (groupIndex) => {
    const group = groupedStories[groupIndex];
    if (!group) return;

    // Find the first story that hasn't been viewed yet
    const firstUnviewedIdx = group.stories.findIndex(s => !s.viewed && !s.isViewed);
    // If all are viewed, start at the beginning (0), otherwise start at the first unviewed
    const startIdx = firstUnviewedIdx === -1 ? 0 : firstUnviewedIdx;

    setActiveGroupIndex(groupIndex);
    setCurrentStoryIndex(startIdx);

    const storyToOpen = group.stories[startIdx];
    if (storyToOpen) {
      // Optimistically mark as viewed in local state
      markStoryAsViewedLocally(storyToOpen.id);

      try {
        await mediaService.viewStory(storyToOpen.id);
      } catch (err) {
        console.error("Failed to mark story as viewed", err);
      }
    }
  };

  const markStoryAsViewedLocally = (storyId) => {
    // 1. Update React state for instant feedback
    setStories(prev => prev.map(s =>
      s.id === storyId ? { ...s, viewed: true, isViewed: true } : s
    ));

    // 2. Persist to localStorage so it survives reloads/logouts
    try {
      const viewedIds = JSON.parse(localStorage.getItem('viewedStories') || '[]');
      if (!viewedIds.includes(storyId)) {
        const updatedIds = [...viewedIds, storyId];
        // Keep only last 100 to avoid bloating localStorage
        if (updatedIds.length > 100) updatedIds.shift();
        localStorage.setItem('viewedStories', JSON.stringify(updatedIds));
      }
    } catch (err) {
      console.warn("Failed to persist viewed state to localStorage", err);
    }
  };

  const nextStory = async () => {
    if (!activeGroup) return;

    if (currentStoryIndex < activeGroup.stories.length - 1) {
      const nextIdx = currentStoryIndex + 1;
      setCurrentStoryIndex(nextIdx);

      const story = activeGroup.stories[nextIdx];
      // Optimistically mark as viewed in local state
      markStoryAsViewedLocally(story.id);

      try {
        await mediaService.viewStory(story.id);
      } catch (err) {
        console.error("Failed to mark story as viewed", err);
      }
    } else {
      // End of group, move to next group or close
      if (activeGroupIndex < groupedStories.length - 1) {
        openGroup(activeGroupIndex + 1);
      } else {
        closeViewer();
      }
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm("Delete this story?")) return;
    
    try {
      await mediaService.deleteStory(storyId);
      // Remove from local state
      setStories(prev => prev.filter(s => s.id !== storyId));
      
      // If it was the last story in the group, close viewer.
      // Otherwise, it will naturally move to the next or stay at the same index if valid.
      if (activeGroup.stories.length <= 1) {
        closeViewer();
      } else {
        // Just refresh the current view or move to next
        nextStory();
      }
    } catch (err) {
      console.error("Failed to delete story", err);
      alert("Failed to delete story.");
    }
  };

  const prevStory = () => {

    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      // Move to previous group if any
      if (activeGroupIndex > 0) {
        const prevGroupIdx = activeGroupIndex - 1;
        setActiveGroupIndex(prevGroupIdx);
        setCurrentStoryIndex(groupedStories[prevGroupIdx].stories.length - 1);
      }
    }
  };

  const closeViewer = () => {
    setActiveGroupIndex(null);
    setCurrentStoryIndex(0);
  };

  if (loading && stories.length === 0) return null;

  return (<div className="bg-white border-b border-gray-100 py-4"> <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar items-center">

    {/* Your Story (Unified View/Create) */}
    <div className="flex flex-col items-center gap-1 min-w-[72px]">
      <div className="relative group">
        <input
          type="file"
          id="story-upload"
          className="hidden"
          accept="image/*,video/*"
          onChange={handleCreateStory}
          disabled={isCreating}
        />

        {/* Main Avatar Circle */}
        <div
          onClick={() => {
            if (currentUserGroup) {
              const idx = groupedStories.findIndex(g => g.userId === currentUserGroup.userId);
              openGroup(idx);
            } else {
              document.getElementById('story-upload').click();
            }
          }}
          className={`h-16 w-16 rounded-full border-2 p-0.5 cursor-pointer flex items-center justify-center transition-all ${currentUserGroup
              ? (isCurrentUserViewed ? 'border-gray-200' : 'border-primary-500')
              : 'border-gray-200 grayscale-[0.5] hover:grayscale-0'
            }`}
        >
          <Avatar
            src={currentUser?.profilePicUrl}
            name={currentUser?.username || currentUser?.fullName || 'Me'}
            size="lg"
            className={`h-full w-full ${currentUserGroup && isCurrentUserViewed ? 'opacity-70' : ''}`}
          />
        </div>

        {/* Plus Badge */}
        <label
          htmlFor="story-upload"
          className="absolute bottom-0 right-0 bg-primary-500 rounded-full p-1 border-2 border-white shadow-sm cursor-pointer hover:bg-primary-600 transition-colors z-10"
        >
          {isCreating ? (
            <Loader2 className="h-3 w-3 text-white animate-spin" />
          ) : (
            <Plus className="h-3 w-3 text-white stroke-[3px]" />
          )}
        </label>
      </div>
      <span className="text-[11px] font-medium text-gray-500 truncate w-16 text-center">
        {currentUser?.username || 'You'}
      </span>
    </div>

    {/* Other User Stories */}
    {otherGroups.map((group) => {
      const globalIndex = groupedStories.findIndex(g => g.userId === group.userId);
      return (
        <StoryGroup
          key={group.userId || group.username}
          group={group}
          onClick={() => openGroup(globalIndex)}
        />
      );
    })}
  </div>

    {/* Story Viewer Modal */}
    {activeGroupIndex !== null && activeGroup && currentStory && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
        {/* Main Content Area (9:16 Aspect Ratio) */}
        <div className="relative w-full max-w-[420px] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in duration-300">

          {/* Progress Indicators */}
          <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-40">
            {activeGroup.stories.map((_, i) => (
              <div key={i} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300 ease-linear"
                  style={{
                    width: i < currentStoryIndex ? '100%' : (i === currentStoryIndex ? `${storyProgress}%` : '0%')
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-10 left-6 right-6 flex items-center justify-between z-30">
            <div className="flex items-center gap-3">
              <UsernameDisplay userId={activeGroup.userId} fallback={activeGroup.username} />
            </div>
            <div className="flex items-center gap-2">
              {(String(activeGroup.userId) === String(currentUser?.id)) && (
                <button
                  onClick={() => handleDeleteStory(currentStory.id)}
                  className="p-2 hover:bg-red-500/20 text-white/70 hover:text-red-400 rounded-full transition-colors"
                  title="Delete Story"
                >
                  <Trash2 className="h-6 w-6" />
                </button>
              )}
              <button
                onClick={closeViewer}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-8 w-8 text-white" />
              </button>
            </div>
          </div>


          {/* Navigation Tap Areas */}
          <div className="absolute inset-0 z-20 flex">
            <div className="w-1/3 h-full cursor-pointer" onClick={prevStory} />
            <div className="w-2/3 h-full cursor-pointer" onClick={nextStory} />
          </div>

          {/* Story Content */}
          <div className="h-full w-full flex items-center justify-center bg-black">
            {isImage(currentStory) ? (
              <AuthenticatedImage
                url={currentStory.mediaUrl || currentStory.media_url || currentStory.url}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                src={getFullUrl(currentStory.mediaUrl || currentStory.media_url || currentStory.url)}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                onLoadedMetadata={handleVideoMetadata}
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={nextStory}
              />
            )}
          </div>

          {/* Caption Overlay */}
          {currentStory.caption && (
            <div className="absolute bottom-10 left-6 right-6 z-30 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <p className="text-white text-sm text-center font-medium leading-snug">
                {currentStory.caption}
              </p>
            </div>
          )}

          {/* View Count (Only for Owner) */}
          {(String(activeGroup.userId) === String(currentUser?.id)) && (
            <div className="absolute bottom-6 left-6 z-40 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              <Eye className="h-4 w-4 text-white" />
              <span className="text-white text-xs font-bold">
                {currentStory.viewsCount || currentStory.viewCount || 0}
              </span>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Story Upload Preview Modal */}
    {storyPreviewUrl && (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
        <div className="relative w-full max-w-[420px] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col animate-in zoom-in duration-300">
          {/* Header */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
            <h3 className="text-white font-bold text-lg">Preview Story</h3>
            <button
              onClick={closeUploadModal}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-7 w-7 text-white" />
            </button>
          </div>

          {/* Preview Content */}
          <div className="flex-1 w-full flex items-center justify-center bg-black">
            {selectedStoryFile?.type.startsWith('image/') ? (
              <img src={storyPreviewUrl} className="w-full h-full object-contain" alt="Preview" />
            ) : (
              <video src={storyPreviewUrl} className="w-full h-full object-contain" controls />
            )}
          </div>

          {/* Controls Footer */}
          <div className="p-6 bg-gradient-to-t from-black/90 to-transparent pt-12 z-30">
            <input
              type="text"
              placeholder="Add a caption..."
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4 backdrop-blur-sm"
              value={storyCaption}
              onChange={(e) => setStoryCaption(e.target.value)}
              autoFocus
            />
            <button
              onClick={handleConfirmUpload}
              disabled={isCreating}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sharing...
                </>
              ) : (
                'Share to Story'
              )}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>

  );
};

export default StoryBar;
