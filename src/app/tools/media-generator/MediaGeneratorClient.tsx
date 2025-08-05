'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Sparkles, 
  Type,
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
  RotateCcw,
  Zap,
  RefreshCw
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

interface MemeConcept {
  imagePrompt: string;
  textOverlay: string;
  fontStyle: string;
  textPosition: string;
  explanation: string;
  originalDescription: string;
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
  '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'
];

const MediaGeneratorClient: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  // Form state
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [size, setSize] = useState('1024x1024');
  const [generating, setGenerating] = useState(false);
  const [generatingConcept, setGeneratingConcept] = useState(false);
  
  // Canvas state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState<ImagePosition>({ x: 0, y: 0, scale: 1 });
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ overlayId: string; startX: number; startY: number; originalX: number; originalY: number } | null>(null);
  const imageDragRef = useRef<{ startX: number; startY: number; originalX: number; originalY: number } | null>(null);

  const styles = [
    { id: 'realistic', name: 'Realistic', description: 'Photorealistic images' },
    { id: 'artistic', name: 'Artistic', description: 'Creative and artistic style' },
    { id: 'cartoon', name: 'Cartoon', description: 'Animated cartoon style' },
    { id: 'abstract', name: 'Abstract', description: 'Abstract and modern' },
    { id: 'vintage', name: 'Vintage', description: 'Retro and vintage look' },
    { id: 'minimalist', name: 'Minimalist', description: 'Clean and simple' }
  ];

  const sizes = [
    { id: '512x512', name: 'Square (512x512)', description: 'Perfect for social media' },
    { id: '1024x1024', name: 'Square (1024x1024)', description: 'High quality square' },
    { id: '1024x1792', name: 'Portrait (1024x1792)', description: 'Instagram stories' },
    { id: '1792x1024', name: 'Landscape (1792x1024)', description: 'Wide format' }
  ];

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Oswald:wght@400;700&family=Bebas+Neue&family=Anton&family=Righteous&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // Debug selectedImage state changes
  useEffect(() => {
    console.log('selectedImage state changed:', selectedImage);
  }, [selectedImage]);

  // Helper function to update text overlays
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

  const handleGenerateMemeConcept = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (!user) {
      toast.error("Please log in to generate meme concepts");
      return;
    }
    setGeneratingConcept(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Not logged in");
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-meme-generator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          description: prompt,
          style
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate meme concept');
      }
      
      // Generate the actual image using the AI prompt
      await handleGenerateImage(result.memeConcept.imagePrompt);
      
      // Add the AI-generated text overlay
      const newOverlay: TextOverlay = {
        id: Date.now().toString(),
        text: result.memeConcept.textOverlay,
        x: result.memeConcept.textPosition === 'top' ? 50 : result.memeConcept.textPosition === 'center' ? 150 : 50,
        y: result.memeConcept.textPosition === 'top' ? 50 : result.memeConcept.textPosition === 'center' ? 200 : 300,
        fontSize: 48,
        color: '#FFFFFF',
        fontFamily: result.memeConcept.fontStyle === 'impact' ? 'Impact, Charcoal, sans-serif' : 
                   result.memeConcept.fontStyle === 'comic' ? '"Comic Sans MS", cursive, sans-serif' :
                   result.memeConcept.fontStyle === 'bold' ? '"Arial Black", Gadget, sans-serif' :
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
      
      toast.success('AI meme generated! You can now edit the text and image.');
    } catch (error) {
      console.error('Error generating meme concept:', error);
      toast.error('Failed to generate meme concept');
    } finally {
      setGeneratingConcept(false);
    }
  };

  const handleGenerateImage = async (imagePrompt: string) => {
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
      console.log('Fetching brand for user:', user.id);
      const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      console.log('Brands result:', { brands, brandsError });

      if (brandsError) {
        console.error('Brand fetch error:', brandsError);
        throw new Error('Failed to fetch brand information');
      }

      if (!brands || brands.length === 0) {
        console.log('No brands found for user');
        toast.error("Please create a brand profile first");
        return;
      }

      const brandId = brands[0].id;
      console.log('Using brand ID:', brandId);
      
      const requestBody = {
        prompt: imagePrompt,
        brand_id: brandId,
        type: 'image'
      };
      
      console.log('Sending request to generate-media-content:', requestBody);

      // Call the generate-media-content edge function
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-media-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate image');
      }
      
      // Set the generated image - handle multiple possible response formats
      console.log('Response from generate-media-content:', result);
      let imageUrl = null;
      
      // Try different possible response formats
      if (result.generated_content?.imageUrl) {
        imageUrl = result.generated_content.imageUrl;
      } else if (result.imageUrl) {
        imageUrl = result.imageUrl;
      } else if (result.url) {
        imageUrl = result.url;
      } else if (result.data?.url) {
        imageUrl = result.data.url;
      } else if (result.data?.imageUrl) {
        imageUrl = result.data.imageUrl;
      }
      
      if (imageUrl) {
        console.log('Setting image URL:', imageUrl);
        setSelectedImage(imageUrl);
        setImagePosition({ x: 0, y: 0, scale: 1 });
      } else {
        console.error('No image URL found in response. Full response:', JSON.stringify(result, null, 2));
        throw new Error('No image URL in response. Check console for full response details.');
      }
      
      toast.success('Image generated successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
    } finally {
      setGenerating(false);
    }
  };

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

  const handleDownload = async () => {
    if (!capturedImage) {
      toast.error('Please capture the meme first');
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = `ai-meme-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Meme downloaded!');
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
      const fileName = `ai-meme-${Date.now()}.png`;
      
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
          prompt: prompt || 'AI Generated Meme',
          content_type: 'meme',
          generated_image_url: publicUrl,
          image_description: prompt,
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
          prompt: prompt || 'AI Generated Meme',
          content_type: 'meme',
          generated_image_url: publicUrl,
          image_description: prompt,
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
      toast.error('Please capture the meme first');
      return;
    }
    
    try {
      if (navigator.share) {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = new File([blob], 'ai-meme.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'AI Generated Meme',
          text: 'Check out this AI-generated meme!',
          files: [file]
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText('Check out my AI-generated meme!');
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing meme:', error);
      toast.error('Failed to share meme');
    }
  };

  const resetCanvas = () => {
    setSelectedImage(null);
    setTextOverlays([]);
    setSelectedOverlay(null);
    setImagePosition({ x: 0, y: 0, scale: 1 });
    setCapturedImage(null);
    setPrompt('');
  };

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <ParticleBackground />
      
      {/* Navigation */}
      <AuthenticatedNavbar
        onLogout={() => router.push('/')}
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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/tools')}
                className="p-2 rounded-lg bg-dark-card border border-dark-border hover:bg-dark-lighter transition-colors"
            >
                <ArrowLeft className="h-5 w-5 text-white" />
            </button>
              <div>
                <h1 className="text-3xl font-display font-bold text-white">
                  AI Media <span className="text-gradient">Generator</span>
              </h1>
                <p className="text-white/70">Generate AI images and create memes with AI-powered text overlays</p>
              </div>
            </div>

            <TokenCostDisplay />
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
            {/* Controls Panel */}
            <div className="lg:col-span-1 space-y-6">
              {/* Generation Controls */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-elevation-2">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                  Generate AI Content
              </h2>

                <div className="space-y-4">
                  {/* Description Input */}
                <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Description
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the image or meme you want to create..."
                      className="w-full h-24 p-3 bg-dark-lighter border border-dark-border rounded-lg text-white placeholder-white/50 focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                  {/* Style Selection */}
                <div>
                    <label className="block text-sm font-medium text-white mb-2">
                    Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {styles.map((styleOption) => (
                      <button
                        key={styleOption.id}
                        onClick={() => setStyle(styleOption.id)}
                        className={`p-2 rounded-lg border transition-all duration-200 text-left ${
                          style === styleOption.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-dark-border bg-dark-lighter text-white/70 hover:text-white hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium text-sm">{styleOption.name}</div>
                        <div className="text-xs opacity-60">{styleOption.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                  {/* Size Selection */}
                <div>
                    <label className="block text-sm font-medium text-white mb-2">
                    Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {sizes.map((sizeOption) => (
                      <button
                        key={sizeOption.id}
                        onClick={() => setSize(sizeOption.id)}
                        className={`p-2 rounded-lg border transition-all duration-200 text-left ${
                          size === sizeOption.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-dark-border bg-dark-lighter text-white/70 hover:text-white hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium text-sm">{sizeOption.name}</div>
                        <div className="text-xs opacity-60">{sizeOption.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                  {/* Generate AI Meme Button */}
                <button
                    onClick={handleGenerateMemeConcept}
                    disabled={!prompt.trim() || generatingConcept}
                  className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                    <Zap className="h-4 w-4" />
                    {generatingConcept ? 'Generating AI Meme...' : 'Generate AI Meme'}
                </button>

                                     {/* Upload Image Button */}
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

                   {/* Test URL Input */}
                   <div>
                     <label className="block text-sm font-medium text-white mb-2">
                       Test Image URL
                     </label>
                     <div className="flex gap-2">
                       <input
                         type="url"
                         placeholder="Enter image URL to test..."
                         className="flex-1 p-2 bg-dark-lighter border border-dark-border rounded text-white text-sm"
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             const url = e.currentTarget.value;
                             if (url) {
                               console.log('Testing image URL:', url);
                               setSelectedImage(url);
                               setImagePosition({ x: 0, y: 0, scale: 1 });
                             }
                           }
                         }}
                       />
                       <button
                         onClick={() => {
                           const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                           const url = input?.value;
                           if (url) {
                             console.log('Testing image URL:', url);
                             setSelectedImage(url);
                             setImagePosition({ x: 0, y: 0, scale: 1 });
                           }
                         }}
                         className="px-3 py-2 bg-primary hover:bg-primary/80 rounded text-white text-sm"
                       >
                         Load
                       </button>
                     </div>
                   </div>
              </div>
            </div>

              {/* Text Overlay Controls */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-elevation-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Text Overlays</h3>
                  <button
                    onClick={addTextOverlay}
                    className="p-2 rounded-lg bg-primary hover:bg-primary/80 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-white" />
                  </button>
                  </div>

                <div className="space-y-3">
                  {textOverlays.map((overlay) => (
                    <div
                      key={overlay.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedOverlay === overlay.id
                          ? 'border-primary bg-primary/10'
                          : 'border-dark-border bg-dark-lighter hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedOverlay(overlay.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white truncate">
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
                            <X className="h-3 w-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-white/60">
                        {fontFamilies.find(f => f.value === overlay.fontFamily)?.name || 'Custom'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Overlay Controls */}
                {selectedOverlay && (
                  <div className="mt-4 p-4 bg-dark-lighter rounded-lg border border-dark-border">
                    <h4 className="text-sm font-medium text-white mb-3">Edit Text Overlay</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-white/60 mb-1">Text</label>
                        <textarea
                          value={textOverlays.find(o => o.id === selectedOverlay)?.text || ''}
                          onChange={(e) => updateTextOverlay(selectedOverlay, { text: e.target.value })}
                          className="w-full p-2 bg-dark-card border border-dark-border rounded text-white text-sm resize-none"
                          rows={2}
                        />
            </div>

                      <div>
                        <label className="block text-xs text-white/60 mb-1">Font Size</label>
                        <input
                          type="range"
                          min="12"
                          max="120"
                          value={textOverlays.find(o => o.id === selectedOverlay)?.fontSize || 48}
                          onChange={(e) => updateTextOverlay(selectedOverlay, { fontSize: parseInt(e.target.value) })}
                          className="w-full"
                        />
          </div>

                      <div>
                        <label className="block text-xs text-white/60 mb-1">Font Family</label>
                        <select
                          value={textOverlays.find(o => o.id === selectedOverlay)?.fontFamily || ''}
                          onChange={(e) => updateTextOverlay(selectedOverlay, { fontFamily: e.target.value })}
                          className="w-full p-2 bg-dark-card border border-dark-border rounded text-white text-sm"
                        >
                          {fontFamilies.map((font) => (
                            <option key={font.value} value={font.value}>
                              {font.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-white/60 mb-1">Text Color</label>
                        <div className="grid grid-cols-5 gap-1">
                          {colors.map((color) => (
                            <button
                              key={color}
                              onClick={() => updateTextOverlay(selectedOverlay, { color })}
                              className={`w-6 h-6 rounded border-2 ${
                                textOverlays.find(o => o.id === selectedOverlay)?.color === color
                                  ? 'border-white'
                                  : 'border-dark-border'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
              </div>
                      </div>

                <div>
                        <label className="block text-xs text-white/60 mb-1">Stroke Color</label>
                        <div className="grid grid-cols-5 gap-1">
                          {colors.map((color) => (
                            <button
                              key={color}
                              onClick={() => updateTextOverlay(selectedOverlay, { strokeColor: color })}
                              className={`w-6 h-6 rounded border-2 ${
                                textOverlays.find(o => o.id === selectedOverlay)?.strokeColor === color
                                  ? 'border-white'
                                  : 'border-dark-border'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                </div>
                      </div>

                      <div>
                        <label className="block text-xs text-white/60 mb-1">Stroke Width</label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={textOverlays.find(o => o.id === selectedOverlay)?.strokeWidth || 2}
                          onChange={(e) => updateTextOverlay(selectedOverlay, { strokeWidth: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/60 mb-1">Rotation</label>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={textOverlays.find(o => o.id === selectedOverlay)?.rotation || 0}
                          onChange={(e) => updateTextOverlay(selectedOverlay, { rotation: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/60 mb-1">Width</label>
                        <input
                          type="range"
                          min="50"
                          max="800"
                          value={textOverlays.find(o => o.id === selectedOverlay)?.width || 300}
                          onChange={(e) => updateTextOverlay(selectedOverlay, { width: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                                             <div>
                         <label className="block text-xs text-white/60 mb-1">Height</label>
                         <input
                           type="range"
                           min="20"
                           max="400"
                           value={textOverlays.find(o => o.id === selectedOverlay)?.height || 100}
                           onChange={(e) => updateTextOverlay(selectedOverlay, { height: parseInt(e.target.value) })}
                           className="w-full"
                         />
                       </div>

                       {/* Text Position Controls */}
                       <div>
                         <label className="block text-xs text-white/60 mb-1">X Position</label>
                         <input
                           type="range"
                           min="0"
                           max="800"
                           value={textOverlays.find(o => o.id === selectedOverlay)?.x || 50}
                           onChange={(e) => updateTextOverlay(selectedOverlay, { x: parseInt(e.target.value) })}
                           className="w-full"
                         />
                       </div>

                       <div>
                         <label className="block text-xs text-white/60 mb-1">Y Position</label>
                         <input
                           type="range"
                           min="0"
                           max="600"
                           value={textOverlays.find(o => o.id === selectedOverlay)?.y || 50}
                           onChange={(e) => updateTextOverlay(selectedOverlay, { y: parseInt(e.target.value) })}
                           className="w-full"
                         />
                       </div>

                      <div>
                        <label className="block text-xs text-white/60 mb-1">Background Color</label>
                        <select
                          value={textOverlays.find(o => o.id === selectedOverlay)?.backgroundColor || 'transparent'}
                          onChange={(e) => updateTextOverlay(selectedOverlay, { backgroundColor: e.target.value })}
                          className="w-full p-2 bg-dark-card border border-dark-border rounded text-white text-sm"
                        >
                          {backgroundColors.map((color) => (
                            <option key={color} value={color}>
                              {color === 'transparent' ? 'Transparent' : color}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-white/60 mb-1">Background Opacity</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={textOverlays.find(o => o.id === selectedOverlay)?.backgroundOpacity || 0.8}
                          onChange={(e) => updateTextOverlay(selectedOverlay, { backgroundOpacity: parseFloat(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => updateTextOverlay(selectedOverlay, { isBold: !textOverlays.find(o => o.id === selectedOverlay)?.isBold })}
                          className={`p-2 rounded ${textOverlays.find(o => o.id === selectedOverlay)?.isBold ? 'bg-primary' : 'bg-dark-border'}`}
                        >
                          <Bold className="h-4 w-4 text-white" />
                        </button>
                        <button
                          onClick={() => updateTextOverlay(selectedOverlay, { isItalic: !textOverlays.find(o => o.id === selectedOverlay)?.isItalic })}
                          className={`p-2 rounded ${textOverlays.find(o => o.id === selectedOverlay)?.isItalic ? 'bg-primary' : 'bg-dark-border'}`}
                        >
                          <Italic className="h-4 w-4 text-white" />
                        </button>
                        <button
                          onClick={() => updateTextOverlay(selectedOverlay, { isUnderline: !textOverlays.find(o => o.id === selectedOverlay)?.isUnderline })}
                          className={`p-2 rounded ${textOverlays.find(o => o.id === selectedOverlay)?.isUnderline ? 'bg-primary' : 'bg-dark-border'}`}
                        >
                          <Underline className="h-4 w-4 text-white" />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => updateTextOverlay(selectedOverlay, { textAlign: 'left' })}
                          className={`p-2 rounded ${textOverlays.find(o => o.id === selectedOverlay)?.textAlign === 'left' ? 'bg-primary' : 'bg-dark-border'}`}
                        >
                          <AlignLeft className="h-4 w-4 text-white" />
                        </button>
                        <button
                          onClick={() => updateTextOverlay(selectedOverlay, { textAlign: 'center' })}
                          className={`p-2 rounded ${textOverlays.find(o => o.id === selectedOverlay)?.textAlign === 'center' ? 'bg-primary' : 'bg-dark-border'}`}
                        >
                          <AlignCenter className="h-4 w-4 text-white" />
                        </button>
                        <button
                          onClick={() => updateTextOverlay(selectedOverlay, { textAlign: 'right' })}
                          className={`p-2 rounded ${textOverlays.find(o => o.id === selectedOverlay)?.textAlign === 'right' ? 'bg-primary' : 'bg-dark-border'}`}
                        >
                          <AlignRight className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas */}
            <div className="lg:col-span-2">
              <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-elevation-2">
                                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                     <Type className="h-5 w-5 text-secondary" />
                     AI Meme Canvas
                   </h2>
                <div className="flex items-center gap-2">
                     {/* Image Scale Control */}
                     {selectedImage && (
                       <div className="flex items-center gap-2 bg-dark-lighter rounded-lg px-3 py-2">
                         <span className="text-xs text-white/60">Image Scale:</span>
                         <input
                           type="range"
                           min="0.1"
                           max="3"
                           step="0.1"
                           value={imagePosition.scale}
                           onChange={(e) => setImagePosition(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                           className="w-20"
                         />
                         <span className="text-xs text-white/60 w-8">{imagePosition.scale.toFixed(1)}x</span>
                       </div>
                     )}
                  <button
                       onClick={resetCanvas}
                       className="p-2 rounded-lg bg-dark-lighter hover:bg-dark-border transition-colors"
                       title="Reset Canvas"
                     >
                       <RotateCcw className="h-4 w-4 text-white" />
                     </button>
                    {capturedImage && (
                      <>
                        <button
                          onClick={handleDownload}
                    className="btn btn-primary btn-sm inline-flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                          onClick={handleShare}
                    className="btn btn-secondary btn-sm inline-flex items-center gap-2"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                                                                         <button
                          onClick={handleSaveToLibrary}
                          className="btn btn-primary btn-sm inline-flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                          Save to Library
                  </button>
                      </>
                    )}
                </div>
              </div>

                                 {/* Canvas Area */}
                 <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '1/1' }}>
                   {!selectedImage ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                       <div className="text-center">
                         <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                           <ImageIcon className="h-8 w-8 text-primary" />
                         </div>
                         <h3 className="text-lg font-semibold text-white mb-2">No Image Selected</h3>
                         <p className="text-white/60">Generate an AI image or upload your own to get started</p>
                       </div>
                     </div>
                                       ) : (
                    <div
                      ref={canvasRef}
                      className="relative w-full h-full overflow-hidden"
                      style={{ cursor: isDraggingImage ? 'grabbing' : 'grab' }}
                      onMouseDown={handleImageMouseDown}
                    >
                      {/* Background Image */}
                      <img
                        src={selectedImage}
                        alt="Generated content"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                          transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imagePosition.scale})`,
                          transition: isDraggingImage ? 'none' : 'transform 0.1s ease-out'
                        }}
                        draggable={false}
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
                  )}
                </div>

                {/* Capture Button */}
                {selectedImage && textOverlays.length > 0 && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleCaptureMeme}
                      disabled={isCapturing}
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      {isCapturing ? 'Capturing...' : 'Capture Meme'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MediaGeneratorClient; 