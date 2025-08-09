'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Facebook, 
  Twitter, 
  MessageSquare, 
  Linkedin, 
  Globe, 
  Sparkles, 
  Send, 
  Settings,
  Calendar,
  Clock,
  Zap,
  Eye,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/provider';
import { createClient } from '../../../lib/supabase/client';
import TokenCostDisplay from '../../../components/ui/TokenCostDisplay';
import PlatformPostPreview from '../../../components/social/PlatformPostPreview';
import { useAiModels } from '../../../hooks/useAiModels';
import AuthenticatedNavbar from '../../../components/layout/AuthenticatedNavbar';
import Footer from '../../../components/layout/Footer';
import ParticleBackground from '../../../components/ui/ParticleBackground';
import type { Database } from '../../../lib/supabase/types';

type SocialPage = Database['public']['Tables']['social_pages']['Row'];
type SocialConnection = Database['public']['Tables']['social_connections']['Row'];
type Brand = Database['public']['Tables']['brands']['Row'];

interface Platform {
  name: string;
  key: string;
  icon: React.ElementType;
  color: string;
}

interface GeneratedPost {
  id: number;
  content: string;
  title: string;
  tone: string;
}

const platforms: Platform[] = [
  { name: "Facebook", key: "facebook", icon: Facebook, color: "#1877F2" },
  { name: "Twitter", key: "twitter", icon: Twitter, color: "#1DA1F2" },
  { name: "Instagram", key: "instagram", icon: MessageSquare, color: "#E4405F" },
  { name: "LinkedIn", key: "linkedin", icon: Linkedin, color: "#0A66C2" },
  { name: "Reddit", key: "reddit", icon: MessageSquare, color: "#FF4500" },
  { name: "Website", key: "website", icon: Globe, color: "#00BFFF" },
];

