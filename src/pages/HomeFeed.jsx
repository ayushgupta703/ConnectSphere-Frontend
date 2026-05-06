import React, { useEffect, useState } from 'react';
import { extractErrorMessage } from '../utils/apiUtils';
import { postService } from '../services/postService';
import { mediaService } from '../services/mediaService';
import PostCard from '../components/post/PostCard';
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

  const [isModalOpen, setIsModalOpen] = useState(false);
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
      setIsModalOpen(false);

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
      <div className="sticky top-0 z-[60] bg-white/80 backdrop-blur-md border-b border-gray-100/50 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-black text-gray-900 tracking-tight">Home</h1>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-full px-5 text-sm h-9 font-bold shadow-md hover:shadow-lg transition-all"
        >
          Create Post
        </Button>
      </div>

      {/* Stories */}
      <StoryBar />

      {/* Create Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Create New Post</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex gap-4">
                <Avatar
                  src={currentUser?.profilePicUrl}
                  name={currentUser?.fullName || currentUser?.username}
                  size="md"
                />
                <div className="flex-1">
                  <textarea
                    autoFocus
                    className="w-full bg-transparent resize-none outline-none text-gray-900 placeholder:text-gray-500 text-lg min-h-[120px]"
                    placeholder="What's happening?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />

                  {/* Visibility Selector */}
                  <div className="relative mt-2 z-10">
                    <button
                      type="button"
                      onClick={() => setShowVisibilityMenu(prev => !prev)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-full transition-colors border border-primary-200"
                    >
                      <SelectedIcon className="h-3.5 w-3.5" />
                      {selectedOption?.label}
                      <svg className="h-3 w-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showVisibilityMenu && (
                      <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-[60]">
                        {VISIBILITY_OPTIONS.map(({ value, label, icon: Icon, description }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => { setVisibility(value); setShowVisibilityMenu(false); }}
                            className={`w-full flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left ${visibility === value ? 'bg-primary-50' : ''}`}
                          >
                            <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${visibility === value ? 'text-primary-600' : 'text-gray-500'}`} />
                            <div>
                              <p className={`text-sm font-medium ${visibility === value ? 'text-primary-700' : 'text-gray-800'}`}>{label}</p>
                              <p className="text-xs text-gray-500 leading-tight">{description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Media Previews */}
                  {previews.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-1">
                      {previews.map((preview, index) => (
                        <div key={index} className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-200">
                          {preview.type === 'video' ? (
                            <video src={preview.url} className="h-full w-full object-cover" />
                          ) : (
                            <img src={preview.url} alt="preview" className="h-full w-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <input
                    type="file"
                    id="media-upload-modal"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="media-upload-modal"
                    className="text-primary-500 hover:bg-primary-50 p-2 rounded-full transition-colors cursor-pointer"
                  >
                    <ImageIcon className="h-6 w-6" />
                  </label>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-full px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    disabled={(!newPostContent.trim() && selectedFiles.length === 0) || isPosting || isUploadingMedia}
                    isLoading={isPosting || isUploadingMedia}
                    className="rounded-full px-8"
                  >
                    {isUploadingMedia ? 'Uploading...' : 'Post'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feed Content */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-10 w-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-gray-500 font-medium">Curating your feed...</p>
          </div>
        ) : error ? (
          <div className="py-12 px-6 text-center">
            <p className="text-red-500 font-medium">{error}</p>
            <button onClick={() => fetchFeed(0)} className="mt-4 px-6 py-2 bg-primary-50 text-primary-600 rounded-full font-bold hover:bg-primary-100 transition-all">
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 px-4 animate-in fade-in zoom-in duration-700">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Plus className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Your feed is quiet</h3>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm">Follow more people or create your first post to start the conversation!</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
            {posts.map((post, index) => (
              <div 
                key={post.id} 
                className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeFeed;
