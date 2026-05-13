import { useState, useEffect } from 'react';
import { authApi } from '../api/axios';
import useAuthStore from '../store/useAuthStore';

/**
 * Module-level cache: { [userId]: userObject }
 * Shared across all components so each user is only fetched ONCE.
 */
const cache = {};

/**
 * Resolves a userId to a full user profile object.
 *
 * Strategy (in order):
 *  1. If userId matches the logged-in user → use user from auth store instantly.
 *  2. If already cached → return cached value.
 *  3. Otherwise → call GET /auth/users/{userId} on the auth-service and cache the result.
 *
 * @param {string|number|undefined} userId
 * @returns {Object} userProfile { fullName, username, profilePicUrl, ... }
 */
const useUserProfile = (userId) => {
  const currentUser = useAuthStore((state) => state.user);

  const getInitial = () => {
    if (!userId) return null;
    const id = String(userId);

    // Own profile
    if (currentUser && String(currentUser.id) === id) {
      return currentUser;
    }

    // Previously fetched
    return cache[id] ?? null;
  };

  const [profile, setProfile] = useState(getInitial);

  useEffect(() => {
    if (!userId) return;
    const id = String(userId);

    // Own profile — already handled by state subscription or initial value
    if (currentUser && String(currentUser.id) === id) {
      setProfile(currentUser);
      return;
    }

    // Already cached
    if (cache[id] !== undefined) {
      setProfile(cache[id]);
      return;
    }

    let cancelled = false;

    // Fetch from auth-service
    authApi
      .get(`/auth/users/${id}`)
      .then((res) => {
        const data = res.data;
        // Ensure property name consistency
        if (data && data.profilePicture && !data.profilePicUrl) {
          data.profilePicUrl = data.profilePicture;
        }
        
        cache[id] = data;
        if (!cancelled) setProfile(data);
      })
      .catch((error) => {
        console.warn(`[useUserProfile] Failed to fetch user ${id}:`, error.response?.status || error.message);
        // Cache null to stop retrying on every render
        cache[id] = null;
        if (!cancelled) setProfile(null);
      });

    return () => { cancelled = true; };
  }, [userId, currentUser]);

  // Derived display name: Prefer username over fullName for posts, comments, and notifications
  const displayName = profile?.username || profile?.fullName || (userId ? `User ${String(userId).slice(0, 4)}` : 'Unknown');

  return {
    ...profile,
    displayName,
    profilePicUrl: profile?.profilePicUrl || profile?.profilePicture || null,
    isLoading: profile === null && !!userId && cache[String(userId)] === undefined
  };
};

export default useUserProfile;
