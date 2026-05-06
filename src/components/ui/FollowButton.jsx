import React, { useState, useEffect } from 'react';
import { followService } from '../../services/followService';
import useAuthStore from '../../store/useAuthStore';
import { Button } from './Button';

const FollowButton = ({ 
  userId, 
  initialIsFollowing = null, 
  onFollowChange, 
  variant,
  className = ''
}) => {
  const { user: currentUser } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing || false);
  const [loading, setLoading] = useState(initialIsFollowing === null);
  const [actionLoading, setActionLoading] = useState(false);

  const isOwnUser = currentUser?.id?.toString() === userId?.toString();

  useEffect(() => {
    // If we already have the initial state (e.g. from Profile), don't fetch
    if (initialIsFollowing !== null || isOwnUser || !userId) {
      setLoading(false);
      return;
    }

    const checkFollowStatus = async () => {
      try {
        const following = await followService.isFollowing(userId);
        setIsFollowing(following);
      } catch (error) {
        console.error("Failed to check follow status", error);
      } finally {
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, [userId, initialIsFollowing, isOwnUser]);

  // Update internal state if parent state changes (e.g. initialIsFollowing changes)
  useEffect(() => {
    if (initialIsFollowing !== null) {
      setIsFollowing(initialIsFollowing);
    }
  }, [initialIsFollowing]);

  const handleFollowToggle = async (e) => {
    e.stopPropagation(); // Prevent navigating to post/profile when clicking button
    if (isOwnUser || actionLoading) return;
    
    // Optimistic update
    const previousState = isFollowing;
    setIsFollowing(!previousState);
    if (onFollowChange) onFollowChange(!previousState);
    
    setActionLoading(true);
    try {
      if (previousState) {
        await followService.unfollowUser(userId);
      } else {
        await followService.followUser(userId);
      }
    } catch (error) {
      // Revert on failure
      setIsFollowing(previousState);
      if (onFollowChange) onFollowChange(previousState);
      console.error("Follow/Unfollow error", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (isOwnUser || !userId) return null;

  // Compute button styling
  const currentVariant = variant || (isFollowing ? 'outline' : 'primary');
  
  return (
    <Button
      onClick={handleFollowToggle}
      variant={currentVariant}
      isLoading={actionLoading || loading}
      disabled={loading}
      className={`min-w-[100px] text-sm py-1.5 h-auto ${className}`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
};

export default FollowButton;
