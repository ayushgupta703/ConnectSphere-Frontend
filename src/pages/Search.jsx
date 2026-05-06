import React, { useState, useEffect, useCallback } from 'react';
import { searchService } from '../services/searchService';
import { postService } from '../services/postService';
import { Search as SearchIcon, TrendingUp, Loader2, User as UserIcon } from 'lucide-react';
import { Input } from '../components/ui/Input';
import PostCard from '../components/post/PostCard';
import Avatar from '../components/ui/Avatar';
import { Link } from 'react-router-dom';

const UserResultItem = ({ user }) => (
  <Link 
    to={`/profile/${user.id}`}
    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
  >
    <Avatar 
      src={user.profilePicUrl} 
      name={user.fullName || user.username} 
      size="lg" 
    />
    <div className="flex-1">
      <h3 className="font-semibold text-gray-900">{user.fullName || user.username}</h3>
      <p className="text-sm text-gray-500">@{user.username?.toLowerCase()}</p>
    </div>
  </Link>
);

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = useCallback(async (searchQuery) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (trimmedQuery.startsWith('#')) {
        // Hashtag search -> Returns posts
        const tag = trimmedQuery.slice(1);
        console.log(`[Search] Triggering hashtag search for: "${tag}"`);
        const data = await searchService.searchHashtags(tag);
        console.log('[Search] Hashtag data received:', data);
        
        const normalized = (Array.isArray(data) ? data : [])
          .filter(Boolean)
          .map(item => ({ ...item, type: 'post' }));
          
        setResults(normalized);
      } else {
        // General search -> Search users AND posts by keyword
        console.log(`[Search] Triggering smart user search and keyword post search for: "${trimmedQuery}"`);
        const [userData, postData] = await Promise.all([
          searchService.searchUsers(trimmedQuery).catch(() => []),
          postService.searchPosts(trimmedQuery).catch(() => [])
        ]);

        const normalizedUsers = (Array.isArray(userData) ? userData : [])
          .filter(Boolean)
          .map(item => ({ ...item, type: 'user' }));

        const normalizedPosts = (Array.isArray(postData) ? postData : [])
          .filter(Boolean)
          .map(item => ({ ...item, type: 'post' }));
          
        setResults([...normalizedUsers, ...normalizedPosts]);
      }
    } catch (err) {
      console.error('Search failed', err);
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4">
        <form onSubmit={handleFormSubmit} className="relative">
          <Input 
            type="text"
            placeholder="Search @username, name, or #hashtags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
          <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </form>
      </div>

      <div className="p-0">
        {error && <div className="p-4 text-red-500">{error}</div>}
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary-500 h-8 w-8" />
          </div>
        ) : results.length > 0 ? (
          <div className="divide-y divide-gray-100">
            <h2 className="font-semibold text-gray-900 my-4 px-4">
              Search Results ({results.length})
            </h2>
            {results.map((item) => (
              item.type === 'user' ? (
                <UserResultItem key={`user-${item.id}`} user={item} />
              ) : (
                <PostCard key={`post-${item.id}`} post={item} />
              )
            ))}
          </div>
        ) : query.trim() && !loading ? (
          <div className="py-16 text-center text-gray-500">
            <SearchIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No results found</p>
            <p className="text-sm mt-1">Try a different @username, name or #hashtag</p>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <SearchIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Search for people or hashtags</p>
            <p className="text-sm">Start typing to see results</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

