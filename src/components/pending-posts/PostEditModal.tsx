'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  AlertTriangle,
  Sparkles,
  Download,
  Upload,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  RotateCcw,
  Zap,
  RefreshCw,
  Edit3,
  Loader2
} from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  strokeColor: string;
  strokeWidth: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  textAlign: 'left' | 'center' | 'right';
  isVisible: boolean;
  rotation: number;
  width: number;
  height: number;
  backgroundColor: string;
  backgroundOpacity: number;
}

interface ImagePosition {
  x: number;
  y: number;
  scale: number;
}

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
  // Enhanced fields for meme editing
  selectedImage?: string | null;
  textOverlays?: TextOverlay[];
  imagePosition?: ImagePosition;
}

interface PostEditModalProps {
  post: ScheduledPost | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPost: ScheduledPost) => void;
}

// Enhanced font families with Google Fonts
const fontFamilies = [
  { name: 'Impact', value: 'Impact, Charcoal, sans-serif' },
  { name: 'Comic Sans', value: '"Comic Sans MS", cursive, sans-serif' },
  { name: 'Arial Black', value: '"Arial Black", Gadget, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { name: 'Courier New', value: '"Courier New", Courier, monospace' },
  { name: 'Roboto', value: '"Roboto", sans-serif' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif' },
  { name: 'Lato', value: '"Lato", sans-serif' },
  { name: 'Oswald', value: '"Oswald", sans-serif' },
  { name: 'Bebas Neue', value: '"Bebas Neue", cursive' },
  { name: 'Anton', value: '"Anton", sans-serif' },
  { name: 'Righteous', value: '"Righteous", cursive' }
];

const colors = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', 
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
];

const backgroundColors = [
  'transparent', '#FFFFFF', '#000000', '#FF0000', '#00FF00', 
  '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'
];

const PostEditModal: React.FC<PostEditModalProps> = ({
  post,
  isOpen,
  onClose,
  onSave
}) => {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [editedPost, setEditedPost] = useState<ScheduledPost | null>(null);
  const [loading, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Meme editing state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState<ImagePosition>({ x: 0, y: 0, scale: 1 });
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showMemeEditor, setShowMemeEditor] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Drag state
  const [dragRef, setDragRef] = useState<{ x: number; y: number } | null>(null);
  const [imageDragRef, setImageDragRef] = useState<{ x: number; y: number } | null>(null);
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Oswald:wght@400;700&family=Bebas+Neue&family=Anton&family=Righteous&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // Initialize form when post changes
  useEffect(() => {
    if (post) {
      setEditedPost({ ...post });
      setErrors({});
      
      // Initialize meme editing state from post
      setSelectedImage(post.selectedImage || null);
      setTextOverlays(post.textOverlays || []);
      setImagePosition(post.imagePosition || { x: 0, y: 0, scale: 1 });
      setCapturedImage(null);
    }
  }, [post]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, overlayId: string) => {
    e.preventDefault();
    const overlay = textOverlays.find(o => o.id === overlayId);
    if (overlay) {
      setDragRef({ x: e.clientX - overlay.x, y: e.clientY - overlay.y });
      setSelectedOverlay(overlayId);
    }
  }, [textOverlays]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragRef && selectedOverlay) {
      setTextOverlays(prev => prev.map(overlay => 
        overlay.id === selectedOverlay 
          ? { ...overlay, x: e.clientX - dragRef.x, y: e.clientY - dragRef.y }
          : overlay
      ));
    }
  }, [dragRef, selectedOverlay]);

  const handleMouseUp = useCallback(() => {
    setDragRef(null);
  }, []);

  // Image drag handlers
  const handleImageMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setImageDragRef({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
  }, [imagePosition]);

  useEffect(() => {
    if (dragRef || imageDragRef) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragRef, imageDragRef, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (imageDragRef) {
      const handleImageMouseMove = (e: MouseEvent) => {
        setImagePosition(prev => ({
          ...prev,
          x: e.clientX - imageDragRef.x,
          y: e.clientY - imageDragRef.y
        }));
      };

      const handleImageMouseUp = () => {
        setImageDragRef(null);
      };

      document.addEventListener('mousemove', handleImageMouseMove);
      document.addEventListener('mouseup', handleImageMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleImageMouseMove);
        document.removeEventListener('mouseup', handleImageMouseUp);
      };
    }
  }, [imageDragRef]);

  // Text overlay functions
  const addTextOverlay = () => {
    const newOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: 'Edit this text',
      x: 50,
      y: 50,
      fontSize: 48,
      color: '#FFFFFF',
      fontFamily: 'Impact, Charcoal, sans-serif',
      strokeColor: '#000000',
      strokeWidth: 2,
      isBold: true,
      isItalic: false,
      isUnderline: false,
      textAlign: 'center',
      isVisible: true,
      rotation: 0,
      width: 300,
      height: 100,
      backgroundColor: 'transparent',
      backgroundOpacity: 0.8
    };
    setTextOverlays(prev => [...prev, newOverlay]);
    setSelectedOverlay(newOverlay.id);
  };

  const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays(prev => prev.map(overlay => 
      overlay.id === id ? { ...overlay, ...updates } : overlay
    ));
  };

  const removeTextOverlay = (id: string) => {
    setTextOverlays(prev => prev.filter(overlay => overlay.id !== id));
    if (selectedOverlay === id) {
      setSelectedOverlay(null);
    }
  };

  // Image handling
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setImagePosition({ x: 0, y: 0, scale: 1 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async (prompt: string) => {
    if (!user) {
      toast.error("Please log in to generate images");
      return;
    }
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Not logged in");
        return;
      }

      // Get the user's brand ID
      const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (brandsError) {
        throw new Error('Failed to fetch brand information');
      }

      if (!brands || brands.length === 0) {
        toast.error("Please create a brand profile first");
        return;
      }

      const brandId = brands[0].id;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-media-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          brand_id: brandId,
          type: 'image'
        }),
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate image');
      }
      
      if (result.generated_content && result.generated_content.imageUrl) {
        setSelectedImage(result.generated_content.imageUrl);
        setImagePosition({ x: 0, y: 0, scale: 1 });
        toast.success('Image generated successfully!');
      } else {
        throw new Error('No image URL in response');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
    } finally {
      setGenerating(false);
    }
  };

  const captureCanvas = async (): Promise<string | null> => {
    if (!canvasRef.current) return null;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error capturing canvas:', error);
      return null;
    }
  };

  const handleCaptureMeme = async () => {
    setIsCapturing(true);
    try {
      const dataUrl = await captureCanvas();
      if (dataUrl) {
        setCapturedImage(dataUrl);
        toast.success('Meme captured!');
      } else {
        toast.error('Failed to capture meme');
      }
    } catch (error) {
      console.error('Error capturing meme:', error);
      toast.error('Failed to capture meme');
    } finally {
      setIsCapturing(false);
    }
  };

  const resetCanvas = () => {
    setSelectedImage(null);
    setTextOverlays([]);
    setSelectedOverlay(null);
    setImagePosition({ x: 0, y: 0, scale: 1 });
    setCapturedImage(null);
  };

  const handleSave = async () => {
    if (!editedPost || !user) return;

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
      let finalMediaUrls = [...(editedPost.mediaUrls || [])];
      
      // If we have a captured meme, upload it to Supabase storage
      if (capturedImage) {
        try {
          // Convert data URL to blob
          const response = await fetch(capturedImage);
          const blob = await response.blob();
          
          // Upload to Supabase storage
          const fileName = `post-meme-${editedPost.id}-${Date.now()}.png`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('user-media')
            .upload(fileName, blob);
          
          if (uploadError) throw uploadError;
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('user-media')
            .getPublicUrl(fileName);
          
          // Add the meme URL to mediaUrls
          finalMediaUrls.push(publicUrl);
          
          toast.success('Meme uploaded to storage successfully!');
        } catch (uploadError) {
          console.error('Error uploading meme:', uploadError);
          toast.error('Failed to upload meme to storage');
        }
      }
      
      // If we have a generated/uploaded image, also upload it to storage
      if (selectedImage && !selectedImage.startsWith('data:') && !selectedImage.startsWith('blob:')) {
        // This is already a URL (from AI generation or external source)
        // We might want to download and re-upload it to our storage for consistency
        try {
          const response = await fetch(selectedImage);
          const blob = await response.blob();
          
          const fileName = `post-image-${editedPost.id}-${Date.now()}.png`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('user-media')
            .upload(fileName, blob);
          
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('user-media')
            .getPublicUrl(fileName);
          
          // Replace the original URL with our storage URL
          finalMediaUrls.push(publicUrl);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          // Keep the original URL if upload fails
          if (!finalMediaUrls.includes(selectedImage)) {
            finalMediaUrls.push(selectedImage);
          }
        }
      } else if (selectedImage && (selectedImage.startsWith('data:') || selectedImage.startsWith('blob:'))) {
        // This is a data URL or blob URL (from file upload), upload it
        try {
          const response = await fetch(selectedImage);
          const blob = await response.blob();
          
          const fileName = `post-upload-${editedPost.id}-${Date.now()}.png`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('user-media')
            .upload(fileName, blob);
          
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('user-media')
            .getPublicUrl(fileName);
          
          finalMediaUrls.push(publicUrl);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.error('Failed to upload image to storage');
        }
      }
      
      const updatedPost = {
        ...editedPost,
        mediaUrls: finalMediaUrls,
        selectedImage,
        textOverlays,
        imagePosition,
        capturedImage,
        updatedAt: new Date().toISOString()
      };
      
      onSave(updatedPost);
      onClose();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (content: string) => {
    if (editedPost) {
      setEditedPost({ ...editedPost, content });
    }
  };

  const handleDateTimeChange = (dateTime: string) => {
    if (editedPost) {
      setEditedPost({ ...editedPost, scheduledAt: dateTime });
    }
  };

  const addMediaUrl = () => {
    if (editedPost) {
    const newMediaUrls = [...(editedPost.mediaUrls || []), ''];
      setEditedPost({ ...editedPost, mediaUrls: newMediaUrls });
    }
  };

  const updateMediaUrl = (index: number, url: string) => {
    if (editedPost && editedPost.mediaUrls) {
      const newMediaUrls = [...editedPost.mediaUrls];
    newMediaUrls[index] = url;
      setEditedPost({ ...editedPost, mediaUrls: newMediaUrls });
    }
  };

  const removeMediaUrl = (index: number) => {
    if (editedPost && editedPost.mediaUrls) {
      const newMediaUrls = editedPost.mediaUrls.filter((_, i) => i !== index);
      setEditedPost({ ...editedPost, mediaUrls: newMediaUrls });
    }
  };

  const getPlatformIcon = () => {
    switch (editedPost?.platform) {
      case 'facebook': return '📘';
      case 'twitter': return '🐦';
      case 'instagram': return '📷';
      case 'linkedin': return '💼';
      case 'tiktok': return '🎵';
      default: return '📱';
    }
  };

  const getCharacterLimit = () => {
    switch (editedPost?.platform) {
      case 'twitter': return 280;
      case 'facebook': return 63206;
      case 'instagram': return 2200;
      case 'linkedin': return 3000;
      case 'tiktok': return 150;
      default: return 2000;
    }
  };

  if (!isOpen || !editedPost) return null;

  return (
    <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
      >
          <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-dark-card border border-dark-border rounded-xl shadow-elevation-3 w-full max-w-6xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <div className="flex items-center gap-3">
              <div className="text-2xl">{getPlatformIcon()}</div>
              <div>
                <h2 className="text-xl font-semibold text-white">Edit Post</h2>
                <p className="text-white/60 text-sm">
                  {editedPost.platform.charAt(0).toUpperCase() + editedPost.platform.slice(1)} • 
                  {editedPost.campaignName ? ` ${editedPost.campaignName}` : ''}
                </p>
              </div>
            </div>
              <button
                onClick={onClose}
              className="p-2 rounded-lg hover:bg-dark-lighter transition-colors"
              >
              <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Content */}
          <div className="flex h-[calc(90vh-120px)]">
            {/* Left Panel - Post Details */}
            <div className="w-1/2 p-6 overflow-y-auto border-r border-dark-border">
              <div className="space-y-6">
                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Post Content
                  </label>
                    <textarea
                      value={editedPost.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="What's on your mind?"
                    className={`w-full h-32 p-3 bg-dark-lighter border rounded-lg text-white placeholder-white/50 focus:border-primary focus:outline-none resize-none ${
                      errors.content ? 'border-red-500' : 'border-dark-border'
                    }`}
                    maxLength={getCharacterLimit()}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-white/60">
                      {editedPost.content.length}/{getCharacterLimit()} characters
                    </span>
                    {errors.content && (
                      <span className="text-xs text-red-400">{errors.content}</span>
                    )}
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editedPost.scheduledAt}
                    onChange={(e) => handleDateTimeChange(e.target.value)}
                    className={`w-full p-3 bg-dark-lighter border rounded-lg text-white focus:border-primary focus:outline-none ${
                      errors.scheduledAt ? 'border-red-500' : 'border-dark-border'
                    }`}
                  />
                  {errors.scheduledAt && (
                    <span className="text-xs text-red-400 mt-1 block">{errors.scheduledAt}</span>
                  )}
                </div>

                {/* Media URLs */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-white">Media URLs</label>
                    <button
                      onClick={addMediaUrl}
                      className="p-1 rounded hover:bg-dark-lighter transition-colors"
                    >
                      <Plus className="h-4 w-4 text-white" />
                    </button>
                  </div>
                    <div className="space-y-2">
                    {(editedPost.mediaUrls || []).map((url, index) => (
                      <div key={index} className="flex gap-2">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => updateMediaUrl(index, e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 p-2 bg-dark-lighter border border-dark-border rounded text-white text-sm"
                          />
                          <button
                            onClick={() => removeMediaUrl(index)}
                          className="p-2 rounded hover:bg-red-500/20 transition-colors"
                          >
                          <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                </div>

                {/* Meme Editor Toggle */}
                <div>
                  <button
                    onClick={() => setShowMemeEditor(!showMemeEditor)}
                    className="w-full btn btn-secondary inline-flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    {showMemeEditor ? 'Hide Meme Editor' : 'Show Meme Editor'}
                  </button>
                </div>

                {/* Meme Editor */}
                {showMemeEditor && (
                  <div className="space-y-4 p-4 bg-dark-lighter rounded-lg border border-dark-border">
                    <h3 className="text-lg font-semibold text-white">Meme Editor</h3>
                    
                    {/* Image Generation */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Generate AI Image
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Describe the image you want..."
                          className="flex-1 p-2 bg-dark-card border border-dark-border rounded text-white text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const prompt = e.currentTarget.value;
                              if (prompt) {
                                handleGenerateImage(prompt);
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            const input = document.querySelector('input[placeholder*="Describe"]') as HTMLInputElement;
                            const prompt = input?.value;
                            if (prompt) {
                              handleGenerateImage(prompt);
                              input.value = '';
                            }
                          }}
                          disabled={generating}
                          className="px-3 py-2 bg-primary hover:bg-primary/80 disabled:opacity-50 rounded text-white text-sm"
                        >
                          {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="w-full btn btn-secondary inline-flex items-center gap-2 cursor-pointer">
                        <Upload className="h-4 w-4" />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Text Overlays */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-white">Text Overlays</label>
                        <button
                          onClick={addTextOverlay}
                          className="p-1 rounded hover:bg-dark-lighter transition-colors"
                        >
                          <Plus className="h-4 w-4 text-white" />
                        </button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {textOverlays.map((overlay) => (
                          <div
                            key={overlay.id}
                            className={`p-2 rounded border cursor-pointer transition-all ${
                              selectedOverlay === overlay.id
                                ? 'border-primary bg-primary/10'
                                : 'border-dark-border bg-dark-card hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedOverlay(overlay.id)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white truncate">
                                {overlay.text.substring(0, 20)}...
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateTextOverlay(overlay.id, { isVisible: !overlay.isVisible });
                                  }}
                                  className="p-1 rounded hover:bg-dark-border"
                                >
                                  {overlay.isVisible ? (
                                    <Eye className="h-3 w-3 text-white" />
                                  ) : (
                                    <EyeOff className="h-3 w-3 text-white/50" />
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeTextOverlay(overlay.id);
                                  }}
                                  className="p-1 rounded hover:bg-red-500/20"
                                >
                                  <Trash2 className="h-3 w-3 text-red-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Selected Overlay Controls */}
                    {selectedOverlay && (
                      <div className="p-3 bg-dark-card rounded border border-dark-border">
                        <h4 className="text-sm font-medium text-white mb-2">Edit Text</h4>
                        <textarea
                          value={textOverlays.find(o => o.id === selectedOverlay)?.text || ''}
                          onChange={(e) => updateTextOverlay(selectedOverlay, { text: e.target.value })}
                          className="w-full p-2 bg-dark-lighter border border-dark-border rounded text-white text-sm resize-none mb-2"
                          rows={2}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="range"
                            min="12"
                            max="120"
                            value={textOverlays.find(o => o.id === selectedOverlay)?.fontSize || 48}
                            onChange={(e) => updateTextOverlay(selectedOverlay, { fontSize: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <select
                            value={textOverlays.find(o => o.id === selectedOverlay)?.fontFamily || ''}
                            onChange={(e) => updateTextOverlay(selectedOverlay, { fontFamily: e.target.value })}
                            className="w-full p-1 bg-dark-lighter border border-dark-border rounded text-white text-xs"
                          >
                            {fontFamilies.map((font) => (
                              <option key={font.value} value={font.value}>
                                {font.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Capture Button */}
                    {selectedImage && textOverlays.length > 0 && (
                      <button
                        onClick={handleCaptureMeme}
                        disabled={isCapturing}
                        className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        {isCapturing ? 'Capturing...' : 'Capture Meme'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="w-1/2 p-6 overflow-y-auto">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Preview</h3>
                
                {/* Meme Canvas */}
                {showMemeEditor && (
                  <div className="bg-dark-lighter rounded-lg p-4 border border-dark-border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-white">Meme Canvas</h4>
                      {selectedImage && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/60">Scale:</span>
                          <input
                            type="range"
                            min="0.1"
                            max="3"
                            step="0.1"
                            value={imagePosition.scale}
                            onChange={(e) => setImagePosition(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                            className="w-16"
                          />
                          <span className="text-xs text-white/60 w-8">{imagePosition.scale.toFixed(1)}x</span>
                          <button
                            onClick={resetCanvas}
                            className="p-1 rounded hover:bg-dark-border"
                            title="Reset Canvas"
                          >
                            <RotateCcw className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Canvas Area */}
                    <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '1/1' }}>
                      {!selectedImage ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-3">
                              <Image className="h-6 w-6 text-primary" />
                            </div>
                            <h4 className="text-sm font-semibold text-white mb-1">No Image</h4>
                            <p className="text-white/60 text-xs">Generate or upload an image to start</p>
                          </div>
                        </div>
                      ) : (
                        <div
                          ref={canvasRef}
                          className="relative w-full h-full overflow-hidden"
                          style={{ cursor: imageDragRef ? 'grabbing' : 'grab' }}
                          onMouseDown={handleImageMouseDown}
                        >
                          {/* Background Image */}
                          <img
                            src={selectedImage}
                            alt="Generated content"
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{
                              transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imagePosition.scale})`,
                              cursor: imageDragRef ? 'grabbing' : 'grab'
                            }}
                            draggable={false}
                          />

                          {/* Text Overlays */}
                          {textOverlays.map((overlay) => (
                            overlay.isVisible && (
                              <div
                                key={overlay.id}
                                className={`absolute cursor-move select-none ${
                                  selectedOverlay === overlay.id ? 'ring-2 ring-primary ring-opacity-50' : ''
                                }`}
                                style={{
                                  left: overlay.x,
                                  top: overlay.y,
                                  width: overlay.width,
                                  height: overlay.height,
                                  transform: `rotate(${overlay.rotation}deg)`,
                                  backgroundColor: overlay.backgroundColor === 'transparent' ? 'transparent' : overlay.backgroundColor,
                                  opacity: overlay.backgroundOpacity,
                                  padding: '8px',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: overlay.textAlign === 'center' ? 'center' : overlay.textAlign === 'right' ? 'flex-end' : 'flex-start',
                                  minHeight: 'fit-content'
                                }}
                                onMouseDown={(e) => handleMouseDown(e, overlay.id)}
                              >
                                <div
                                  className="text-center w-full"
                                  style={{
                                    fontSize: overlay.fontSize,
                                    color: overlay.color,
                                    fontFamily: overlay.fontFamily,
                                    fontWeight: overlay.isBold ? 'bold' : 'normal',
                                    fontStyle: overlay.isItalic ? 'italic' : 'normal',
                                    textDecoration: overlay.isUnderline ? 'underline' : 'none',
                                    textAlign: overlay.textAlign,
                                    textShadow: `${overlay.strokeWidth}px ${overlay.strokeWidth}px ${overlay.strokeColor}`,
                                    lineHeight: '1.2',
                                    wordBreak: 'break-word',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: overlay.textAlign === 'center' ? 'center' : overlay.textAlign === 'right' ? 'flex-end' : 'flex-start',
                                    height: '100%'
                                  }}
                                >
                                  {overlay.text}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Post Preview */}
                <div className="bg-dark-lighter rounded-lg p-4 border border-dark-border">
                  <h4 className="text-sm font-medium text-white mb-3">Post Preview</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {editedPost.brandName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">{editedPost.brandName}</span>
                          <span className="text-white/60 text-sm">• {format(new Date(editedPost.scheduledAt), 'MMM d, yyyy')}</span>
                        </div>
                        <p className="text-white text-sm leading-relaxed">{editedPost.content}</p>
                        
                        {/* Media Preview */}
                        {editedPost.mediaUrls && editedPost.mediaUrls.length > 0 && (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {editedPost.mediaUrls.map((url, index) => (
                              url && (
                                <div key={index} className="aspect-square bg-dark-border rounded overflow-hidden">
                                  <img
                                    src={url}
                                    alt={`Media ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              </div>
              
          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-dark-border">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Clock className="h-4 w-4" />
              <span>
                Scheduled for {format(new Date(editedPost.scheduledAt), 'MMM d, yyyy \'at\' h:mm a')}
              </span>
            </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                className="px-4 py-2 rounded-lg border border-dark-border text-white hover:bg-dark-lighter transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                disabled={loading}
                className="btn btn-primary inline-flex items-center gap-2"
                >
                  {loading ? (
                    <>
                    <Loader2 className="h-4 w-4 animate-spin" />
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
      </motion.div>
    </AnimatePresence>
  );
};

export default PostEditModal;