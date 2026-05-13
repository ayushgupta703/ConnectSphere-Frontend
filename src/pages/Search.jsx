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
    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5"
  >
    <Avatar 
      src={user.profilePicUrl} 
      name={user.fullName || user.username} 
      size="lg" 
      className="shadow-lg ring-2 ring-dark-900"
    />
    <div className="flex-1">
      <h3 className="font-bold text-gray-100 text-[15px]">{user.fullName || user.username}</h3>
      <p className="text-[13px] text-primary-400 font-medium">@{user.username?.toLowerCase()}</p>
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
    <div className="w-full min-h-screen bg-dark-950">
      <div className="sticky top-0 z-10 bg-dark-950/80 backdrop-blur-xl border-b border-white/5 p-4 sm:p-6">
        <form onSubmit={handleFormSubmit} className="relative max-w-xl mx-auto">
          <Input 
            type="text"
            placeholder="Search @username, name, or #hashtags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 bg-dark-900 shadow-inner border-white/10 h-12 text-base rounded-full"
          />
          <SearchIcon className="absolute left-4 top-3 h-6 w-6 text-gray-500" />
        </form>
      </div>

      <div className="flex flex-col">
        {error && <div className="p-4 text-red-400 text-center">{error}</div>}
        
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary-500 h-10 w-10" />
          </div>
        ) : results.length > 0 ? (
          <div className="flex flex-col">
            <h2 className="font-bold text-gray-100 my-4 px-6 tracking-tight">
              Search Results ({results.length})
            </h2>
            <div className="flex flex-col gap-1 px-2 sm:px-4">
              {results.map((item) => (
                item.type === 'user' ? (
                  <UserResultItem key={`user-${item.id}`} user={item} />
                ) : (
                  <PostCard key={`post-${item.id}`} post={item} />
                )
              ))}
            </div>
          </div>
        ) : query.trim() && !loading ? (
          <div className="py-20 text-center text-gray-500 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-5 border border-white/5 shadow-inner">
              <SearchIcon className="h-10 w-10 text-gray-600" />
            </div>
            <p className="text-xl font-bold text-gray-100">No results found</p>
            <p className="text-sm mt-2 text-gray-500">Try a different @username, name or #hashtag</p>
          </div>
        ) : (
          <div className="py-20 text-center text-gray-500 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-dark-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
              <SearchIcon className="h-12 w-12 text-gray-600/50" />
            </div>
            <p className="text-xl font-bold text-gray-100">Search for people or hashtags</p>
            <p className="text-sm mt-2 text-gray-500">Start typing to see results</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

