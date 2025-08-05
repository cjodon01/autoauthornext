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
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
];

const backgroundColors = [
  'transparent', '#FFFFFF', '#000000', '#FF0000', '#00FF00', 
  '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', 
  '#800080', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
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
    if (!capturedImage) {
      toast.error('No meme to save');
      return;
    }

    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Upload to Supabase storage
      const fileName = `memes/${user?.id}/${Date.now()}.png`;
      const { data, error } = await supabase.storage
        .from('user-media')
        .upload(fileName, blob, {
          contentType: 'image/png',
          cacheControl: '3600'
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-media')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('user_media')
        .insert({
          user_id: user?.id,
          file_name: fileName,
          file_url: publicUrl,
          media_type: 'image',
          title: `Meme ${new Date().toLocaleDateString()}`,
          description: 'Generated meme',
          tags: ['meme', 'generated']
        });

      if (dbError) throw dbError;

      toast.success('Saved to your media library!');
    } catch (error) {
      console.error('Error saving to library:', error);
      toast.error('Failed to save to library');
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Image Search & Selection */}
            <div className="space-y-6">
              {/* Image Search */}
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Find Images
                </h2>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for images..."
                      className="flex-1 bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      onKeyPress={(e) => e.key === 'Enter' && handleImageSearch()}
                    />
                    <button
                      onClick={handleImageSearch}
                      disabled={isSearching}
                      className="btn btn-primary disabled:opacity-50"
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </div>

                  <div className="flex gap-2">
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
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-white/70 mb-2">Search Results</h3>
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
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
                            className="w-full h-20 object-cover"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Text Overlays */}
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Type className="h-5 w-5 text-secondary" />
                    Text Overlays
                  </h2>
                  <button
                    onClick={addTextOverlay}
                    className="btn btn-primary btn-sm inline-flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Text
                  </button>
                </div>

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
                </div>
              </div>
            </div>

            {/* Center Panel - Canvas */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Canvas
                </h2>
                <button
                  onClick={resetCanvas}
                  className="btn btn-secondary btn-sm inline-flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>

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
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleCaptureMeme}
                  disabled={!selectedImage || textOverlays.length === 0 || isCapturing}
                  className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  {isCapturing ? 'Capturing...' : 'Capture Meme'}
                </button>
                
                {capturedImage && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 btn btn-secondary btn-sm inline-flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 btn btn-secondary btn-sm inline-flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Text Editor & Captured Image */}
            <div className="space-y-6">
              {/* Text Properties */}
              {selectedOverlay && (
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-secondary" />
                    Text Properties
                  </h2>

                  {(() => {
                    const overlay = textOverlays.find(o => o.id === selectedOverlay);
                    if (!overlay) return null;

                    return (
                      <div className="space-y-4">
                        {/* Text Content */}
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Text
                          </label>
                          <textarea
                            value={overlay.text}
                            onChange={(e) => updateTextOverlay(overlay.id, { text: e.target.value })}
                            className="w-full bg-dark-lighter border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 h-20"
                            placeholder="Enter your text..."
                          />
                        </div>

                        {/* Font Size */}
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Font Size: {overlay.fontSize}px
                          </label>
                          <input
                            type="range"
                            min="12"
                            max="120"
                            value={overlay.fontSize}
                            onChange={(e) => updateTextOverlay(overlay.id, { fontSize: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        {/* Text Box Size */}
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

                        {/* Font Family */}
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Font Family
                          </label>
                          <select
                            value={overlay.fontFamily}
                            onChange={(e) => updateTextOverlay(overlay.id, { fontFamily: e.target.value })}
                            className="w-full bg-dark-lighter border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            {fontFamilies.map(font => (
                              <option key={font.value} value={font.value}>{font.name}</option>
                            ))}
                          </select>
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

                        {/* Background Color */}
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Background Color
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {backgroundColors.map(color => (
                              <button
                                key={color}
                                onClick={() => updateTextOverlay(overlay.id, { backgroundColor: color })}
                                className={`w-8 h-8 rounded border-2 transition-colors ${
                                  overlay.backgroundColor === color ? 'border-white' : 'border-dark-border'
                                }`}
                                style={{ 
                                  backgroundColor: color === 'transparent' ? 'rgba(0,0,0,0.3)' : color,
                                  backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                                  backgroundSize: '4px 4px'
                                }}
                              />
                            ))}
                          </div>
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

                        {/* Text Color */}
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Text Color
                          </label>
                          <div className="grid grid-cols-5 gap-2">
                            {colors.map(color => (
                              <button
                                key={color}
                                onClick={() => updateTextOverlay(overlay.id, { color })}
                                className={`w-8 h-8 rounded border-2 transition-colors ${
                                  overlay.color === color ? 'border-white' : 'border-dark-border'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Stroke Color */}
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Stroke Color
                          </label>
                          <div className="grid grid-cols-5 gap-2">
                            {colors.map(color => (
                              <button
                                key={color}
                                onClick={() => updateTextOverlay(overlay.id, { strokeColor: color })}
                                className={`w-8 h-8 rounded border-2 transition-colors ${
                                  overlay.strokeColor === color ? 'border-white' : 'border-dark-border'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
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

                        {/* Text Formatting */}
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Formatting
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateTextOverlay(overlay.id, { isBold: !overlay.isBold })}
                              className={`p-2 rounded ${overlay.isBold ? 'bg-primary text-white' : 'bg-dark-lighter text-white/70'}`}
                            >
                              <Bold className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateTextOverlay(overlay.id, { isItalic: !overlay.isItalic })}
                              className={`p-2 rounded ${overlay.isItalic ? 'bg-primary text-white' : 'bg-dark-lighter text-white/70'}`}
                            >
                              <Italic className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateTextOverlay(overlay.id, { isUnderline: !overlay.isUnderline })}
                              className={`p-2 rounded ${overlay.isUnderline ? 'bg-primary text-white' : 'bg-dark-lighter text-white/70'}`}
                            >
                              <Underline className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Text Alignment */}
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Alignment
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateTextOverlay(overlay.id, { textAlign: 'left' })}
                              className={`p-2 rounded ${overlay.textAlign === 'left' ? 'bg-primary text-white' : 'bg-dark-lighter text-white/70'}`}
                            >
                              <AlignLeft className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateTextOverlay(overlay.id, { textAlign: 'center' })}
                              className={`p-2 rounded ${overlay.textAlign === 'center' ? 'bg-primary text-white' : 'bg-dark-lighter text-white/70'}`}
                            >
                              <AlignCenter className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateTextOverlay(overlay.id, { textAlign: 'right' })}
                              className={`p-2 rounded ${overlay.textAlign === 'right' ? 'bg-primary text-white' : 'bg-dark-lighter text-white/70'}`}
                            >
                              <AlignRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Captured Meme */}
              {capturedImage && (
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
                        className="flex-1 btn btn-secondary btn-sm inline-flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default MemeCreatorClient; 