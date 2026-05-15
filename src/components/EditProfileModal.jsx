import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { authService } from '../services/authService';
import useAuthStore from '../store/useAuthStore';

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
      updateUser(updatedUser);
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

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card bg-dark-900 border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="text-xl font-bold text-gray-100">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-200" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-sm font-medium border border-red-500/20 text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-sm font-semibold text-gray-300 ml-1">
              Full Name
            </label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-semibold text-gray-300 ml-1">
                Username
              </label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-gray-300 ml-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="bio" className="text-sm font-semibold text-gray-300 ml-1">
              Bio
            </label>
            <textarea
              id="bio"
              className="w-full bg-dark-950 border border-white/5 rounded-xl px-4 py-3 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all min-h-[100px] text-sm shadow-inner"
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
              className="flex-1 rounded-xl h-11 border border-white/5 hover:bg-white/5"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl h-11 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
              isLoading={loading}
            >
              Save Changes
            </Button>
          </div>

          <div className="pt-6 mt-6 border-t border-white/5">
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EditProfileModal;
