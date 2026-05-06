import { useState, useEffect } from 'react';
import { authApi } from '../api/axios';
import useAuthStore from '../store/useAuthStore';

/**
 * Module-level cache: { [userId]: username }
 * Shared across all PostCard and Notification instances so each user is only fetched ONCE.
 */
const cache = {};

/**
 * Resolves a userId to a display username.
 *
 * Strategy (in order):
 *  1. If userId matches the logged-in user → use username from auth store instantly (no API call).
 *  2. If already cached → return cached value.
 *  3. Otherwise → call GET /users/{userId} on the auth-service and cache the result.
 *  4. On failure (e.g., 500 error, 404 not found) → fall back to the raw userId string.
 *
 * @param {string|number|undefined} userId
 * @returns {string} displayName
 */
const useUserName = (userId) => {
  const currentUser = useAuthStore((state) => state.user);

  // Determine the initial value synchronously to avoid a loading flash
  const getInitial = () => {
    if (!userId) return 'Unknown';
    const id = String(userId);

    // Own posts/notifications — we already know the username/name
    if (currentUser && String(currentUser.id) === id) {
      const name = currentUser.username || currentUser.fullName ||
        (currentUser.firstName && currentUser.lastName ? `${currentUser.firstName} ${currentUser.lastName}` : null) || currentUser.name;
      if (name) return name;
    }

    // Previously fetched
    return cache[id] ?? null;
  };

  const [username, setUsername] = useState(getInitial);

  useEffect(() => {
    if (!userId) return;
    const id = String(userId);

    // Own posts/notifications — always resolved from auth store, no fetch needed
    if (currentUser && String(currentUser.id) === id) {
      const name = currentUser.username || currentUser.fullName ||
        (currentUser.firstName && currentUser.lastName ? `${currentUser.firstName} ${currentUser.lastName}` : null) || currentUser.name;
      if (name) {
        cache[id] = name;
        setUsername(name);
        return;
      }
    }

    // Already cached
    if (cache[id] !== undefined) {
      setUsername(cache[id]);
      return;
    }

    let cancelled = false;

    // Fetch from auth-service
    authApi
      .get(`/auth/users/${id}`)
      .then((res) => {
        const data = res.data;
        const fullName = data?.fullName ||
          (data?.firstName && data?.lastName ? `${data.firstName} ${data.lastName}` : null);
        const name = data?.username || data?.name || fullName || id;

        cache[id] = name;
        if (!cancelled) setUsername(name);
      })
      .catch((error) => {
        console.warn(`[useUserName] Failed to fetch user ${id}:`, error.response?.status || error.message);
        // Cache the fallback (the raw ID) so we stop retrying on every render
        cache[id] = id;
        if (!cancelled) setUsername(id);
      });

    return () => { cancelled = true; };
  }, [userId, currentUser]);

  // Show a short ID snippet while a fetch is in flight
  if (username === null && userId) {
    return `${String(userId).slice(0, 8)}…`;
  }

  return username || 'Unknown';
};

export default useUserName;
