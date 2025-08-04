'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  Calendar, 
  Clock, 
  Tag, 
  Type,
  Image,
  Trash2,
  Plus,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { toast } from 'sonner';

interface ScheduledPost {
  id: string;
  content: string;
  platform: string;
  scheduledAt: string;
  status: 'scheduled' | 'processing' | 'published' | 'failed' | 'paused';
  brandId: string;
  brandName: string;
  mediaUrls?: string[];
  campaignId?: string;
  campaignName?: string;
  error?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

interface PostEditModalProps {
  post: ScheduledPost | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPost: ScheduledPost) => void;
}

const PostEditModal: React.FC<PostEditModalProps> = ({
  post,
  isOpen,
  onClose,
  onSave
}) => {
  const [editedPost, setEditedPost] = useState<ScheduledPost | null>(null);
  const [loading, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when post changes
  useEffect(() => {
    if (post) {
      setEditedPost({ ...post });
      setErrors({});
    }
  }, [post]);

  const handleSave = async () => {
    if (!editedPost) return;

    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!editedPost.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (editedPost.content.length > 2000) {
      newErrors.content = 'Content must be under 2000 characters';
    }
    
    if (!editedPost.scheduledAt) {
      newErrors.scheduledAt = 'Schedule date is required';
    } else {
      const scheduledDate = new Date(editedPost.scheduledAt);
      if (scheduledDate < new Date()) {
        newErrors.scheduledAt = 'Schedule date must be in the future';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedPost = {
        ...editedPost,
        updatedAt: new Date().toISOString()
      };
      
      onSave(updatedPost);
      toast.success('Post updated successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (content: string) => {
    if (!editedPost) return;
    
    setEditedPost({
      ...editedPost,
      content
    });
    
    // Clear content error when user starts typing
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }));
    }
  };

  const handleDateTimeChange = (dateTime: string) => {
    if (!editedPost) return;
    
    setEditedPost({
      ...editedPost,
      scheduledAt: dateTime
    });
    
    // Clear date error when user changes date
    if (errors.scheduledAt) {
      setErrors(prev => ({ ...prev, scheduledAt: '' }));
    }
  };

  const addMediaUrl = () => {
    if (!editedPost) return;
    
    const newMediaUrls = [...(editedPost.mediaUrls || []), ''];
    setEditedPost({
      ...editedPost,
      mediaUrls: newMediaUrls
    });
  };

  const updateMediaUrl = (index: number, url: string) => {
    if (!editedPost) return;
    
    const newMediaUrls = [...(editedPost.mediaUrls || [])];
    newMediaUrls[index] = url;
    
    setEditedPost({
      ...editedPost,
      mediaUrls: newMediaUrls
    });
  };

  const removeMediaUrl = (index: number) => {
    if (!editedPost) return;
    
    const newMediaUrls = editedPost.mediaUrls?.filter((_, i) => i !== index) || [];
    setEditedPost({
      ...editedPost,
      mediaUrls: newMediaUrls.length > 0 ? newMediaUrls : undefined
    });
  };

  const getPlatformIcon = () => {
    if (!editedPost) return null;
    
    const iconClass = "h-5 w-5";
    switch (editedPost.platform) {
      case 'twitter':
        return <div className={`${iconClass} bg-blue-400 rounded`} />;
      case 'facebook':
        return <div className={`${iconClass} bg-blue-600 rounded`} />;
      case 'linkedin':
        return <div className={`${iconClass} bg-blue-700 rounded`} />;
      case 'instagram':
        return <div className={`${iconClass} bg-pink-500 rounded`} />;
      default:
        return <ExternalLink className={iconClass} />;
    }
  };

  const getCharacterLimit = () => {
    switch (editedPost?.platform) {
      case 'twitter':
        return 280;
      case 'linkedin':
        return 1300;
      case 'facebook':
        return 2000;
      case 'instagram':
        return 2200;
      default:
        return 2000;
    }
  };

  if (!editedPost) return null;

  const characterLimit = getCharacterLimit();
  const isOverLimit = editedPost.content.length > characterLimit;
  const isNearLimit = editedPost.content.length > characterLimit * 0.9;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-dark-card border border-dark-border rounded-xl shadow-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getPlatformIcon()}
                  <h2 className="text-xl font-semibold">Edit Scheduled Post</h2>
                </div>
                <div className="px-2 py-1 bg-dark-lighter rounded text-sm text-white/70 capitalize">
                  {editedPost.platform}
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Post Content */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Type className="inline h-4 w-4 mr-2" />
                    Post Content
                  </label>
                  <div className="relative">
                    <textarea
                      value={editedPost.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      className={`w-full h-32 bg-dark-lighter border rounded-lg px-4 py-3 text-white resize-none focus:outline-none focus:ring-2 transition-colors ${
                        errors.content
                          ? 'border-red-400 focus:ring-red-400/50'
                          : isOverLimit
                            ? 'border-amber-400 focus:ring-amber-400/50'
                            : 'border-dark-border focus:ring-primary/50'
                      }`}
                      placeholder="Enter your post content..."
                    />
                    
                    {/* Character Count */}
                    <div className={`absolute bottom-3 right-3 text-xs ${
                      isOverLimit 
                        ? 'text-red-400' 
                        : isNearLimit 
                          ? 'text-amber-400' 
                          : 'text-white/60'
                    }`}>
                      {editedPost.content.length} / {characterLimit}
                    </div>
                  </div>
                  
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.content}
                    </p>
                  )}
                  
                  {isOverLimit && (
                    <p className="mt-1 text-sm text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Content exceeds {editedPost.platform} character limit
                    </p>
                  )}
                </div>

                {/* Schedule Date & Time */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editedPost.scheduledAt ? format(new Date(editedPost.scheduledAt), "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => handleDateTimeChange(new Date(e.target.value).toISOString())}
                    min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    className={`w-full bg-dark-lighter border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 transition-colors ${
                      errors.scheduledAt
                        ? 'border-red-400 focus:ring-red-400/50'
                        : 'border-dark-border focus:ring-primary/50'
                    }`}
                  />
                  
                  {errors.scheduledAt && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.scheduledAt}
                    </p>
                  )}
                </div>

                {/* Brand Info */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Tag className="inline h-4 w-4 mr-2" />
                    Brand
                  </label>
                  <div className="px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg text-white/80">
                    {editedPost.brandName}
                  </div>
                </div>

                {/* Campaign Info */}
                {editedPost.campaignName && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Campaign
                    </label>
                    <div className="px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg text-white/80">
                      {editedPost.campaignName}
                    </div>
                  </div>
                )}

                {/* Media URLs */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">
                      <Image className="inline h-4 w-4 mr-2" />
                      Media Files
                    </label>
                    <button
                      onClick={addMediaUrl}
                      className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Media
                    </button>
                  </div>
                  
                  {editedPost.mediaUrls && editedPost.mediaUrls.length > 0 ? (
                    <div className="space-y-2">
                      {editedPost.mediaUrls.map((url, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => updateMediaUrl(index, e.target.value)}
                            placeholder="Enter media URL..."
                            className="flex-1 bg-dark-lighter border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <button
                            onClick={() => removeMediaUrl(index)}
                            className="p-2 text-white/60 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/60 text-sm italic">No media files attached</p>
                  )}
                </div>

                {/* Status & Error Info */}
                {(editedPost.status === 'failed' && editedPost.error) && (
                  <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-lg">
                    <h4 className="text-red-400 font-medium mb-2">Error Information</h4>
                    <p className="text-sm text-white/80">{editedPost.error}</p>
                    {editedPost.retryCount > 0 && (
                      <p className="text-sm text-white/60 mt-1">
                        Previous retry attempts: {editedPost.retryCount}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-dark-border bg-dark/50">
              <div className="text-sm text-white/60">
                Last updated: {format(new Date(editedPost.updatedAt), 'MMM dd, yyyy \'at\' h:mm a')}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || isOverLimit}
                  className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PostEditModal;