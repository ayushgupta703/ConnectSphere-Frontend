import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { mediaService } from '../services/mediaService';
import { authService } from '../services/authService';
import useAuthStore from '../store/useAuthStore';
import { Trash2 } from 'lucide-react';


const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const { updateUser, logout } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedUser = await authService.updateProfile(formData);
      
      // Update global auth store
      updateUser(updatedUser);
      
      // Update local profile state in Profile.jsx
      onUpdate(updatedUser);
      
      onClose();
    } catch (err) {
      console.error("Failed to update profile", err);
      setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you absolutely sure you want to delete your account? This action is irreversible (your data will be deactivated)."
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      await authService.deleteAccount();
      alert("Your account has been deactivated. You will be logged out.");
      logout();
      window.location.href = "/login";
    } catch (err) {
      console.error("Failed to delete account", err);
      setError("Failed to delete account. Please try again later.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-sm font-semibold text-gray-700 ml-1">
              Full Name
            </label>
            <Input
              id="fullName"
              placeholder="Your full name"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-semibold text-gray-700 ml-1">
                Username
              </label>
              <Input
                id="username"
                placeholder="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 ml-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="bio" className="text-sm font-semibold text-gray-700 ml-1">
              Bio
            </label>
            <textarea
              id="bio"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all min-h-[100px] text-sm"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 rounded-xl"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl"
              isLoading={loading}
            >
              Save Changes
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EditProfileModal;
