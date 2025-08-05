'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Sparkles, 
  Image, 
  Download, 
  RefreshCw,
  Settings,
  Palette,
  Type,
  Zap,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/provider';
import { createClient } from '../../../lib/supabase/client';
import AuthenticatedNavbar from '../../../components/layout/AuthenticatedNavbar';
import ParticleBackground from '../../../components/ui/ParticleBackground';
import TokenCostDisplay from '../../../components/ui/TokenCostDisplay';

interface GeneratedMedia {
  id: string;
  url: string;
  prompt: string;
  type: 'image' | 'meme';
  style: string;
  size: string;
  created_at: string;
}

interface MemeConcept {
  imagePrompt: string;
  textOverlay: string;
  fontStyle: string;
  textPosition: string;
  explanation: string;
  originalDescription: string;
}

const MediaGeneratorClient: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  // Form state
  const [prompt, setPrompt] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'meme'>('image');
  const [style, setStyle] = useState('realistic');
  const [size, setSize] = useState('1024x1024');
  const [generating, setGenerating] = useState(false);
  const [generatingConcept, setGeneratingConcept] = useState(false);
  
  // Generated media
  const [generatedMedia, setGeneratedMedia] = useState<GeneratedMedia[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<GeneratedMedia | null>(null);
  const [memeConcept, setMemeConcept] = useState<MemeConcept | null>(null);

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

  useEffect(() => {
    if (user) {
      fetchGeneratedMedia();
    }
  }, [user]);

  const fetchGeneratedMedia = async () => {
    if (!user) return;

    try {
      // For now, we'll use mock data
      // In production, this would fetch from a user_media table
      const mockMedia: GeneratedMedia[] = [
        {
          id: '1',
          url: 'https://via.placeholder.com/512x512/6366f1/ffffff?text=AI+Generated',
          prompt: 'A futuristic city skyline at sunset',
          type: 'image',
          style: 'realistic',
          size: '1024x1024',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          url: 'https://via.placeholder.com/512x512/f59e0b/ffffff?text=Funny+Meme',
          prompt: 'A cat wearing sunglasses',
          type: 'meme',
          style: 'cartoon',
          size: '512x512',
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      setGeneratedMedia(mockMedia);
    } catch (error) {
      console.error('Error fetching generated media:', error);
      toast.error('Failed to load generated media');
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

      // Call the AI meme generator edge function
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

      setMemeConcept(result.memeConcept);
      toast.success('Meme concept generated! Now generate the image.');
      
    } catch (error) {
      console.error('Error generating meme concept:', error);
      toast.error('Failed to generate meme concept');
    } finally {
      setGeneratingConcept(false);
    }
  };

  const handleGenerateMedia = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!user) {
      toast.error("Please log in to generate media");
      return;
    }

    setGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Not logged in");
        return;
      }

      // Use meme concept image prompt if available
      const finalPrompt = memeConcept?.imagePrompt || prompt;

      // Call the generate-media-content edge function
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-media-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          type: mediaType,
          style,
          size,
          user_id: user.id
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate media');
      }

      // Add the new media to the list
      const newMedia: GeneratedMedia = {
        id: Date.now().toString(),
        url: result.url || 'https://via.placeholder.com/512x512/10b981/ffffff?text=Generated',
        prompt: finalPrompt,
        type: mediaType,
        style,
        size,
        created_at: new Date().toISOString()
      };

      setGeneratedMedia(prev => [newMedia, ...prev]);
      setSelectedMedia(newMedia);
      toast.success('Media generated successfully!');
      
    } catch (error) {
      console.error('Error generating media:', error);
      toast.error('Failed to generate media');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (media: GeneratedMedia) => {
    try {
      const response = await fetch(media.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-media-${media.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch (error) {
      console.error('Error downloading media:', error);
      toast.error('Failed to download media');
    }
  };

  const handleSaveToLibrary = async (media: GeneratedMedia) => {
    try {
      // In production, this would save to the user_media table
      toast.success('Saved to your media library!');
    } catch (error) {
      console.error('Error saving to library:', error);
      toast.error('Failed to save to library');
    }
  };

  const handleCreateMeme = () => {
    if (!memeConcept || !selectedMedia) {
      toast.error('Please generate a meme concept and image first');
      return;
    }

    // Store the meme concept in localStorage for the meme creator
    localStorage.setItem('memeConcept', JSON.stringify({
      ...memeConcept,
      imageUrl: selectedMedia.url
    }));

    // Navigate to meme creator
    router.push('/tools/meme-creator');
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
                AI Media Generator
              </h1>
              <p className="text-white/70">
                Generate stunning images and memes using AI
              </p>
            </div>

            <TokenCostDisplay />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Generation Form */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-elevation-2">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Generate New Media
              </h2>

              <div className="space-y-6">
                {/* Media Type */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">
                    Media Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setMediaType('image')}
                      className={`p-3 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                        mediaType === 'image'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-dark-border bg-dark-lighter text-white/70 hover:text-white hover:border-primary/50'
                      }`}
                    >
                      <Image className="h-4 w-4" />
                      <span className="text-sm font-medium">Image</span>
                    </button>
                    <button
                      onClick={() => setMediaType('meme')}
                      className={`p-3 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                        mediaType === 'meme'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-dark-border bg-dark-lighter text-white/70 hover:text-white hover:border-primary/50'
                      }`}
                    >
                      <Type className="h-4 w-4" />
                      <span className="text-sm font-medium">Meme</span>
                    </button>
                  </div>
                </div>

                {/* Prompt */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 h-24"
                    placeholder={`Describe the ${mediaType} you want to generate...`}
                    required
                  />
                </div>

                {/* Style */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">
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

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">
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

                {/* AI Meme Concept Generation */}
                {mediaType === 'meme' && (
                  <div className="space-y-3">
                    <button
                      onClick={handleGenerateMemeConcept}
                      disabled={!prompt.trim() || generatingConcept}
                      className="w-full btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      {generatingConcept ? 'Generating Concept...' : 'Generate Meme Concept'}
                    </button>
                    
                    {memeConcept && (
                      <div className="p-4 bg-dark-lighter rounded-lg border border-dark-border">
                        <h4 className="text-sm font-medium text-white mb-2">Generated Concept:</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-white/60">Image Prompt:</span>
                            <p className="text-white">{memeConcept.imagePrompt}</p>
                          </div>
                          <div>
                            <span className="text-white/60">Text Overlay:</span>
                            <p className="text-white font-medium">{memeConcept.textOverlay}</p>
                          </div>
                          <div>
                            <span className="text-white/60">Style:</span>
                            <p className="text-white capitalize">{memeConcept.fontStyle}</p>
                          </div>
                          {memeConcept.explanation && (
                            <div>
                              <span className="text-white/60">Concept:</span>
                              <p className="text-white">{memeConcept.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerateMedia}
                  disabled={!prompt.trim() || generating}
                  className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {generating ? 'Generating...' : 'Generate Media'}
                </button>

                {/* Create Meme Button */}
                {mediaType === 'meme' && memeConcept && selectedMedia && (
                  <button
                    onClick={handleCreateMeme}
                    className="w-full btn btn-accent disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    <Type className="h-4 w-4" />
                    Create Meme in Editor
                  </button>
                )}
              </div>
            </div>

            {/* Generated Media */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-elevation-2">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Image className="h-5 w-5 text-secondary" />
                Generated Media
              </h2>

              {generatedMedia.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No Media Yet</h3>
                  <p className="text-white/60">Generate your first AI image or meme to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedMedia.map((media) => (
                    <motion.div
                      key={media.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                        selectedMedia?.id === media.id
                          ? 'border-primary bg-primary/10'
                          : 'border-dark-border bg-dark-lighter hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedMedia(media)}
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={media.url}
                          alt={media.prompt}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{media.prompt}</p>
                          <p className="text-white/60 text-xs">
                            {media.type} • {media.style} • {media.size}
                          </p>
                          <p className="text-white/40 text-xs">
                            {new Date(media.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(media);
                            }}
                            className="p-2 rounded-lg bg-dark-border hover:bg-primary/20 transition-colors"
                          >
                            <Download className="h-4 w-4 text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveToLibrary(media);
                            }}
                            className="p-2 rounded-lg bg-dark-border hover:bg-primary/20 transition-colors"
                          >
                            <Save className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Media Preview */}
          {selectedMedia && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-dark-card border border-dark-border rounded-xl p-6 shadow-elevation-2"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
              <div className="flex items-center justify-center">
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.prompt}
                  className="max-w-full max-h-96 rounded-lg shadow-elevation-2"
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{selectedMedia.prompt}</p>
                  <p className="text-white/60 text-sm">
                    {selectedMedia.type} • {selectedMedia.style} • {selectedMedia.size}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(selectedMedia)}
                    className="btn btn-primary btn-sm inline-flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={() => handleSaveToLibrary(selectedMedia)}
                    className="btn btn-secondary btn-sm inline-flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default MediaGeneratorClient; 