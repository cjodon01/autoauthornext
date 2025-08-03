'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Clock, 
  Camera, 
  Save, 
  AlertTriangle,
  Globe,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

interface ProfileSettingsProps {
  profile: UserProfile;
  onSave: (updatedProfile: Partial<UserProfile>) => Promise<void>;
  loading: boolean;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  profile,
  onSave,
  loading
}) => {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    timezone: profile.timezone || 'America/New_York',
    avatar_url: profile.avatar_url || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Common timezones for the dropdown
  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' }
  ];

  useEffect(() => {
    // Check if form data differs from profile
    const changed = 
      formData.full_name !== (profile.full_name || '') ||
      formData.timezone !== profile.timezone ||
      formData.avatar_url !== (profile.avatar_url || '');
    
    setHasChanges(changed);
  }, [formData, profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters long';
    }
    
    if (formData.full_name.trim().length > 50) {
      newErrors.full_name = 'Name must be less than 50 characters';
    }
    
    if (formData.avatar_url && !isValidUrl(formData.avatar_url)) {
      newErrors.avatar_url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave({
        full_name: formData.full_name.trim(),
        timezone: formData.timezone,
        avatar_url: formData.avatar_url.trim() || undefined
      });
      setHasChanges(false);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleAvatarUpload = () => {
    // In a real app, this would open a file picker or integration with image service
    toast.info('Avatar upload integration coming soon');
  };

  const getCurrentTime = () => {
    try {
      return new Date().toLocaleString('en-US', {
        timeZone: formData.timezone,
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return 'Invalid timezone';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Profile Information
        </h2>
        <p className="text-white/70 text-sm">
          Update your personal information and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div>
          <label className="block text-sm font-medium mb-3">Profile Picture</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-dark-lighter border-2 border-dark-border">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-10 w-10 text-white/40" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAvatarUpload}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-dark-lighter hover:bg-dark-border text-white text-sm rounded-lg transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  Upload Photo
                </button>
              </div>
              <p className="text-white/60 text-xs mt-2">
                JPG, PNG or SVG. Max file size 2MB.
              </p>
            </div>
          </div>
          
          {/* Avatar URL Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Or enter image URL</label>
            <input
              type="url"
              value={formData.avatar_url}
              onChange={(e) => handleInputChange('avatar_url', e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className={`w-full bg-dark-lighter border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 transition-colors ${
                errors.avatar_url
                  ? 'border-red-400 focus:ring-red-400/50'
                  : 'border-dark-border focus:ring-primary/50'
              }`}
            />
            {errors.avatar_url && (
              <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.avatar_url}
              </p>
            )}
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <User className="inline h-4 w-4 mr-2" />
            Full Name
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            placeholder="Enter your full name"
            className={`w-full bg-dark-lighter border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 transition-colors ${
              errors.full_name
                ? 'border-red-400 focus:ring-red-400/50'
                : 'border-dark-border focus:ring-primary/50'
            }`}
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {errors.full_name}
            </p>
          )}
        </div>

        {/* Email (Read-only) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Mail className="inline h-4 w-4 mr-2" />
            Email Address
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full bg-dark-lighter/50 border border-dark-border rounded-lg px-4 py-3 text-white/60 cursor-not-allowed"
          />
          <p className="mt-1 text-white/50 text-xs">
            Email cannot be changed. Contact support if you need to update your email.
          </p>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Globe className="inline h-4 w-4 mr-2" />
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          
          {/* Current time preview */}
          <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
            <Clock className="h-3 w-3" />
            <span>Current time: {getCurrentTime()}</span>
          </div>
        </div>

        {/* Account Information */}
        <div className="pt-6 border-t border-dark-border">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Account Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/60">Account Created:</span>
              <p className="text-white font-medium">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div>
              <span className="text-white/60">Last Updated:</span>
              <p className="text-white font-medium">
                {new Date(profile.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-6 border-t border-dark-border">
          <div>
            {hasChanges && (
              <p className="text-amber-400 text-sm flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                You have unsaved changes
              </p>
            )}
          </div>
          
          <motion.button
            type="submit"
            disabled={!hasChanges || loading}
            className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: hasChanges && !loading ? 1.02 : 1 }}
            whileTap={{ scale: hasChanges && !loading ? 0.98 : 1 }}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;