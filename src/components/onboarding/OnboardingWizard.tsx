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
  ChevronDown,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import CreateBotModal from '../dashboard/CreateBotModal';

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
  url?: string;
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
  const [existingBrand, setExistingBrand] = useState<any>(null);
  const [socialPages, setSocialPages] = useState<SocialPage[]>([]);
  const [isFbSdkLoaded, setIsFbSdkLoaded] = useState(false);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);

  const [brandData, setBrandData] = useState<BrandData>({
    name: '',
    description: '',
    industry: '',
    target_audience: '',
    brand_voice: 'professional',
    primary_color: '#8A2BE2',
    secondary_color: '#00BFFF',
    core_values: ['']
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
    goal: 'engagement',
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

  // Load Facebook SDK
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).FB) {
      setIsFbSdkLoaded(true);
      return;
    }

    if (!document.getElementById("fb-root")) {
      const fbRoot = document.createElement("div");
      fbRoot.id = "fb-root";
      document.body.appendChild(fbRoot);
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.onload = () => {
      (window as any).FB.init({
        appId: "686038484393201",
        cookie: true,
        xfbml: false,
        version: "v17.0",
      });
      setIsFbSdkLoaded(true);
    };
    script.onerror = () => {
      toast.error("Failed to load Facebook SDK");
    };
    document.body.appendChild(script);
  }, []);

  // Load existing brand and social pages
  useEffect(() => {
    if (isOpen && user) {
      loadExistingBrand();
      fetchSocialPages();
    }
  }, [isOpen, user]);

  const loadExistingBrand = async () => {
    if (!user) return;

    try {
      const { data: brands, error } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (brands && brands.length > 0) {
        const brand = brands[0];
        setExistingBrand(brand);
        setBrandData({
          name: brand.name || '',
          description: brand.description || '',
          industry: brand.industry || '',
          target_audience: brand.target_audience || '',
          brand_voice: brand.brand_voice || 'professional',
          primary_color: brand.primary_color || '#8A2BE2',
          secondary_color: brand.secondary_color || '#00BFFF',
          core_values: brand.core_values || ['']
        });
      }
    } catch (error) {
      console.error('Error loading existing brand:', error);
    }
  };

  const fetchSocialPages = async () => {
    if (!user) return;

    try {
      const { data: pages, error } = await supabase
        .from('social_pages')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setSocialPages(pages || []);
    } catch (error) {
      console.error('Error fetching social pages:', error);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // For brand step, update the existing brand
      if (existingBrand) {
        handleUpdateBrand();
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
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
      // Update existing brand if it exists, otherwise create new one
      let brandId = existingBrand?.id;
      
      if (existingBrand) {
        // Update existing brand
        const { error: updateError } = await supabase
          .from('brands')
          .update({
            name: brandData.name,
            description: brandData.description,
            industry: brandData.industry,
            target_audience: brandData.target_audience,
            brand_voice: brandData.brand_voice,
            primary_color: brandData.primary_color,
            secondary_color: brandData.secondary_color,
            core_values: brandData.core_values.filter(v => v.trim() !== ''),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingBrand.id);

        if (updateError) throw updateError;
      } else {
        // Create new brand
        const { data: brand, error: createError } = await supabase
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

        if (createError) throw createError;
        brandId = brand.id;
      }

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
          brand_id: brandId,
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
    if (!user) return;

    setSocialConnections(prev => 
      prev.map(conn => 
        conn.provider === provider 
          ? { ...conn, connecting: true }
          : conn
      )
    );

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Not logged in");
        setSocialConnections(prev => 
          prev.map(conn => 
            conn.provider === provider 
              ? { ...conn, connecting: false }
              : conn
          )
        );
        return;
      }

      if (provider === "facebook") {
        if (!isFbSdkLoaded || typeof (window as any).FB === "undefined") {
          toast.error("Facebook SDK not loaded");
          setSocialConnections(prev => 
            prev.map(conn => 
              conn.provider === provider 
                ? { ...conn, connecting: false }
                : conn
            )
          );
          return;
        }

        (window as any).FB.login((response: any) => {
          (async () => {
            if (response.status === "connected") {
              const shortLivedToken = response.authResponse.accessToken;

              const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/social-media-connector`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ provider: "facebook", user_token: shortLivedToken }),
              });

              const result = await res.json();

              if (!res.ok) {
                toast.error(result.error || "Facebook connection failed");
              } else {
                toast.success(`Facebook ${result.pages_count ? "refreshed" : "connected"} successfully`);
                setSocialConnections(prev => 
                  prev.map(conn => 
                    conn.provider === provider 
                      ? { ...conn, connected: true, connecting: false }
                      : conn
                  )
                );
                await fetchSocialPages();
              }
            } else {
              toast.error("Facebook login failed");
            }
            setSocialConnections(prev => 
              prev.map(conn => 
                conn.provider === provider 
                  ? { ...conn, connecting: false }
                  : conn
              )
            );
          })();
        }, {
          auth_type: 'rerequest',
          scope: "pages_manage_posts,business_management,pages_show_list,read_insights,pages_read_engagement"
        });

        return;
      }

      // For other platforms, redirect to OAuth
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/social-media-connector`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ provider }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || `Failed to connect/refresh ${provider}`);
      } else if (result.url) {
        window.location.href = result.url;
      } else {
        toast.success(`${provider} account refreshed`);
        setSocialConnections(prev => 
          prev.map(conn => 
            conn.provider === provider 
              ? { ...conn, connected: true, connecting: false }
              : conn
          )
        );
        await fetchSocialPages();
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
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

  const handleGenerateBrand = async () => {
    if (!brandData.name || !brandData.description) {
      toast.error('Please provide brand name and description');
      return;
    }

    setLoading(true);
    try {
      // First, deduct tokens for AI brand generation
      const deductResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/deductTokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          user_id: user?.id,
          task_type: 'brand_generation',
          platform_count: 1
        }),
      });

      if (!deductResponse.ok) {
        const error = await deductResponse.json();
        throw new Error(error.error || 'Failed to deduct tokens');
      }

      // Call the AI brand building function
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-brand-build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          brand_name: brandData.name,
          brand_url: brandData.url || '',
          brand_summary: brandData.description,
          brand_type: 'individual'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate brand profile');
      }

      const aiBrandProfile = await response.json();

      // Update brand data with AI-generated content
      setBrandData(prev => ({
        ...prev,
        description: aiBrandProfile.description || prev.description,
        industry: aiBrandProfile.industry || prev.industry,
        target_audience: aiBrandProfile.target_audience || prev.target_audience,
        brand_voice: aiBrandProfile.brand_voice || prev.brand_voice,
        core_values: aiBrandProfile.core_values || prev.core_values
      }));

      toast.success('Brand profile generated successfully!');
    } catch (error) {
      console.error('Error generating brand profile:', error);
      toast.error('Failed to generate brand profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBrand = async () => {
    if (!existingBrand) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('brands')
        .update({
          name: brandData.name,
          description: brandData.description,
          industry: brandData.industry,
          target_audience: brandData.target_audience,
          brand_voice: brandData.brand_voice,
          primary_color: brandData.primary_color,
          secondary_color: brandData.secondary_color,
          core_values: brandData.core_values.filter(v => v.trim() !== ''),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingBrand.id);

      if (error) throw error;

      toast.success('Brand updated successfully!');
      setCurrentStep(2);
    } catch (error) {
      console.error('Error updating brand:', error);
      toast.error('Failed to update brand');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {existingBrand ? 'Update Your Brand Profile' : 'Build Your Brand Profile'}
              </h3>
              <p className="text-white/60">
                {existingBrand 
                  ? 'Let\'s enhance your existing brand with AI-powered insights and analysis'
                  : 'Tell us about your brand and we\'ll help you build a comprehensive profile'
                }
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Brand Name *</label>
                <input
                  type="text"
                  value={brandData.name}
                  onChange={(e) => setBrandData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg focus:border-primary focus:outline-none"
                  placeholder="Enter your brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website URL (Optional)</label>
                <input
                  type="url"
                  value={brandData.url || ''}
                  onChange={(e) => setBrandData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg focus:border-primary focus:outline-none"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Brand Description *</label>
                <textarea
                  value={brandData.description}
                  onChange={(e) => setBrandData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg focus:border-primary focus:outline-none resize-none"
                  rows={4}
                  placeholder="Describe what your brand does, your mission, and what makes you unique..."
                />
              </div>

              {brandData.name && brandData.description && (
                <button
                  onClick={handleGenerateBrand}
                  disabled={loading}
                  className="w-full btn btn-primary btn-lg inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating Brand Profile...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate AI Brand Profile
                    </>
                  )}
                </button>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Industry</label>
                  <input
                    type="text"
                    value={brandData.industry}
                    onChange={(e) => setBrandData(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg focus:border-primary focus:outline-none"
                    placeholder="e.g., Technology, Health, Education"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Target Audience</label>
                  <input
                    type="text"
                    value={brandData.target_audience}
                    onChange={(e) => setBrandData(prev => ({ ...prev, target_audience: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg focus:border-primary focus:outline-none"
                    placeholder="e.g., Young professionals, 25-35"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Brand Voice</label>
                <select
                  value={brandData.brand_voice}
                  onChange={(e) => setBrandData(prev => ({ ...prev, brand_voice: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg focus:border-primary focus:outline-none"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="casual">Casual</option>
                  <option value="inspirational">Inspirational</option>
                  <option value="humorous">Humorous</option>
                  <option value="educational">Educational</option>
                  <option value="empathetic">Empathetic</option>
                  <option value="bold">Bold</option>
                  <option value="sophisticated">Sophisticated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Core Values</label>
                <div className="space-y-2">
                  {brandData.core_values.map((value, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                          const newValues = [...brandData.core_values];
                          newValues[index] = e.target.value;
                          setBrandData(prev => ({ ...prev, core_values: newValues }));
                        }}
                        className="flex-1 px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg focus:border-primary focus:outline-none"
                        placeholder={`Core value ${index + 1}`}
                      />
                      {brandData.core_values.length > 1 && (
                        <button
                          onClick={() => {
                            const newValues = brandData.core_values.filter((_, i) => i !== index);
                            setBrandData(prev => ({ ...prev, core_values: newValues }));
                          }}
                          className="px-3 py-3 text-red-500 hover:text-red-400"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setBrandData(prev => ({ ...prev, core_values: [...prev.core_values, ''] }))}
                    className="text-primary hover:text-primary/80 text-sm"
                  >
                    + Add Core Value
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <input
                    type="color"
                    value={brandData.primary_color}
                    onChange={(e) => setBrandData(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-full h-12 bg-dark-lighter border border-dark-border rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Secondary Color</label>
                  <input
                    type="color"
                    value={brandData.secondary_color}
                    onChange={(e) => setBrandData(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="w-full h-12 bg-dark-lighter border border-dark-border rounded-lg cursor-pointer"
                  />
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
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Create Your First Campaign
              </h3>
              <p className="text-white/60 mb-8 max-w-md mx-auto">
                Set up automated content creation with our powerful campaign builder. Choose between general campaigns for ongoing content or journey campaigns for storytelling.
              </p>
              
              <button
                onClick={() => setShowCreateCampaignModal(true)}
                className="btn btn-primary inline-flex items-center gap-2 px-8 py-3 text-lg"
              >
                <Zap className="h-5 w-5" />
                Create Campaign
              </button>
              
              <p className="text-white/40 text-sm mt-4">
                You can also create campaigns later from the dashboard
              </p>
            </div>
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
          {/* Header - Fixed */}
          <div className="bg-dark-card border-b border-dark-border p-6 flex-shrink-0">
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

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
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

          {/* Footer - Fixed */}
          <div className="bg-dark-card border-t border-dark-border p-6 flex-shrink-0">
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
                    (currentStep === 1 && !brandData.name)
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
      
      {/* Create Campaign Modal */}
      <CreateBotModal
        isOpen={showCreateCampaignModal}
        onClose={() => setShowCreateCampaignModal(false)}
      />
    </div>
  );
};

export default OnboardingWizard; 