const PostNowClient: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  // Step management
  const [currentStep, setCurrentStep] = useState<'input' | 'strategy' | 'select' | 'post'>('input');
  
  // Step 1: Input
  const [prompt, setPrompt] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  
  // Step 2: Strategy
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [includeImage, setIncludeImage] = useState(false);
  const [includeMeme, setIncludeMeme] = useState(false);
  
  // Step 3: AI Generation & Selection
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<GeneratedPost | null>(null);
  const [generating, setGenerating] = useState(false);
  
  // Step 4: Target Selection & Posting
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  
  // Data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [socialPages, setSocialPages] = useState<SocialPage[]>([]);
  const [socialConnections, setSocialConnections] = useState<SocialConnection[]>([]);
  const { aiModels, loading: modelsLoading } = useAiModels();

  useEffect(() => {
    if (user) {
      fetchBrands();
      fetchSocialData();
    }
  }, [user]);

  // Auto-select first AI model when models load
  useEffect(() => {
    if (aiModels.length > 0 && !selectedModelId) {
      setSelectedModelId(aiModels[0].id);
    }
  }, [aiModels, selectedModelId]);

  const fetchBrands = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrands(data || []);
      
      // Auto-select the first brand if available
      if (data && data.length > 0 && !selectedBrandId) {
        setSelectedBrandId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
    }
  };

  const fetchSocialData = async () => {
    if (!user) return;

    try {
      // Fetch social pages
      const { data: pages, error: pagesError } = await supabase
        .from('social_pages')
        .select('*')
        .eq('user_id', user.id);

      if (pagesError) throw pagesError;
      setSocialPages(pages || []);

      // Fetch social connections
      const { data: connections, error: connectionsError } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id);

      if (connectionsError) throw connectionsError;
      setSocialConnections(connections || []);
    } catch (error) {
      console.error('Error fetching social data:', error);
      toast.error('Failed to load connected accounts');
    }
  };

  const handleGeneratePosts = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }

    if (!selectedBrandId) {
      toast.error("Please select a brand");
      return;
    }

    setGenerating(true);

    try {
      // First, deduct tokens for post generation
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const deductResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/deductTokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_id: user?.id,
          task_type: 'post_now_text',
          platform_count: selectedPlatforms.length
        }),
      });

      if (!deductResponse.ok) {
        const error = await deductResponse.json();
        throw new Error(error.error || 'Failed to deduct tokens');
      }

      // Simplified content generation - create mock posts for now
      // In production, this would call the actual AI generation API
      const mockPosts: GeneratedPost[] = [
        {
          id: 1,
          content: `Generated content for: ${prompt}\n\nThis is a sample post that would be generated by AI based on your prompt and brand voice.`,
          title: "Post Option 1",
          tone: "professional"
        },
        {
          id: 2,
          content: `Alternative content for: ${prompt}\n\nThis is another variation of the AI-generated content with a different approach.`,
          title: "Post Option 2", 
          tone: "casual"
        },
        {
          id: 3,
          content: `Creative take on: ${prompt}\n\nThis version uses a more engaging and creative approach to deliver your message.`,
          title: "Post Option 3",
          tone: "engaging"
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGeneratedPosts(mockPosts);
      setCurrentStep('select');
    } catch (error) {
      console.error('Error generating posts:', error);
      toast.error('Failed to generate posts');
    } finally {
      setGenerating(false);
    }
  };

  const handlePostSelection = (post: GeneratedPost) => {
    setSelectedPost(post);
    setCurrentStep('post');
  };

  const handlePublishPost = async () => {
    if (!selectedPost) {
      toast.error("No post selected");
      return;
    }

    if (selectedTargets.length === 0) {
      toast.error("Please select at least one target");
      return;
    }

    setPosting(true);

    try {
      // Simplified posting - in production this would call the actual posting API
      toast.success("Post scheduled successfully!");
      router.push('/tools');
    } catch (error) {
      console.error('Error posting:', error);
      toast.error('Failed to publish post');
    } finally {
      setPosting(false);
    }
  };

  const getAvailableTargets = () => {
    const targets: Array<{id: string, name: string, type: string, platform: string}> = [];

    // Add pages for Facebook/Instagram
    socialPages.forEach(page => {
      if (page.provider && selectedPlatforms.includes(page.provider.toLowerCase())) {
        targets.push({
          id: `page:${page.id}`,
          name: page.page_name || 'Unnamed Page',
          type: 'page',
          platform: page.provider
        });
      }
    });

    // Add connections for Twitter/LinkedIn/Reddit
    socialConnections.forEach(connection => {
      if (connection.provider && selectedPlatforms.includes(connection.provider.toLowerCase())) {
        targets.push({
          id: `connection:${connection.id}`,
          name: connection.account_id || connection.provider || 'Account',
          type: 'connection',
          platform: connection.provider
        });
      }
    });

    // Add website option if selected
    if (selectedPlatforms.includes('website')) {
      targets.push({
        id: 'website:main',
        name: 'Website Blog',
        type: 'website',
        platform: 'website'
      });
    }

    return targets;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'input': return 'Create Content';
      case 'strategy': return 'Content Strategy';
      case 'select': return 'Select Post';
      case 'post': return 'Choose Target';
      default: return 'Create Post';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'input': return 'Enter your prompt and select platforms';
      case 'strategy': return 'Fine-tune your content preferences';
      case 'select': return 'Choose your preferred generated content';
      case 'post': return 'Select where to publish your content';
      default: return '';
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'input': return prompt.trim() && selectedPlatforms.length > 0 && selectedBrandId;
      case 'strategy': return selectedModelId !== '';
      case 'select': return selectedPost !== null;
      case 'post': return selectedTargets.length > 0;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'input':
        return (
          <div className="space-y-6">
            {/* Brand Selection */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Brand *
              </label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              >
                <option value="">Select a brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Content Prompt *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 h-32"
                placeholder="Describe what you want to post about..."
                required
              />
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                Platforms *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {platforms.map((platform) => (
                  <motion.button
                    key={platform.key}
                    type="button"
                    onClick={() => {
                      setSelectedPlatforms(prev => 
                        prev.includes(platform.key)
                          ? prev.filter(p => p !== platform.key)
                          : [...prev, platform.key]
                      );
                    }}
                    className={`p-3 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                      selectedPlatforms.includes(platform.key)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-dark-border bg-dark-lighter text-white/70 hover:text-white hover:border-primary/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <platform.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{platform.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'select':
        return (
          <div className="space-y-4">
            <p className="text-white/60 text-sm">
              Choose your preferred generated content:
            </p>
            {generatedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedPost?.id === post.id
                    ? 'border-primary bg-primary/10'
                    : 'border-dark-border bg-dark-lighter hover:border-primary/50'
                }`}
                onClick={() => handlePostSelection(post)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{post.title}</h4>
                  <span className="text-xs text-white/60 bg-dark-border px-2 py-1 rounded">
                    {post.tone}
                  </span>
                </div>
                <p className="text-white/80 text-sm whitespace-pre-line">{post.content}</p>
              </motion.div>
            ))}
          </div>
        );

      case 'post':
        const availableTargets = getAvailableTargets();
        return (
          <div className="space-y-4">
            {selectedPost && (
              <div className="p-4 bg-dark-lighter rounded-lg border border-dark-border mb-6">
                <h4 className="font-medium text-white mb-2">Selected Content:</h4>
                <p className="text-white/80 text-sm whitespace-pre-line">{selectedPost.content}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                Publishing Targets *
              </label>
              {availableTargets.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <p>No connected accounts found for selected platforms.</p>
                  <p className="text-sm mt-2">Please connect your social media accounts first.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableTargets.map((target) => (
                    <motion.button
                      key={target.id}
                      type="button"
                      onClick={() => {
                        setSelectedTargets(prev => 
                          prev.includes(target.id)
                            ? prev.filter(t => t !== target.id)
                            : [...prev, target.id]
                        );
                      }}
                      className={`w-full p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 ${
                        selectedTargets.includes(target.id)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-dark-border bg-dark-lighter text-white/70 hover:text-white hover:border-primary/50'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        {platforms.find(p => p.key === target.platform.toLowerCase())?.icon && (
                          React.createElement(platforms.find(p => p.key === target.platform.toLowerCase())!.icon, {
                            className: "h-4 w-4"
                          })
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{target.name}</div>
                        <div className="text-xs opacity-60">{target.platform} {target.type}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <ParticleBackground />
      
      {/* Navigation */}
      <AuthenticatedNavbar
        onLogout={() => router.push('/')}
        onTokenClick={() => router.push('/pricing')}
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
                {getStepTitle()}
              </h1>
              <p className="text-white/70">
                Step {currentStep === 'input' ? 1 : currentStep === 'strategy' ? 2 : currentStep === 'select' ? 3 : 4} of 4: {getStepDescription()}
              </p>
            </div>

            <TokenCostDisplay />
          </div>

          {/* Content */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-elevation-2">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="flex justify-between mt-6">
            {currentStep !== 'input' && (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 'select') setCurrentStep('input');
                  else if (currentStep === 'post') setCurrentStep('select');
                }}
                className="btn btn-secondary inline-flex items-center gap-2"
                disabled={generating || posting}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
            
            <div className="ml-auto">
              {currentStep === 'input' && (
                <button
                  onClick={handleGeneratePosts}
                  disabled={!canProceed() || generating}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {generating ? 'Generating...' : 'Generate Posts'}
                </button>
              )}
              
              {currentStep === 'select' && (
                <button
                  onClick={() => selectedPost && setCurrentStep('post')}
                  disabled={!canProceed()}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              )}
              
              {currentStep === 'post' && (
                <button
                  onClick={handlePublishPost}
                  disabled={!canProceed() || posting}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {posting ? 'Publishing...' : 'Publish Post'}
                </button>
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

export default PostNowClient; 