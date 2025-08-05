'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Type, 
  Search, 
  Download, 
  Save,
  Upload,
  Image as ImageIcon,
  X,
  Plus,
  Edit3,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  Share2,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/provider';
import { createClient } from '../../../lib/supabase/client';
import AuthenticatedNavbar from '../../../components/layout/AuthenticatedNavbar';
import Footer from '../../../components/layout/Footer';
import ParticleBackground from '../../../components/ui/ParticleBackground';
import TokenCostDisplay from '../../../components/ui/TokenCostDisplay';

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

interface SearchResult {
  id: string;
  url: string;
  thumbnail: string;
  large: string;
  original: string;
  photographer: string;
  photographer_url: string;
  platform: string;
  width: number;
  height: number;
  alt: string;
}

interface ImagePosition {
  x: number;
  y: number;
  scale: number;
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
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#FF1744', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
  '#2196F3', '#03DAC6', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
  '#FF5722', '#795548', '#9E9E9E', '#607D8B', '#F44336',
  '#E57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB',
  '#64B5F6', '#4FC3F7', '#4DD0E1', '#4DB6AC', '#81C784',
  '#AED581', '#DCE775', '#FFF176', '#FFD54F', '#FFB74D',
  '#FF8A65', '#A1887F', '#E0E0E0', '#90A4AE', '#FFCDD2'
];

const backgroundColors = [
  'transparent', '#FFFFFF', '#000000', '#FF0000', '#00FF00', 
  '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', 
  '#800080', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#FF1744', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
  '#2196F3', '#03DAC6', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
  '#FF5722', '#795548', '#9E9E9E', '#607D8B', '#F44336',
  '#E57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB',
  '#64B5F6', '#4FC3F7', '#4DD0E1', '#4DB6AC', '#81C784',
  '#AED581', '#DCE775', '#FFF176', '#FFD54F', '#FFB74D',
  '#FF8A65', '#A1887F', '#E0E0E0', '#90A4AE', '#FFCDD2'
];

