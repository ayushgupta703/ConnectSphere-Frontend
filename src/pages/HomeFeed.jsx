import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { extractErrorMessage } from '../utils/apiUtils';
import { postService } from '../services/postService';
import { mediaService } from '../services/mediaService';
import PostCard from '../components/post/PostCard';
import PostSkeleton from '../components/post/PostSkeleton';
import StoryBar from '../components/story/StoryBar';
import Avatar from '../components/ui/Avatar';
import useAuthStore from '../store/useAuthStore';
import { Loader2, Image as ImageIcon, Globe, Lock, Users, X, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Public', icon: Globe, description: 'Anyone can see this post' },
  { value: 'FOLLOWERS_ONLY', label: 'Followers', icon: Users, description: 'Only your followers can see this' },
  { value: 'PRIVATE', label: 'Private', icon: Lock, description: 'Only you can see this post' },
];

const HomeFeed = () => {
  const { user: currentUser } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newPostContent, setNewPostContent] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [isPosting, setIsPosting] = useState(false);
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setSelectedFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      name: file.name
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async (retryCount = 0) => {
    try {
      if (retryCount === 0) setLoading(true);
      const data = await postService.getFeed();
      setPosts(data || []);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch feed:", err);
      if (retryCount < 1) {
        // Auto-retry once
        console.log("Auto-retrying feed fetch...");
        setTimeout(() => fetchFeed(retryCount + 1), 1000);
      } else {
        setError(extractErrorMessage(err, "Failed to load feed. Please try again later."));
        setLoading(false);
      }
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!newPostContent.trim() && selectedFiles.length === 0) return;

    setIsPosting(true);

    try {
      let mediaUrls = [];

      if (selectedFiles.length > 0) {
        setIsUploadingMedia(true);
        console.log("Selected files for upload:", selectedFiles);

        for (const file of selectedFiles) {
          try {
            console.log("Uploading file:", file.name);
            const res = await mediaService.uploadMedia(file);
            
            // Handle different response formats safely
            const url = 
              res?.mediaUrl ||   // preferred
              res?.url ||        // fallback
              res;               // raw string case

            if (url && typeof url === "string") {
              mediaUrls.push(url);
            } else if (Array.isArray(res)) {
              // Handle case where uploadMedia returns an array (common)
              const firstUrl = res[0]?.mediaUrl || res[0]?.url || res[0];
              if (typeof firstUrl === 'string') mediaUrls.push(firstUrl);
            } else if (Array.isArray(url)) {
              // Safety for nested arrays
              const flatUrl = url.flat().find(u => typeof u === 'string');
              if (flatUrl) mediaUrls.push(flatUrl);
            }
          } catch (uploadErr) {
            console.error(`Failed to upload file ${file.name}:`, uploadErr);
          }
        }
        setIsUploadingMedia(false);
      }

      // Final safety check to ensure flat array of strings
      mediaUrls = mediaUrls.filter(url => typeof url === "string");
      console.log("Final mediaUrls for payload:", mediaUrls);

      const newPost = await postService.createPost({
        content: newPostContent,
        mediaUrls: mediaUrls,
        visibility: visibility,
      });

      setPosts(prev => [newPost, ...prev]);

      // Cleanup
      previews.forEach(p => URL.revokeObjectURL(p.url));

      setNewPostContent('');
      setVisibility('PUBLIC');
      setSelectedFiles([]);
      setPreviews([]);

    } catch (err) {
      console.error("Failed to create post:", err);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
      setIsUploadingMedia(false);
    }
  };


  const selectedOption = VISIBILITY_OPTIONS.find(opt => opt.value === visibility);
  const SelectedIcon = selectedOption?.icon || Globe;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-[60] bg-dark-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <h1 className="text-xl font-black text-gray-100 tracking-tight">Home</h1>
      </div>

      {/* Stories */}
      <StoryBar />

      {/* Inline Compose Box */}
      <div className="px-4 sm:px-6 py-5 border-b border-white/5 bg-dark-950">
        <div className="flex gap-4">
          <Avatar
            src={currentUser?.profilePicUrl}
            name={currentUser?.fullName || currentUser?.username}
            size="md"
            className="shadow-md ring-2 ring-dark-900"
          />
          <div className="flex-1">
            <textarea
              className="w-full bg-transparent resize-none outline-none text-gray-100 placeholder:text-gray-600 text-lg min-h-[60px] pt-1"
              placeholder="What's happening?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />

            {/* Media Previews */}
            {previews.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 pb-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative h-32 w-32 sm:h-48 sm:w-48 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                    {preview.type === 'video' ? (
                      <video src={preview.url} className="h-full w-full object-cover" />
                    ) : (
                      <img src={preview.url} alt="preview" className="h-full w-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="media-upload-inline"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="media-upload-inline"
                  className="text-primary-500 hover:bg-primary-500/10 p-2 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                >
                  <ImageIcon className="h-5 w-5" />
                </label>

                {/* Visibility Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowVisibilityMenu(prev => !prev)}
                    className="flex items-center gap-1.5 text-[13px] font-bold text-primary-400 hover:bg-primary-500/10 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <SelectedIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">{selectedOption?.label}</span>
                  </button>

                  {showVisibilityMenu && (
                    <div className="absolute left-0 top-full mt-2 w-56 bg-dark-900 rounded-2xl shadow-xl border border-white/10 py-1.5 z-[60]">
                      {VISIBILITY_OPTIONS.map(({ value, label, icon: Icon, description }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => { setVisibility(value); setShowVisibilityMenu(false); }}
                          className={`w-full flex items-start gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left ${visibility === value ? 'bg-primary-500/10' : ''}`}
                        >
                          <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${visibility === value ? 'text-primary-500' : 'text-gray-400'}`} />
                          <div>
                            <p className={`text-sm font-bold ${visibility === value ? 'text-primary-400' : 'text-gray-200'}`}>{label}</p>
                            <p className="text-xs text-gray-500 leading-tight mt-0.5">{description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleCreatePost}
                disabled={(!newPostContent.trim() && selectedFiles.length === 0) || isPosting || isUploadingMedia}
                isLoading={isPosting || isUploadingMedia}
                className="rounded-full px-6 h-9 text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
              >
                {isUploadingMedia ? 'Uploading...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className="flex flex-col p-0 sm:p-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="py-12 px-6 text-center">
            <p className="text-red-400 font-medium">{error}</p>
            <button onClick={() => fetchFeed(0)} className="mt-4 px-6 py-2 bg-primary-500/10 text-primary-400 rounded-full font-bold hover:bg-primary-500/20 transition-all">
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 px-4 animate-in fade-in zoom-in duration-700">
            <div className="w-20 h-20 bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-5 border border-white/5 shadow-inner">
              <Plus className="h-10 w-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-100">Your feed is quiet</h3>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm">Follow more people or create your first post to start the conversation!</p>
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="flex flex-col gap-3"
          >
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HomeFeed;
