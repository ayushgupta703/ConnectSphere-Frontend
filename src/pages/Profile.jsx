import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { followService } from '../services/followService';
import { postService } from '../services/postService';
import { mediaService } from '../services/mediaService';
import { authService } from '../services/authService';
import useAuthStore from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import FollowButton from '../components/ui/FollowButton';
import PostCard from '../components/post/PostCard';
import Avatar from '../components/ui/Avatar';
import EditProfileModal from '../components/EditProfileModal';
import { Loader2, Camera, Edit } from 'lucide-react';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPic(true);
    try {
      // 1. Upload to media service
      const picUrl = await mediaService.uploadProfilePicture(file);
      
      // 2. Update auth service
      await authService.updateProfile({ profilePicUrl: picUrl });
      
      // 3. Update local state
      setProfile(prev => ({ ...prev, profilePicUrl: picUrl }));
      
      // 4. Update auth store so changes reflect globally
      updateUser({ profilePicUrl: picUrl });
      
      alert("Profile picture updated!");
    } catch (err) {
      console.error("Failed to upload profile picture", err);
      alert("Failed to upload profile picture.");
    } finally {
      setIsUploadingPic(false);
    }
  };

  const isOwnProfile = userId === 'me' || userId === currentUser?.id?.toString();

  useEffect(() => {
    const fetchProfileData = async () => {
      const targetId = isOwnProfile ? currentUser?.id : userId;
      // console.log("[Profile] Fetching data for:", { userId, isOwnProfile, targetId, currentUserId: currentUser?.id });

      if (!targetId || targetId === 'me') {
        if (isOwnProfile && !currentUser?.id) {
          console.log("[Profile] Waiting for currentUser to initialize...");
          return; // Wait for currentUser to be available
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch the user profile from auth service
        // console.log(`[Profile] Fetching user profile: ${targetId}`);
        const userData = await authService.getUserById(targetId);
        
        // Ensure property name consistency
        if (userData && userData.profilePicture && !userData.profilePicUrl) {
          userData.profilePicUrl = userData.profilePicture;
        }

        setProfile(userData);

        // Fetch posts
        // console.log(`[Profile] Fetching posts for: ${targetId}`);
        const postsData = await postService.getUserPosts(targetId);
        setPosts(Array.isArray(postsData) ? postsData : []);

        // Fetch follow stats
        // console.log(`[Profile] Fetching follow stats for: ${targetId}`);
        const followers = await followService.getFollowers(targetId);
        const following = await followService.getFollowing(targetId);

        setFollowersCount(followers?.length || 0);
        setFollowingCount(following?.length || 0);

        if (!isOwnProfile) {
          setIsFollowing(followers.some(f => f.followerId === currentUser?.id));
        }
      } catch (error) {
        console.error("[Profile] Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, currentUser, isOwnProfile]);



  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary-500" /></div>;
  }

  return (
    <div className="w-full min-h-screen bg-dark-950">
      {/* Profile Header */}
      <div className="bg-dark-900 border-b border-white/5 p-6 sm:p-10 relative overflow-hidden">
        {/* Abstract Background Gradient */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group">
            <Avatar 
              src={profile?.profilePicUrl} 
              name={profile?.fullName || profile?.username} 
              size="xl" 
              className="shadow-lg"
            />
            {isOwnProfile && (
              <>
                <input 
                  type="file" 
                  id="profile-pic-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleProfilePicUpload}
                  disabled={isUploadingPic}
                />
                <label 
                  htmlFor="profile-pic-upload"
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300"
                >
                  {isUploadingPic ? <Loader2 className="h-8 w-8 text-white animate-spin" /> : <Camera className="h-8 w-8 text-white" />}
                </label>
              </>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            {/* Line 93: Full name (bold heading) */}
            <h1 className="text-2xl sm:text-3xl font-black text-gray-100 tracking-tight">
              {profile?.fullName || profile?.username || 'Unknown User'}
            </h1>
            {/* Line 94: @username handle */}
            <p className="text-primary-400 font-medium mt-1">@{profile?.username?.toLowerCase()}</p>

            {profile?.bio && (
              <p className="mt-3 text-gray-300 text-[15px] leading-relaxed max-w-md mx-auto sm:mx-0">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-6 mt-5 text-sm text-gray-400">
              <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-200 transition-colors">
                <span className="font-bold text-gray-100">{followingCount}</span> Following
              </div>
              <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-200 transition-colors">
                <span className="font-bold text-gray-100">{followersCount}</span> Followers
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-0">
            {!isOwnProfile ? (
              <FollowButton
                userId={userId}
                initialIsFollowing={isFollowing}
                onFollowChange={(newStatus) => {
                  setIsFollowing(newStatus);
                  setFollowersCount(prev => newStatus ? prev + 1 : prev - 1);
                }}
                className="min-w-[120px]"
              />
            ) : (
              <Button 
                variant="secondary" 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* User Posts */}
      <div className="flex flex-col gap-3 p-0 sm:p-4 bg-dark-950 mt-2">
        {!Array.isArray(posts) || posts.length === 0 ? (
          <div className="py-20 text-center text-gray-500 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 shadow-inner">
              <Camera className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-200">No posts yet</h3>
            <p className="text-sm text-gray-500 mt-1">When they post, it will show up here.</p>
          </div>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} showVisibility={isOwnProfile} />)
        )}
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={profile}
        onUpdate={(updatedUser) => setProfile(prev => ({ ...prev, ...updatedUser }))}
      />
    </div>
  );
};

export default Profile;
