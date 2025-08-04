'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Zap, 
  Sparkles, 
  Target, 
  Calendar, 
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';

interface SimpleCampaignCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated?: () => void;
}

interface CampaignData {
  name: string;
  description: string;
  goal: string;
  frequency: string;
  platforms: string[];
  brandId: string;
  selectedPages: { [platform: string]: string[] };
}

interface SocialPage {
  id: string;
  page_name: string;
  provider: string;
  page_id: string;
}

const SimpleCampaignCreator: React.FC<SimpleCampaignCreatorProps> = ({
  isOpen,
  onClose,
  onCampaignCreated
}) => {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);
  const [socialConnections, setSocialConnections] = useState<any[]>([]);
  const [socialPages, setSocialPages] = useState<SocialPage[]>([]);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    description: '',
    goal: 'awareness',
    frequency: 'daily',
    platforms: [],
    brandId: '',
    selectedPages: {}
  });

  const steps = [
    {
      id: 1,
      title: 'Campaign Basics',
      subtitle: 'Name your campaign and set your goal',
      icon: Target
    },
    {
      id: 2,
      title: 'Content Strategy',
      subtitle: 'Choose posting frequency and platforms',
      icon: Calendar
    },
    {
      id: 3,
      title: 'Review & Create',
      subtitle: 'Review your settings and launch',
      icon: Zap
    }
  ];

  const campaignGoals = [
    { value: 'awareness', label: 'Brand Awareness', description: 'Increase brand visibility', icon: Target },
    { value: 'engagement', label: 'Engagement', description: 'Boost audience interaction', icon: MessageSquare },
    { value: 'leads', label: 'Lead Generation', description: 'Generate new leads', icon: Sparkles },
    { value: 'sales', label: 'Sales', description: 'Drive conversions', icon: Zap },
    { value: 'traffic', label: 'Website Traffic', description: 'Increase site visits', icon: Globe }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily', description: 'Post once per day', icon: Calendar },
    { value: 'weekly', label: 'Weekly', description: 'Post 2-3 times per week', icon: Calendar },
    { value: 'biweekly', label: 'Bi-weekly', description: 'Post every other day', icon: Calendar },
    { value: 'once', label: 'One-time', description: 'Single post campaign', icon: Calendar }
  ];

  const platforms = [
    { key: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { key: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { key: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { key: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' }
  ];

  useEffect(() => {
    if (isOpen && user) {
      fetchBrands();
      fetchSocialConnections();
      fetchSocialPages();
    }
  }, [isOpen, user]);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrands(data || []);
      
      // Auto-select first brand if available
      if (data && data.length > 0 && !campaignData.brandId) {
        setCampaignData(prev => ({ ...prev, brandId: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchSocialConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setSocialConnections(data || []);
    } catch (error) {
      console.error('Error fetching social connections:', error);
    }
  };

  const fetchSocialPages = async () => {
    try {
      const { data, error } = await supabase
        .from('social_pages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSocialPages(data || []);
    } catch (error) {
      console.error('Error fetching social pages:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignData.name.trim() || !campaignData.brandId || campaignData.platforms.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate that pages are selected for platforms that require them
    const platformsRequiringPages = ['facebook', 'instagram', 'linkedin'];
    const missingPages = campaignData.platforms.filter(platform => 
      platformsRequiringPages.includes(platform) && 
      (!campaignData.selectedPages[platform] || campaignData.selectedPages[platform].length === 0)
    );

    if (missingPages.length > 0) {
      toast.error(`Please select pages for: ${missingPages.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      // Prepare target page IDs for platforms that require them
      const targetPageIds: string[] = [];
      campaignData.platforms.forEach(platform => {
        if (campaignData.selectedPages[platform]) {
          targetPageIds.push(...campaignData.selectedPages[platform]);
        }
      });

      const { error } = await supabase
        .from('campaigns')
        .insert({
          user_id: user?.id,
          brand_id: campaignData.brandId,
          campaign_name: campaignData.name.trim(),
          description: campaignData.description.trim() || null,
          goal: campaignData.goal,
          ai_posting_frequency: campaignData.frequency,
          target_platforms: campaignData.platforms,
          target_page_ids: targetPageIds.length > 0 ? targetPageIds : null,
          is_active: true,
          ai_intent: 'general',
          schedule_cron: campaignData.frequency === 'daily' ? '0 9 * * *' : '0 9 * * 1', // 9 AM daily or weekly
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

      if (error) throw error;

      toast.success('Campaign created successfully!');
      onCampaignCreated?.();
      onClose();
      
      // Reset form
      setCampaignData({
        name: '',
        description: '',
        goal: 'awareness',
        frequency: 'daily',
        platforms: [],
        brandId: brands[0]?.id || '',
        selectedPages: {}
      });
      setCurrentStep(1);
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    const platform = platforms.find(p => p.key === provider);
    return platform?.icon || Globe;
  };

  const getProviderColor = (provider: string) => {
    const platform = platforms.find(p => p.key === provider);
    return platform?.color || '#6B7280';
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

  const getPagesForPlatform = (platformKey: string) => {
    return socialPages.filter(page => page.provider === platformKey);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Brand Selection */}
            {brands.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Brand *
                </label>
                <select
                  value={campaignData.brandId}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, brandId: e.target.value }))}
                  className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Campaign Name */}
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

            {/* Campaign Description */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={campaignData.description}
                onChange={(e) => setCampaignData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 h-20"
                placeholder="Describe your campaign goals..."
              />
            </div>

            {/* Campaign Goal */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                Campaign Goal
              </label>
              <div className="grid grid-cols-1 gap-3">
                {campaignGoals.map(goal => {
                  const Icon = goal.icon;
                  return (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() => setCampaignData(prev => ({ ...prev, goal: goal.value }))}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        campaignData.goal === goal.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-dark-border bg-dark-lighter text-white/70 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          campaignData.goal === goal.value
                            ? 'bg-primary/20'
                            : 'bg-white/10'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{goal.label}</div>
                          <div className="text-xs opacity-70">{goal.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Posting Frequency */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                Posting Frequency
              </label>
              <div className="grid grid-cols-2 gap-3">
                {frequencies.map(freq => {
                  const Icon = freq.icon;
                  return (
                    <button
                      key={freq.value}
                      type="button"
                      onClick={() => setCampaignData(prev => ({ ...prev, frequency: freq.value }))}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        campaignData.frequency === freq.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-dark-border bg-dark-lighter text-white/70 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          campaignData.frequency === freq.value
                            ? 'bg-primary/20'
                            : 'bg-white/10'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{freq.label}</div>
                          <div className="text-xs opacity-70">{freq.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                Select Platforms *
              </label>
              <div className="space-y-3">
                {platforms.map(platform => {
                  const Icon = platform.icon;
                  const isConnected = socialConnections.some(conn => conn.provider === platform.key);
                  const isSelected = campaignData.platforms.includes(platform.key);
                  const platformPages = getPagesForPlatform(platform.key);
                  const hasPages = platformPages.length > 0;
                  
                  return (
                    <div key={platform.key} className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handlePlatformToggle(platform.key)}
                        disabled={!isConnected}
                        className={`w-full p-4 rounded-lg border transition-all ${
                          !isConnected
                            ? 'border-dark-border bg-dark-lighter/50 text-white/40 cursor-not-allowed'
                            : isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-dark-border bg-dark-lighter text-white/70 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              !isConnected
                                ? 'bg-white/5'
                                : isSelected
                                ? 'bg-primary/20'
                                : 'bg-white/10'
                            }`}>
                              <Icon className="h-4 w-4" style={{ color: platform.color }} />
                            </div>
                            <div className="text-left">
                              <div className="font-medium">{platform.name}</div>
                              <div className="text-xs opacity-70">
                                {!isConnected ? 'Not connected' : 
                                 hasPages ? `${platformPages.length} page(s) available` : 
                                 'No pages available'}
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
                              onClick={() => setExpandedPlatform(expandedPlatform === platform.key ? null : platform.key)}
                              className="text-primary hover:text-primary-light text-sm"
                            >
                              {expandedPlatform === platform.key ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          
                          <AnimatePresence>
                            {expandedPlatform === platform.key && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2"
                              >
                                {platformPages.map(page => {
                                  const isPageSelected = (campaignData.selectedPages[platform.key] || []).includes(page.id);
                                  return (
                                    <button
                                      key={page.id}
                                      type="button"
                                      onClick={() => handlePageSelection(platform.key, page.id)}
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
              
              {campaignData.platforms.length === 0 && (
                <div className="text-center text-white/60 text-sm mt-4">
                  <p>Select at least one platform to continue</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Review Your Campaign</h3>
              <p className="text-white/60">Everything looks good? Let&apos;s create your campaign!</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-dark-lighter rounded-lg border border-dark-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Campaign Name</span>
                </div>
                <span className="text-white font-medium">{campaignData.name || 'Not set'}</span>
              </div>

              <div className="p-4 bg-dark-lighter rounded-lg border border-dark-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Brand</span>
                </div>
                <span className="text-white font-medium">
                  {brands.find(b => b.id === campaignData.brandId)?.name || 'Not selected'}
                </span>
              </div>

              <div className="p-4 bg-dark-lighter rounded-lg border border-dark-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Goal</span>
                </div>
                <span className="text-white font-medium">
                  {campaignGoals.find(g => g.value === campaignData.goal)?.label || 'Not set'}
                </span>
              </div>

              <div className="p-4 bg-dark-lighter rounded-lg border border-dark-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Frequency</span>
                </div>
                <span className="text-white font-medium">
                  {frequencies.find(f => f.value === campaignData.frequency)?.label || 'Not set'}
                </span>
              </div>

              <div className="p-4 bg-dark-lighter rounded-lg border border-dark-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Platforms & Pages</span>
                </div>
                <div className="space-y-2">
                  {campaignData.platforms.length > 0 ? (
                    campaignData.platforms.map(platform => {
                      const platformPages = getPagesForPlatform(platform);
                      const selectedPages = campaignData.selectedPages[platform] || [];
                      const selectedPageNames = selectedPages.map(pageId => 
                        platformPages.find(p => p.id === pageId)?.page_name
                      ).filter(Boolean);
                      
                      return (
                        <div key={platform} className="flex items-center gap-2">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                            {React.createElement(getProviderIcon(platform), { 
                              className: "h-3 w-3", 
                              style: { color: getProviderColor(platform) } 
                            })}
                            <span className="text-white text-sm">
                              {platforms.find(p => p.key === platform)?.name}
                            </span>
                          </div>
                          {selectedPageNames.length > 0 && (
                            <span className="text-white/60 text-sm">
                              → {selectedPageNames.join(', ')}
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-white/40 text-sm">No platforms selected</span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center text-white/60 text-sm">
              <p>Your campaign will start automatically and post content based on your settings</p>
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
        onClick={onClose}
      />
      
      <motion.div
        className="relative bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl overflow-hidden z-10"
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
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Create Campaign</h2>
                  <p className="text-white/60 text-sm">Set up your automated content campaign</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-primary text-white'
                            : 'bg-dark-lighter text-white/40 border border-dark-border'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="text-xs text-white/60 mt-1 text-center max-w-16">
                        {step.title}
                      </div>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 ${
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
                    (currentStep === 1 && (!campaignData.name.trim() || !campaignData.brandId)) ||
                    (currentStep === 2 && campaignData.platforms.length === 0)
                  }
                  className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleCreateCampaign}
                  disabled={loading}
                  className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="h-4 w-4" />
                  {loading ? 'Creating...' : 'Create Campaign'}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SimpleCampaignCreator; 