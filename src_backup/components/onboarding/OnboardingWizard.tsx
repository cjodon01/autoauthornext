'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Globe, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Users,
  Target,
  Palette,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  X,
  SkipForward,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';
import { useRouter } from 'next/navigation';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface BrandData {
  name: string;
  description: string;
  industry: string;
  target_audience: string;
  brand_voice: string;
  primary_color: string;
  secondary_color: string;
  core_values: string[];
}

interface SocialConnection {
  provider: string;
  connected: boolean;
  connecting: boolean;
}

interface CampaignData {
  name: string;
  description: string;
  goal: string;
  frequency: string;
  platforms: string[];
  selectedPages: { [platform: string]: string[] };
}

interface SocialPage {
  id: string;
  page_name: string;
  provider: string;
  page_id: string;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [socialPages, setSocialPages] = useState<SocialPage[]>([]);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  
  // Step data
  const [brandData, setBrandData] = useState<BrandData>({
    name: '',
    description: '',
    industry: '',
    target_audience: '',
    brand_voice: 'professional',
    primary_color: '#8A2BE2',
    secondary_color: '#00BFFF',
    core_values: ['Quality', 'Innovation']
  });

  const [socialConnections, setSocialConnections] = useState<SocialConnection[]>([
    { provider: 'facebook', connected: false, connecting: false },
    { provider: 'twitter', connected: false, connecting: false },
    { provider: 'instagram', connected: false, connecting: false },
    { provider: 'linkedin', connected: false, connecting: false }
  ]);

  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    description: '',
    goal: 'awareness',
    frequency: 'daily',
    platforms: [],
    selectedPages: {}
  });

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      id: 1,
      title: 'Welcome to AutoAuthor',
      subtitle: "Let&apos;s set up your brand profile",
      icon: Building2,
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 2,
      title: 'Connect Social Accounts',
      subtitle: 'Link your social media platforms',
      icon: Globe,
      color: 'from-green-500 to-blue-600'
    },
    {
      id: 3,
      title: 'Create Your First Campaign',
      subtitle: 'Set up automated content creation',
      icon: Zap,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 4,
      title: "You're All Set!",
      subtitle: 'Start creating amazing content',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-600'
    }
  ];

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 
    'Entertainment', 'Food & Beverage', 'Fashion', 'Travel', 'Real Estate',
    'Automotive', 'Sports', 'Non-profit', 'Other'
  ];

  const brandVoices = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
    { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
    { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
    { value: 'authoritative', label: 'Authoritative', description: 'Confident and expert' },
    { value: 'playful', label: 'Playful', description: 'Fun and energetic' },
    { value: 'inspiring', label: 'Inspiring', description: 'Motivational and uplifting' }
  ];

  const campaignGoals = [
    { value: 'awareness', label: 'Brand Awareness', description: 'Increase brand visibility' },
    { value: 'engagement', label: 'Engagement', description: 'Boost audience interaction' },
    { value: 'leads', label: 'Lead Generation', description: 'Generate new leads' },
    { value: 'sales', label: 'Sales', description: 'Drive conversions' },
    { value: 'traffic', label: 'Website Traffic', description: 'Increase site visits' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily', description: 'Post once per day' },
    { value: 'weekly', label: 'Weekly', description: 'Post 2-3 times per week' },
    { value: 'biweekly', label: 'Bi-weekly', description: 'Post every other day' },
    { value: 'once', label: 'One-time', description: 'Single post campaign' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setCompletedSteps(prev => [...prev, currentStep]);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    setSkipping(true);
    try {
      // Create a basic brand if not already created
      if (!brandData.name) {
        const basicBrand = {
          user_id: user?.id,
          name: `${user?.email?.split('@')[0]}'s Brand`,
          description: 'My brand for content creation',
          industry: 'Other',
          target_audience: 'General audience',
          brand_voice: 'professional',
          primary_color: '#8A2BE2',
          secondary_color: '#00BFFF',
          core_values: ['Quality', 'Innovation']
        };

        await supabase.from('brands').insert(basicBrand);
      }

      onComplete();
      router.push('/dashboard');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      onComplete();
      router.push('/dashboard');
    } finally {
      setSkipping(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      // Create brand
      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .insert({
          user_id: user?.id,
          name: brandData.name,
          description: brandData.description,
          industry: brandData.industry,
          target_audience: brandData.target_audience,
          brand_voice: brandData.brand_voice,
          primary_color: brandData.primary_color,
          secondary_color: brandData.secondary_color,
          core_values: brandData.core_values.filter(v => v.trim() !== '')
        })
        .select()
        .single();

      if (brandError) throw brandError;

      // Create first campaign if data is provided
      if (campaignData.name && campaignData.platforms.length > 0) {
        // Prepare target page IDs for platforms that require them
        const targetPageIds: string[] = [];
        campaignData.platforms.forEach(platform => {
          if (campaignData.selectedPages[platform]) {
            targetPageIds.push(...campaignData.selectedPages[platform]);
          }
        });

        await supabase.from('campaigns').insert({
          user_id: user?.id,
          brand_id: brand.id,
          campaign_name: campaignData.name,
          description: campaignData.description,
          goal: campaignData.goal,
          ai_posting_frequency: campaignData.frequency,
          target_platforms: campaignData.platforms,
          target_page_ids: targetPageIds.length > 0 ? targetPageIds : null,
          is_active: true,
          ai_intent: 'general',
          schedule_cron: '0 9 * * *', // 9 AM daily
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
      }

      toast.success('Onboarding completed successfully!');
      onComplete();
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialConnect = async (provider: string) => {
    setSocialConnections(prev => 
      prev.map(conn => 
        conn.provider === provider 
          ? { ...conn, connecting: true }
          : conn
      )
    );

    try {
      // Simulate social connection (replace with actual OAuth flow)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSocialConnections(prev => 
        prev.map(conn => 
          conn.provider === provider 
            ? { ...conn, connected: true, connecting: false }
            : conn
        )
      );

      toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} connected successfully!`);
    } catch (error) {
      console.error('Error connecting social account:', error);
      toast.error(`Failed to connect ${provider}`);
      
      setSocialConnections(prev => 
        prev.map(conn => 
          conn.provider === provider 
            ? { ...conn, connecting: false }
            : conn
        )
      );
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'facebook': return Facebook;
      case 'twitter': return Twitter;
      case 'instagram': return Instagram;
      case 'linkedin': return Linkedin;
      default: return Globe;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'facebook': return '#1877F2';
      case 'twitter': return '#1DA1F2';
      case 'instagram': return '#E4405F';
      case 'linkedin': return '#0A66C2';
      default: return '#6B7280';
    }
  };

  const getPagesForPlatform = (platformKey: string) => {
    return socialPages.filter(page => page.provider === platformKey);
  };

  const handlePlatformToggle = (platformKey: string) => {
    const isSelected = campaignData.platforms.includes(platformKey);
    const newPlatforms = isSelected
      ? campaignData.platforms.filter(p => p !== platformKey)
      : [...campaignData.platforms, platformKey];
    
    setCampaignData(prev => ({ 
      ...prev, 
      platforms: newPlatforms,
      selectedPages: isSelected 
        ? { ...prev.selectedPages, [platformKey]: [] }
        : prev.selectedPages
    }));
  };

  const handlePageSelection = (platformKey: string, pageId: string) => {
    const currentSelected = campaignData.selectedPages[platformKey] || [];
    const isSelected = currentSelected.includes(pageId);
    
    const newSelected = isSelected
      ? currentSelected.filter(id => id !== pageId)
      : [...currentSelected, pageId];
    
    setCampaignData(prev => ({
      ...prev,
      selectedPages: {
        ...prev.selectedPages,
        [platformKey]: newSelected
      }
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Brand Name *
              </label>
              <input
                type="text"
                value={brandData.name}
                onChange={(e) => setBrandData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter your brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Industry
              </label>
              <select
                value={brandData.industry}
                onChange={(e) => setBrandData(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select your industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Target Audience
              </label>
              <input
                type="text"
                value={brandData.target_audience}
                onChange={(e) => setBrandData(prev => ({ ...prev, target_audience: e.target.value }))}
                className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Young professionals, Small business owners"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                Brand Voice
              </label>
              <div className="grid grid-cols-2 gap-3">
                {brandVoices.map(voice => (
                  <button
                    key={voice.value}
                    type="button"
                    onClick={() => setBrandData(prev => ({ ...prev, brand_voice: voice.value }))}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      brandData.brand_voice === voice.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-dark-border bg-dark-lighter text-white/70 hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{voice.label}</div>
                    <div className="text-xs opacity-70">{voice.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandData.primary_color}
                    onChange={(e) => setBrandData(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-12 h-12 bg-dark-lighter border border-dark-border rounded-lg"
                  />
                  <span className="text-white/60 text-sm">{brandData.primary_color}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandData.secondary_color}
                    onChange={(e) => setBrandData(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="w-12 h-12 bg-dark-lighter border border-dark-border rounded-lg"
                  />
                  <span className="text-white/60 text-sm">{brandData.secondary_color}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-white/60 mb-4">
                Connect your social media accounts to start creating content
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialConnections.map((connection) => {
                const Icon = getProviderIcon(connection.provider);
                const color = getProviderColor(connection.provider);
                
                return (
                  <div
                    key={connection.provider}
                    className={`p-4 rounded-lg border transition-all ${
                      connection.connected
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-dark-border bg-dark-lighter hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: color + '20' }}
                        >
                          <Icon className="h-5 w-5" style={{ color }} />
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {connection.provider.charAt(0).toUpperCase() + connection.provider.slice(1)}
                          </div>
                          <div className="text-sm text-white/60">
                            {connection.connected ? 'Connected' : 'Not connected'}
                          </div>
                        </div>
                      </div>
                      
                      {connection.connected ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <button
                          onClick={() => handleSocialConnect(connection.provider)}
                          disabled={connection.connecting}
                          className="btn btn-primary btn-sm"
                        >
                          {connection.connecting ? 'Connecting...' : 'Connect'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center text-white/60 text-sm">
              <p>Don&apos;t worry, you can connect more accounts later!</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={campaignData.name}
                onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Weekly Content Campaign"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                Campaign Goal
              </label>
              <div className="grid grid-cols-1 gap-3">
                {campaignGoals.map(goal => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => setCampaignData(prev => ({ ...prev, goal: goal.value }))}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      campaignData.goal === goal.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-dark-border bg-dark-lighter text-white/70 hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{goal.label}</div>
                    <div className="text-xs opacity-70">{goal.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                Posting Frequency
              </label>
              <div className="grid grid-cols-2 gap-3">
                {frequencies.map(freq => (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => setCampaignData(prev => ({ ...prev, frequency: freq.value }))}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      campaignData.frequency === freq.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-dark-border bg-dark-lighter text-white/70 hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{freq.label}</div>
                    <div className="text-xs opacity-70">{freq.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                Select Platforms & Pages
              </label>
              <div className="space-y-3">
                {socialConnections.filter(conn => conn.connected).map(connection => {
                  const Icon = getProviderIcon(connection.provider);
                  const color = getProviderColor(connection.provider);
                  const platformPages = getPagesForPlatform(connection.provider);
                  const hasPages = platformPages.length > 0;
                  const isSelected = campaignData.platforms.includes(connection.provider);
                  
                  return (
                    <div key={connection.provider} className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handlePlatformToggle(connection.provider)}
                        className={`w-full p-4 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-dark-border bg-dark-lighter text-white/70 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: color + '20' }}
                            >
                              <Icon className="h-4 w-4" style={{ color }} />
                            </div>
                            <div className="text-left">
                              <div className="font-medium">
                                {connection.provider.charAt(0).toUpperCase() + connection.provider.slice(1)}
                              </div>
                              <div className="text-xs opacity-70">
                                {hasPages ? `${platformPages.length} page(s) available` : 'No pages available'}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </button>

                      {/* Page Selection for Selected Platforms */}
                      {isSelected && hasPages && (
                        <div className="ml-8 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white/60">Select pages to post to:</span>
                            <button
                              type="button"
                              onClick={() => setExpandedPlatform(expandedPlatform === connection.provider ? null : connection.provider)}
                              className="text-primary hover:text-primary-light text-sm"
                            >
                              {expandedPlatform === connection.provider ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          
                          <AnimatePresence>
                            {expandedPlatform === connection.provider && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2"
                              >
                                {platformPages.map(page => {
                                  const isPageSelected = (campaignData.selectedPages[connection.provider] || []).includes(page.id);
                                  return (
                                    <button
                                      key={page.id}
                                      type="button"
                                      onClick={() => handlePageSelection(connection.provider, page.id)}
                                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                                        isPageSelected
                                          ? 'border-primary bg-primary/10 text-primary'
                                          : 'border-dark-border bg-dark-lighter text-white/70 hover:border-primary/50'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{page.page_name}</span>
                                        {isPageSelected && (
                                          <CheckCircle className="h-4 w-4 text-primary" />
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {campaignData.platforms.length === 0 && (
              <div className="text-center text-white/60 text-sm">
                <p>Connect social accounts first to create campaigns</p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Welcome to AutoAuthor!
              </h3>
              <p className="text-white/60">
                Your account is set up and ready to create amazing content
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-dark-lighter rounded-lg border border-dark-border">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                  <Building2 className="h-4 w-4 text-blue-500" />
                </div>
                <h4 className="font-medium text-white mb-1">Brand Profile</h4>
                <p className="text-sm text-white/60">Your brand is configured and ready</p>
              </div>

              <div className="p-4 bg-dark-lighter rounded-lg border border-dark-border">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
                  <Globe className="h-4 w-4 text-green-500" />
                </div>
                <h4 className="font-medium text-white mb-1">Social Accounts</h4>
                <p className="text-sm text-white/60">
                  {socialConnections.filter(c => c.connected).length} accounts connected
                </p>
              </div>

              <div className="p-4 bg-dark-lighter rounded-lg border border-dark-border">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                  <Zap className="h-4 w-4 text-purple-500" />
                </div>
                <h4 className="font-medium text-white mb-1">First Campaign</h4>
                <p className="text-sm text-white/60">
                  {campaignData.name ? 'Campaign created' : 'Ready to create'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCompleteOnboarding}
                disabled={loading}
                className="btn btn-primary w-full inline-flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {loading ? 'Setting up...' : 'Get Started'}
              </button>
              
              <p className="text-white/40 text-sm">
                You can always update your settings later in the dashboard
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      
      <motion.div
        className="relative bg-dark-card border border-dark-border rounded-2xl w-full max-w-4xl overflow-hidden z-10"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] bg-primary/40"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-[80px] bg-secondary/40"></div>
        
        <div className="relative max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-dark-card border-b border-dark-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <img
                  src="/images/favicon.svg"
                  alt="AutoAuthor logo"
                  className="h-6 w-6"
                />
                <span className="font-display font-semibold text-gradient">AutoAuthor.cc</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSkip}
                  disabled={skipping}
                  className="text-white/60 hover:text-white text-sm flex items-center gap-1 transition-colors"
                >
                  <SkipForward className="h-4 w-4" />
                  {skipping ? 'Skipping...' : 'Skip'}
                </button>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStep === step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? `bg-gradient-to-r ${step.color} text-white`
                            : 'bg-dark-lighter text-white/40 border border-dark-border'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </div>
                      <div className="text-xs text-white/60 mt-2 text-center max-w-20">
                        {step.title}
                      </div>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-dark-border'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-white/60">
                {steps[currentStep - 1].subtitle}
              </p>
            </div>

            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="bg-dark-card border-t border-dark-border p-6">
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="btn btn-secondary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>
              
              {currentStep < steps.length ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !brandData.name) ||
                    (currentStep === 3 && (!campaignData.name || campaignData.platforms.length === 0))
                  }
                  className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleCompleteOnboarding}
                  disabled={loading}
                  className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="h-4 w-4" />
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingWizard; 