const MemeCreatorClient: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedImage, setSelectedImage] = useState<SearchResult | null>(null);
  const [imagePosition, setImagePosition] = useState<ImagePosition>({ x: 0, y: 0, scale: 1 });
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ overlayId: string; startX: number; startY: number; originalX: number; originalY: number } | null>(null);
  const imageDragRef = useRef<{ startX: number; startY: number; originalX: number; originalY: number } | null>(null);

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Oswald:wght@400;700&family=Bebas+Neue&family=Anton&family=Righteous&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // Check for meme concept from AI generator
  useEffect(() => {
    const storedMemeConcept = localStorage.getItem('memeConcept');
    if (storedMemeConcept) {
      try {
        const concept = JSON.parse(storedMemeConcept);
        
        // Set the image
        if (concept.imageUrl) {
          const uploadedImage: SearchResult = {
            id: 'ai-generated',
            url: concept.imageUrl,
            thumbnail: concept.imageUrl,
            large: concept.imageUrl,
            original: concept.imageUrl,
            photographer: 'AI Generated',
            photographer_url: '',
            platform: 'ai',
            width: 800,
            height: 600,
            alt: concept.originalDescription || 'AI Generated Image'
          };
          setSelectedImage(uploadedImage);
          setImagePosition({ x: 0, y: 0, scale: 1 });
        }

        // Add the suggested text overlay
        if (concept.textOverlay) {
          const newOverlay: TextOverlay = {
            id: Date.now().toString(),
            text: concept.textOverlay,
            x: concept.textPosition === 'top' ? 50 : concept.textPosition === 'center' ? 150 : 50,
            y: concept.textPosition === 'top' ? 50 : concept.textPosition === 'center' ? 200 : 300,
            fontSize: 48,
            color: '#FFFFFF',
            fontFamily: concept.fontStyle === 'impact' ? 'Impact, Charcoal, sans-serif' : 
                       concept.fontStyle === 'comic' ? '"Comic Sans MS", cursive, sans-serif' :
                       concept.fontStyle === 'bold' ? '"Arial Black", Gadget, sans-serif' :
                       'Impact, Charcoal, sans-serif',
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
          setTextOverlays([newOverlay]);
          setSelectedOverlay(newOverlay.id);
        }

        // Clear the stored concept
        localStorage.removeItem('memeConcept');
        toast.success('AI-generated meme concept loaded!');
      } catch (error) {
        console.error('Error parsing stored meme concept:', error);
        localStorage.removeItem('memeConcept');
      }
    }
  }, []);

  const addTextOverlay = () => {
    const newOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: 'Your Text Here',
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
    setTextOverlays([...textOverlays, newOverlay]);
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

  // Text drag functionality
  const handleMouseDown = useCallback((e: React.MouseEvent, overlayId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const overlay = textOverlays.find(o => o.id === overlayId);
    if (!overlay) return;

    setSelectedOverlay(overlayId);
    setIsDragging(true);
    
    dragRef.current = {
      overlayId,
      startX: e.clientX,
      startY: e.clientY,
      originalX: overlay.x,
      originalY: overlay.y
    };
  }, [textOverlays]);

  // Image drag functionality
  const handleImageMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDraggingImage(true);
    
    imageDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originalX: imagePosition.x,
      originalY: imagePosition.y
    };
  }, [imagePosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragRef.current && isDragging) {
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      updateTextOverlay(dragRef.current.overlayId, {
        x: dragRef.current.originalX + deltaX,
        y: dragRef.current.originalY + deltaY
      });
    }

    if (imageDragRef.current && isDraggingImage) {
      const deltaX = e.clientX - imageDragRef.current.startX;
      const deltaY = e.clientY - imageDragRef.current.startY;

      setImagePosition(prev => ({
        ...prev,
        x: imageDragRef.current!.originalX + deltaX,
        y: imageDragRef.current!.originalY + deltaY
      }));
    }
  }, [isDragging, isDraggingImage]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsDraggingImage(false);
    dragRef.current = null;
    imageDragRef.current = null;
  }, []);

  useEffect(() => {
    if (isDragging || isDraggingImage) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isDraggingImage, handleMouseMove, handleMouseUp]);

  const handleImageSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Not logged in");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/image-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          query: searchQuery,
          platform: 'all',
          page: 1,
          per_page: 20
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to search images');
      }

      setSearchResults(result.images || []);
      toast.success(`Found ${result.images?.length || 0} images`);
      
    } catch (error) {
      console.error('Error searching images:', error);
      toast.error('Failed to search images');
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const uploadedImage: SearchResult = {
          id: 'uploaded',
          url: e.target?.result as string,
          thumbnail: e.target?.result as string,
          large: e.target?.result as string,
          original: e.target?.result as string,
          photographer: 'You',
          photographer_url: '',
          platform: 'upload',
          width: 800,
          height: 600,
          alt: file.name
        };
        setSelectedImage(uploadedImage);
        setImagePosition({ x: 0, y: 0, scale: 1 });
        toast.success('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Direct canvas capture using html2canvas
  const captureCanvas = async (): Promise<string | null> => {
    if (!canvasRef.current || !selectedImage) return null;

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        width: canvasRef.current.offsetWidth,
        height: canvasRef.current.offsetHeight
      });

      return canvas.toDataURL('image/png', 0.9);
    } catch (error) {
      console.error('Error capturing canvas:', error);
      toast.error('Failed to capture image');
      return null;
    }
  };

  const handleCaptureMeme = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    if (textOverlays.length === 0) {
      toast.error('Please add at least one text overlay');
      return;
    }

    setIsCapturing(true);

    try {
      const capturedDataUrl = await captureCanvas();
      if (capturedDataUrl) {
        setCapturedImage(capturedDataUrl);
        toast.success('Meme captured successfully!');
      }
    } catch (error) {
      console.error('Error capturing meme:', error);
      toast.error('Failed to capture meme');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownload = async () => {
    if (!capturedImage) {
      toast.error('No meme to download');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = `meme-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started!');
    } catch (error) {
      console.error('Error downloading meme:', error);
      toast.error('Failed to download meme');
    }
  };

  const handleSaveToLibrary = async () => {
    if (!capturedImage || !user) {
      toast.error('Please capture the meme first and ensure you are logged in');
      return;
    }

    try {
      // Upload captured image to Supabase storage
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const fileName = `meme-${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-media')
        .upload(fileName, blob);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-media')
        .getPublicUrl(fileName);
      
      // Get user's brand info
      const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (brandsError) throw brandsError;
      
      const brandId = brands?.[0]?.id;
      
      // Save to generated_media_posts table (like original system)
      const { error: mediaError } = await supabase
        .from('generated_media_posts')
        .insert({
          brand_id: brandId,
          prompt: 'Custom Meme',
          content_type: 'meme',
          generated_image_url: publicUrl,
          image_description: 'Custom created meme',
          overlay_text: textOverlays?.[0]?.text || null,
          overlay_options: JSON.stringify(textOverlays)
        });
      
      if (mediaError) throw mediaError;
      
      toast.success('Meme saved to library!');
    } catch (error) {
      console.error('Error saving meme:', error);
      toast.error('Failed to save meme');
    }
  };

  const handleCreatePost = async () => {
    if (!capturedImage || !user) {
      toast.error('Please capture the meme first and ensure you are logged in');
      return;
    }
    
    try {
      // Upload captured image to Supabase storage
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const fileName = `meme-${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-media')
        .upload(fileName, blob);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-media')
        .getPublicUrl(fileName);
      
      // Get user's brand info
      const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (brandsError) throw brandsError;
      
      const brandId = brands?.[0]?.id;
      
      // Save to generated_media_posts table (like original system)
      const { error: mediaError } = await supabase
        .from('generated_media_posts')
        .insert({
          brand_id: brandId,
          prompt: 'Custom Meme',
          content_type: 'meme',
          generated_image_url: publicUrl,
          image_description: 'Custom created meme',
          overlay_text: textOverlays?.[0]?.text || null,
          overlay_options: JSON.stringify(textOverlays)
        });
      
      if (mediaError) throw mediaError;
      
      toast.success('Meme saved to library!');
      
    } catch (error) {
      console.error('Error saving meme:', error);
      toast.error('Failed to save meme');
    }
  };

  const handleShare = async () => {
    if (!capturedImage) {
      toast.error('No meme to share');
      return;
    }

    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      if (navigator.share) {
        const file = new File([blob], 'meme.png', { type: 'image/png' });
        await navigator.share({
          title: 'My Meme',
          text: 'Check out this meme I created!',
          files: [file]
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText('Check out my meme!');
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing meme:', error);
      toast.error('Failed to share meme');
    }
  };

  const resetCanvas = () => {
    setTextOverlays([]);
    setSelectedOverlay(null);
    setCapturedImage(null);
    setImagePosition({ x: 0, y: 0, scale: 1 });
    toast.success('Canvas reset!');
  };

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <ParticleBackground />
      
      {/* Navigation */}
      <AuthenticatedNavbar
        onLogout={() => {}}
        userEmail={user?.email}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/tools')}
              className="btn btn-secondary inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tools
            </button>
            
            <div className="flex-1">
              <h1 className="text-3xl font-display font-bold mb-2">
                Meme Creator
              </h1>
              <p className="text-white/70">
                Create hilarious memes with drag-and-drop text overlays and image positioning
              </p>
            </div>

            <TokenCostDisplay />
          </div>

          {/* Main Toolbar */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-4 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Left Section - Image Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search images..."
                    className="bg-dark-lighter border border-dark-border rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-40"
                    onKeyPress={(e) => e.key === 'Enter' && handleImageSearch()}
                  />
                  <button
                    onClick={handleImageSearch}
                    disabled={isSearching}
                    className="btn btn-primary btn-sm disabled:opacity-50"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </div>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary btn-sm inline-flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Center Section - Text Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={addTextOverlay}
                  className="btn btn-primary btn-sm inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Text
                </button>
                
                <button
                  onClick={resetCanvas}
                  className="btn btn-secondary btn-sm inline-flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>

              {/* Right Section - Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCaptureMeme}
                  disabled={!selectedImage || textOverlays.length === 0 || isCapturing}
                  className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  {isCapturing ? 'Capturing...' : 'Capture'}
                </button>
                
                {capturedImage && (
                  <>
                    <button
                      onClick={handleDownload}
                      className="btn btn-secondary btn-sm inline-flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                    <button
                      onClick={handleSaveToLibrary}
                      className="btn btn-secondary btn-sm inline-flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Contextual Text Editing Toolbar - Appears when text is selected */}
          {selectedOverlay && (() => {
            const overlay = textOverlays.find(o => o.id === selectedOverlay);
            if (!overlay) return null;

            return (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-dark-card border border-primary/50 rounded-xl p-4 mb-8"
              >
                <div className="flex flex-wrap items-center gap-6">
                  {/* Text Input */}
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-secondary" />
                    <input
                      type="text"
                      value={overlay.text}
                      onChange={(e) => updateTextOverlay(overlay.id, { text: e.target.value })}
                      className="bg-dark-lighter border border-dark-border rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-32"
                      placeholder="Enter text..."
                    />
                  </div>

                  {/* Font Family */}
                  <select
                    value={overlay.fontFamily}
                    onChange={(e) => updateTextOverlay(overlay.id, { fontFamily: e.target.value })}
                    className="bg-dark-lighter border border-dark-border rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {fontFamilies.map(font => (
                      <option key={font.value} value={font.value}>{font.name}</option>
                    ))}
                  </select>

                  {/* Font Size */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/60">{overlay.fontSize}px</span>
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={overlay.fontSize}
                      onChange={(e) => updateTextOverlay(overlay.id, { fontSize: parseInt(e.target.value) })}
                      className="w-16"
                    />
                  </div>

                  {/* Text Formatting */}
                  <div className="flex items-center border border-dark-border rounded-lg">
                    <button
                      onClick={() => updateTextOverlay(overlay.id, { isBold: !overlay.isBold })}
                      className={`p-1.5 border-r border-dark-border ${overlay.isBold ? 'bg-primary text-white' : 'text-white/70 hover:text-white'}`}
                    >
                      <Bold className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => updateTextOverlay(overlay.id, { isItalic: !overlay.isItalic })}
                      className={`p-1.5 border-r border-dark-border ${overlay.isItalic ? 'bg-primary text-white' : 'text-white/70 hover:text-white'}`}
                    >
                      <Italic className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => updateTextOverlay(overlay.id, { isUnderline: !overlay.isUnderline })}
                      className={`p-1.5 ${overlay.isUnderline ? 'bg-primary text-white' : 'text-white/70 hover:text-white'}`}
                    >
                      <Underline className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Text Alignment */}
                  <div className="flex items-center border border-dark-border rounded-lg">
                    <button
                      onClick={() => updateTextOverlay(overlay.id, { textAlign: 'left' })}
                      className={`p-1.5 border-r border-dark-border ${overlay.textAlign === 'left' ? 'bg-primary text-white' : 'text-white/70 hover:text-white'}`}
                    >
                      <AlignLeft className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => updateTextOverlay(overlay.id, { textAlign: 'center' })}
                      className={`p-1.5 border-r border-dark-border ${overlay.textAlign === 'center' ? 'bg-primary text-white' : 'text-white/70 hover:text-white'}`}
                    >
                      <AlignCenter className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => updateTextOverlay(overlay.id, { textAlign: 'right' })}
                      className={`p-1.5 ${overlay.textAlign === 'right' ? 'bg-primary text-white' : 'text-white/70 hover:text-white'}`}
                    >
                      <AlignRight className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Color Pickers - Simplified */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/60">Colors:</span>
                    {/* Text Color */}
                    <div className="relative group">
                      <button
                        className="w-6 h-6 rounded border-2 border-white/30 hover:border-white/60"
                        style={{ backgroundColor: overlay.color }}
                        title="Text Color"
                      />
                      <div className="absolute top-8 left-0 hidden group-hover:block bg-dark-card border border-dark-border rounded-lg p-2 z-50">
                        <div className="grid grid-cols-6 gap-1 w-32">
                          {colors.slice(0, 12).map(color => (
                            <button
                              key={color}
                              onClick={() => updateTextOverlay(overlay.id, { color })}
                              className="w-4 h-4 rounded border border-dark-border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Stroke Color */}
                    <div className="relative group">
                      <button
                        className="w-6 h-6 rounded border-2 border-white/30 hover:border-white/60"
                        style={{ backgroundColor: overlay.strokeColor }}
                        title="Stroke Color"
                      />
                      <div className="absolute top-8 left-0 hidden group-hover:block bg-dark-card border border-dark-border rounded-lg p-2 z-50">
                        <div className="grid grid-cols-6 gap-1 w-32">
                          {colors.slice(0, 12).map(color => (
                            <button
                              key={color}
                              onClick={() => updateTextOverlay(overlay.id, { strokeColor: color })}
                              className="w-4 h-4 rounded border border-dark-border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => updateTextOverlay(overlay.id, { isVisible: !overlay.isVisible })}
                      className={`p-1.5 rounded ${overlay.isVisible ? 'text-white' : 'text-white/50'}`}
                      title={overlay.isVisible ? 'Hide' : 'Show'}
                    >
                      {overlay.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => removeTextOverlay(overlay.id)}
                      className="p-1.5 rounded text-red-400 hover:bg-red-500/20"
                      title="Delete"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Find Images */}
            <div className="space-y-6">
              {/* Image Search Results */}
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Find Images
                </h2>
                
                {/* Search Results */}
                {searchResults.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium text-white/70 mb-2">Search Results</h3>
                    <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                      {searchResults.map((image) => (
                        <motion.div
                          key={image.id}
                          whileHover={{ scale: 1.05 }}
                          className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                            selectedImage?.id === image.id
                              ? 'border-primary'
                              : 'border-dark-border hover:border-primary/50'
                          }`}
                          onClick={() => {
                            setSelectedImage(image);
                            setImagePosition({ x: 0, y: 0, scale: 1 });
                          }}
                        >
                          <img
                            src={image.thumbnail}
                            alt={image.alt}
                            className="w-full h-24 object-cover"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/60">
                    <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Search for images or upload your own</p>
                  </div>
                )}

                {/* Text Overlays List */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Type className="h-5 w-5 text-secondary" />
                    Text Overlays
                  </h3>
                  
                  <div className="space-y-3">
                    {textOverlays.map((overlay) => (
                      <div
                        key={overlay.id}
                        className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                          selectedOverlay === overlay.id
                            ? 'border-primary bg-primary/10'
                            : 'border-dark-border bg-dark-lighter hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedOverlay(overlay.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white truncate">
                            {overlay.text}
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
                              <X className="h-3 w-3 text-red-400" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-white/60">
                          {overlay.fontSize}px • {fontFamilies.find(f => f.value === overlay.fontFamily)?.name || overlay.fontFamily}
                        </div>
                      </div>
                    ))}
                    
                    {textOverlays.length === 0 && (
                      <div className="text-center py-4 text-white/60">
                        <Type className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No text overlays yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Center Panel - Canvas */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Canvas
              </h2>

              <div className="relative bg-dark-lighter rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                {selectedImage ? (
                  <div
                    ref={canvasRef}
                    className="relative w-full h-full cursor-move"
                    onMouseDown={handleImageMouseDown}
                  >
                    {/* Background Image */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${selectedImage.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imagePosition.scale})`,
                        transition: isDraggingImage ? 'none' : 'transform 0.1s ease-out'
                      }}
                    />
                    
                    {/* Text Overlays */}
                    {textOverlays.filter(o => o.isVisible).map((overlay) => (
                      <div
                        key={overlay.id}
                        className={`absolute cursor-move select-none ${
                          selectedOverlay === overlay.id ? 'ring-2 ring-primary ring-opacity-50' : ''
                        }`}
                        style={{
                          left: `${overlay.x}px`,
                          top: `${overlay.y}px`,
                          width: `${overlay.width}px`,
                          height: `${overlay.height}px`,
                          fontSize: `${overlay.fontSize}px`,
                          color: overlay.color,
                          fontFamily: overlay.fontFamily,
                          fontWeight: overlay.isBold ? 'bold' : 'normal',
                          fontStyle: overlay.isItalic ? 'italic' : 'normal',
                          textDecoration: overlay.isUnderline ? 'underline' : 'none',
                          textAlign: overlay.textAlign,
                          textShadow: `${overlay.strokeWidth}px ${overlay.strokeWidth}px ${overlay.strokeWidth * 2}px ${overlay.strokeColor}`,
                          transform: `rotate(${overlay.rotation}deg)`,
                          transformOrigin: 'center',
                          backgroundColor: overlay.backgroundColor === 'transparent' ? 'transparent' : overlay.backgroundColor,
                          opacity: overlay.backgroundOpacity,
                          padding: '8px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: overlay.textAlign === 'center' ? 'center' : overlay.textAlign === 'right' ? 'flex-end' : 'flex-start'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, overlay.id)}
                        onClick={() => setSelectedOverlay(overlay.id)}
                      >
                        {overlay.text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/60">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Select an image to start creating your meme</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Position Controls */}
              {selectedImage && (
                <div className="mt-4 p-4 bg-dark-lighter rounded-lg">
                  <h3 className="text-sm font-medium text-white/70 mb-3">Image Position</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Scale: {Math.round(imagePosition.scale * 100)}%</label>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={imagePosition.scale}
                        onChange={(e) => setImagePosition(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setImagePosition({ x: 0, y: 0, scale: 1 })}
                        className="btn btn-secondary btn-xs"
                      >
                        Reset Position
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Your Meme & Text Properties */}
            <div className="space-y-6">
              {/* Your Meme */}
              {capturedImage ? (
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Your Meme
                  </h2>

                  <div className="space-y-4">
                    <img
                      src={capturedImage}
                      alt="Generated meme"
                      className="w-full rounded-lg"
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={handleDownload}
                        className="flex-1 btn btn-primary btn-sm inline-flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                      <button
                        onClick={handleSaveToLibrary}
                        className="flex-1 btn btn-primary btn-sm inline-flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                    </div>
                    
                    <button
                      onClick={handleShare}
                      className="w-full btn btn-secondary btn-sm inline-flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Your Meme
                  </h2>
                  
                  <div className="text-center py-12 text-white/60">
                    <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No meme captured yet</p>
                    <p className="text-sm">Add an image and text, then click capture</p>
                  </div>
                </div>
              )}

              {/* Advanced Text Properties */}
              {selectedOverlay && (
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-secondary" />
                    Advanced Properties
                  </h2>

                  {(() => {
                    const overlay = textOverlays.find(o => o.id === selectedOverlay);
                    if (!overlay) return null;

                    return (
                      <div className="space-y-4">
                        <p className="text-sm text-white/60 mb-4">
                          Use the toolbar above for basic editing. Advanced controls below.
                        </p>

                        {/* Text Box Dimensions */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                              Width: {overlay.width}px
                            </label>
                            <input
                              type="range"
                              min="50"
                              max="600"
                              value={overlay.width}
                              onChange={(e) => updateTextOverlay(overlay.id, { width: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                              Height: {overlay.height}px
                            </label>
                            <input
                              type="range"
                              min="30"
                              max="300"
                              value={overlay.height}
                              onChange={(e) => updateTextOverlay(overlay.id, { height: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                        </div>

                        {/* Rotation */}
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Rotation: {overlay.rotation}°
                          </label>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={overlay.rotation}
                            onChange={(e) => updateTextOverlay(overlay.id, { rotation: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        {/* Stroke Width */}
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Stroke Width: {overlay.strokeWidth}px
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={overlay.strokeWidth}
                            onChange={(e) => updateTextOverlay(overlay.id, { strokeWidth: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        {/* Background Opacity */}
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Background Opacity: {Math.round(overlay.backgroundOpacity * 100)}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={overlay.backgroundOpacity}
                            onChange={(e) => updateTextOverlay(overlay.id, { backgroundOpacity: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        {/* Position Fine-tuning */}
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Position Fine-tuning
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-xs text-white/60">X: {overlay.x}px</span>
                              <input
                                type="range"
                                min="0"
                                max="800"
                                value={overlay.x}
                                onChange={(e) => updateTextOverlay(overlay.id, { x: parseInt(e.target.value) })}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <span className="text-xs text-white/60">Y: {overlay.y}px</span>
                              <input
                                type="range"
                                min="0"
                                max="600"
                                value={overlay.y}
                                onChange={(e) => updateTextOverlay(overlay.id, { y: parseInt(e.target.value) })}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MemeCreatorClient;