'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Calendar, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';
import type { Database } from '../../lib/supabase/types';
import { DateTime } from "luxon";
import { useAiModels } from '../../hooks/useAiModels';

// Import step components
import CampaignBasicsStep from './steps/CampaignBasicsStep';
import GoalPlatformStep from './steps/GoalPlatformStep';
import ContentStrategyStep from './steps/ContentStrategyStep';
import SchedulingStep from './steps/SchedulingStep';

// Import modals
import CreateBrandModal from './CreateBrandModal';
import JourneyCampaignModal from './JourneyCampaignModal';
import WebsiteEmbedModal from '../modals/WebsiteEmbedModal';

// Types
type SocialPage = Database['public']['Tables']['social_pages']['Row'];
type SocialConnection = Database['public']['Tables']['social_connections']['Row'];
type Brand = Database['public']['Tables']['brands']['Row'];
type Step = 1 | 2 | 3 | 4;

export interface CampaignFormData {
  name: string;
  brandId: string;
  description: string;
  platforms: string[];
  goal: string;
  ai_intent: string;
  customPrompt: string;
  ai_tone_preference: string[];
  ai_content_style_preference: string[];
  target_audience_specific: string;
  target_audience_psychographics: string;
  negative_constraints_campaign: string;
  cta_action: string;
  cta_link: string;
  post_length_type: string;
  frequency: string;
  scheduledTime: string;
  timezone: string;
  ai_model_for_general_campaign?: string;
  model_id?: string;  
  startDate: string;
  endDate: string;
}

interface CreateBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define platforms array for social media platforms
const platforms = [
  { name: "Facebook", key: "facebook", icon: "Facebook", color: "#1877F2" },
  { name: "Twitter", key: "twitter", icon: "Twitter", color: "#1DA1F2" },
  { name: "Instagram", key: "instagram", icon: "MessageSquare", color: "#E4405F" },
  { name: "LinkedIn", key: "linkedin", icon: "Linkedin", color: "#0A66C2" },
  { name: "Reddit", key: "reddit", icon: "MessageSquare", color: "#FF4500" },
  { name: "Website", key: "website", icon: "Globe", color: "#00BFFF" },
];

const CreateBotModal: React.FC<CreateBotModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const supabase = createClient();
  const [campaignTypeStep, setCampaignTypeStep] = useState<'select' | 'general' | 'journey'>('select');
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string | undefined>(undefined);
  const [justCreatedCampaign, setJustCreatedCampaign] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showCreateBrandModal, setShowCreateBrandModal] = useState(false);
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  
  // Data states
  const [socialPages, setSocialPages] = useState<SocialPage[]>([]);
  const [socialConnections, setSocialConnections] = useState<SocialConnection[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsLoaded, setBrandsLoaded] = useState(false);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<string[]>([]);
  const [availablePages, setAvailablePages] = useState<SocialPage[]>([]);
  const [availableConnections, setAvailableConnections] = useState<SocialConnection[]>([]);
  
  // AI Models
  const { aiModels, loading: modelsLoading } = useAiModels();
  
  // UI states
  const [shakingPlatform, setShakingPlatform] = useState<string | null>(null);
  const [showPlatformToast, setShowPlatformToast] = useState(false);
  const [refreshingToken, setRefreshingToken] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    brandId: '',
    description: '',
    platforms: [],
    goal: '',
    ai_intent: '',
    customPrompt: '',
    ai_tone_preference: [],
    ai_content_style_preference: [],
    target_audience_specific: '',
    target_audience_psychographics: '',
    negative_constraints_campaign: '',
    cta_action: '',
    cta_link: '',
    post_length_type: '',
    frequency: '',
    scheduledTime: '19:00',
    timezone: 'America/New_York',
    ai_model_for_general_campaign: '',
    startDate: new Date().toISOString().split('T')[0], // Initialize with today's date
    endDate: ''
  });

  const [embedBrandName, setEmbedBrandName] = useState('');

  // Effects
  useEffect(() => {
    if (isOpen && user) {
      fetchBrands();
      fetchSocialPages();
      fetchSocialConnections();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (user && formData.platforms.length > 0) {
      fetchAvailablePages();
      fetchAvailableConnections();
    }
  }, [formData.platforms, user]);

  useEffect(() => {
    if (showPlatformToast) {
      const timer = setTimeout(() => setShowPlatformToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showPlatformToast]);

  useEffect(() => {
    if (justCreatedCampaign) {
      toast.success("Campaign scheduled successfully!", {
        description: "Your campaign has been created and will run according to your schedule."
      });
      setJustCreatedCampaign(false);
    }
  }, [justCreatedCampaign]);

  // FIXED: Only check for brands after they are loaded and only if no brands exist
  useEffect(() => {
    if (isOpen && brandsLoaded && brands.length === 0 && user && !showCreateBrandModal) {
      console.log('Opening Create Brand Modal - no brands found after loading completed');
      setShowCreateBrandModal(true);
    }
  }, [isOpen, brandsLoaded, brands.length, user, showCreateBrandModal]);

  useEffect(() => {
    if (formData.brandId) {
      const brand = brands.find(b => b.id === formData.brandId);
      setSelectedBrand(brand || null);
    } else {
      setSelectedBrand(null);
    }
  }, [formData.brandId, brands]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCampaignTypeStep('select');
      setCurrentStep(1);
      setFormData({
        name: '',
        brandId: '',
        description: '',
        platforms: [],
        goal: '',
        ai_intent: '',
        customPrompt: '',
        ai_tone_preference: [],
        ai_content_style_preference: [],
        target_audience_specific: '',
        target_audience_psychographics: '',
        negative_constraints_campaign: '',
        cta_action: '',
        cta_link: '',
        post_length_type: '',
        frequency: '',
        scheduledTime: '19:00',
        timezone: 'America/New_York',
        ai_model_for_general_campaign: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
      setSelectedPageIds([]);
      setSelectedConnectionIds([]);
      setBrandsLoaded(false); // Reset brands loaded state
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Data fetching functions
  const fetchBrands = async () => {
    if (!user) return;

    setBrandsLoading(true);
    try {
      console.log('Fetching brands for user:', user.id);
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching brands:', error);
        setBrands([]);
      } else {
        console.log('Fetched brands:', data?.length || 0);
        setBrands(data || []);

        if (data && data.length === 1 && !formData.brandId) {
          setFormData(prev => ({ ...prev, brandId: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    } finally {
      setBrandsLoading(false);
      setBrandsLoaded(true);
    }
  };

  const fetchSocialPages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('social_pages')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setSocialPages(data || []);
    } catch (error) {
      console.error('Error fetching social pages:', error);
    }
  };

  const fetchSocialConnections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setSocialConnections(data || []);
    } catch (error) {
      console.error('Error fetching social connections:', error);
    }
  };

  const fetchAvailablePages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('social_pages')
        .select('*')
        .eq('user_id', user.id)
        .in('provider', formData.platforms.map(p => p.toLowerCase()));

      if (error) throw error;
      setAvailablePages(data || []);
      
      if (data && data.length === 1 && selectedPageIds.length === 0) {
        setSelectedPageIds([data[0].id]);
      } else {
        setSelectedPageIds(prev => 
          prev.filter(id => data?.some(page => page.id === id))
        );
      }
    } catch (error) {
      console.error('Error fetching available pages:', error);
    }
  };

  const fetchAvailableConnections = async () => {
    if (!user) return;

    try {
      // Filter connections for non-page platforms (Twitter, LinkedIn, Reddit)
      const nonPagePlatforms = formData.platforms.filter(p => 
        !['facebook', 'instagram', 'website'].includes(p.toLowerCase())
      );
      
      if (nonPagePlatforms.length === 0) {
        setAvailableConnections([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id)
        .in('provider', nonPagePlatforms.map(p => p.toLowerCase()));

      if (error) throw error;
      setAvailableConnections(data || []);
      
               // Auto-select if there's only one connection per platform
         if (data && data.length > 0) {
           const platformGroups = data.reduce((acc, conn) => {
             const provider = conn.provider?.toLowerCase() || '';
             if (!acc[provider]) acc[provider] = [];
             acc[provider].push(conn);
             return acc;
           }, {} as Record<string, SocialConnection[]>);
           
                  // For each platform with exactly one connection, auto-select it
          const newSelections: string[] = [...selectedConnectionIds];
          
          Object.entries(platformGroups).forEach(([, connections]) => {
            const typedConnections = connections as SocialConnection[];
            if (typedConnections.length === 1 && !selectedConnectionIds.includes(typedConnections[0].id)) {
              newSelections.push(typedConnections[0].id);
            }
          });
        
        if (newSelections.length !== selectedConnectionIds.length) {
          setSelectedConnectionIds(newSelections);
        }
      }
    } catch (error) {
      console.error('Error fetching available connections:', error);
    }
  };

  // Navigation functions
  const handleNext = async () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        toast.error("Campaign name is required");
        return;
      }
      if (!formData.brandId) {
        toast.error("Please select a brand");
        return;
      }
    }

    if (currentStep === 2) {
      const platformsNeedingPages = formData.platforms
        .filter(p => ['facebook', 'instagram'].includes(p.toLowerCase()));

      if (platformsNeedingPages.length > 0) {
        const hasMatchingPages = availablePages.some(page =>
          platformsNeedingPages.includes(page.provider?.toLowerCase() || '')
        );

        const selectedPages = availablePages.filter(page => selectedPageIds.includes(page.id));
        const hasRequiredSelections = platformsNeedingPages.every(platform =>
          selectedPages.some(page => page.provider?.toLowerCase() === platform.toLowerCase())
        );

        if (!hasMatchingPages) {
          toast.error("No pages available", {
            description: `Please connect a page for ${platformsNeedingPages.join(" or ")} first.`
          });
          return;
        }

        if (!hasRequiredSelections) {
          toast.error("Select a page", {
            description: "Please select at least one page for your selected platform(s)."
          });
          return;
        }
      }
      
      // Check for non-page platforms (Twitter, LinkedIn, Reddit)
      const nonPagePlatforms = formData.platforms.filter(p => 
        !['facebook', 'instagram', 'website'].includes(p.toLowerCase())
      );
      
      if (nonPagePlatforms.length > 0) {
        const hasMatchingConnections = availableConnections.some(conn =>
          nonPagePlatforms.includes(conn.provider?.toLowerCase() || '')
        );
        
        const selectedConnections = availableConnections.filter(conn => 
          selectedConnectionIds.includes(conn.id)
        );
        
        const hasRequiredConnections = nonPagePlatforms.every(platform =>
          selectedConnections.some(conn => conn.provider?.toLowerCase() === platform.toLowerCase())
        );
        
        if (!hasMatchingConnections) {
          toast.error("No accounts available", {
            description: `Please connect an account for ${nonPagePlatforms.join(" or ")} first.`
          });
          return;
        }
        
        if (!hasRequiredConnections) {
          toast.error("Select an account", {
            description: "Please select at least one account for each selected platform."
          });
          return;
        }
      }
    }
    
    setCurrentStep(prev => (prev < 4 ? (prev + 1) as Step : prev));
  };

  const handleBack = () => {
    if (currentStep === 1 && campaignTypeStep === 'general') {
      setCampaignTypeStep('select');
    } else {
      setCurrentStep(prev => (prev > 1 ? (prev - 1) as Step : prev));
    }
  };

  // Campaign type selection handlers
  const handleGeneralCampaign = () => {
    setCampaignTypeStep('general');
    setCurrentStep(1);
  };

  const handleJourneyCampaign = () => {
    setShowJourneyModal(true);
  };

  const handleJourneyCampaignCreated = () => {
    setShowJourneyModal(false);
    setJustCreatedCampaign(true);
    onClose();
  };

  // Form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
  
    console.log('Submitting form with model:', formData.ai_model_for_general_campaign);
  
    if (!user) {
      toast.error("Authentication required", {
        description: "Please sign in to create a campaign"
      });
      return;
    }
  
    if (!formData.brandId) {
      toast.error("Brand selection required", {
        description: "Please select a brand for your campaign"
      });
      return;
    }

    // Validate start and end dates for recurring campaigns
    if (formData.frequency.toLowerCase() !== "once") {
      if (!formData.startDate) {
        toast.error("Start date is required for recurring campaigns");
        return;
      }
      if (!formData.endDate) {
        toast.error("End date is required for recurring campaigns");
        return;
      }
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        toast.error("Start date cannot be after end date");
        return;
      }
      
      // Validate campaign duration based on token balance
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const daysDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate daily token cost (simplified version)
      let dailyCost = 1; // Base cost for text post
      if (formData.ai_model_for_general_campaign) {
        // Add model cost if available (this would need to be fetched from ai_models table)
        dailyCost += 0; // Placeholder for model cost
      }
      if (formData.platforms && formData.platforms.length > 1) {
        dailyCost += (formData.platforms.length - 1) * 0.5; // Extra platform cost
      }
      
      // Get user's token balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('token_balance')
        .eq('user_id', user.id)
        .single();
      
      const tokenBalance = profile?.token_balance || 0;
      const maxDays = Math.min(Math.floor(tokenBalance / dailyCost), 90); // Hard cap at 90 days
      
      if (daysDifference > maxDays) {
        toast.error(`You only have enough tokens to run this campaign for up to ${maxDays} days. Add more tokens to schedule further.`);
        return;
      }
    }
  
    setIsSubmitting(true);
    let hasError = false;
  
    try {
      // Get AI model info
      const { data: aiModels } = await supabase
        .from('ai_models')
        .select('*')
        .eq('id', formData.ai_model_for_general_campaign)
        .single();

      if (!aiModels) {
        console.error('Selected model not found');
        toast.error("AI model not found");
        setIsSubmitting(false);
        return;
      }

      // Deduct tokens for campaign creation
      try {
        const deductResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/deductTokens`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            user_id: user.id,
            task_type: 'general_campaign_post',
            model_id: aiModels.api_model_id,
            include_image: false,
            include_meme: false,
            platform_count: formData.platforms.length
          }),
        });

        if (!deductResponse.ok) {
          const errorText = await deductResponse.text();
          if (deductResponse.status === 400 && errorText.includes('Insufficient token balance')) {
            toast.error("You don't have enough tokens to complete this task. Please add more tokens to continue.");
            setShowPricingModal(true);
            return;
          }
          console.error('[deductTokens] Error:', errorText);
          toast.error("Token deduction failed, but continuing with campaign creation");
        } else {
          const { token_balance } = await deductResponse.json();
          console.log('[deductTokens] ✅ Success - Remaining balance:', token_balance);
        }
      } catch (error) {
        console.error('[deductTokens] Unexpected error:', error);
        toast.error("Token deduction failed, but continuing with campaign creation");
      }
  
             // Calculate schedule_cron and next_run_at
       let schedule_cron = null;
       let next_run_at = null;
       const start_date = formData.startDate ? new Date(formData.startDate).toISOString() : null;
       const end_date = formData.endDate ? new Date(formData.endDate).toISOString() : null;
  
      if (formData.frequency.toLowerCase() !== "once") {
        const [hour, minute] = formData.scheduledTime?.split(":") ?? ["14", "00"];
        if (formData.frequency.toLowerCase() === "daily") {
          schedule_cron = `${minute} ${hour} * * *`;
        } else if (formData.frequency.toLowerCase() === "weekly") {
          // Get day of week from start date
          const startDate = new Date(formData.startDate);
          const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
          schedule_cron = `${minute} ${hour} * * ${dayOfWeek}`;
        }
        // Calculate the next run time in the user's timezone
        const userTimezone = formData.timezone || "UTC";
        const now = DateTime.now().setZone(userTimezone);
        const scheduledTime = now.set({ hour: parseInt(hour), minute: parseInt(minute), second: 0, millisecond: 0 });
        
        // If the scheduled time has already passed today, schedule for tomorrow
        let nextRunTime = scheduledTime;
        if (scheduledTime <= now) {
          nextRunTime = scheduledTime.plus({ days: 1 });
        }
        
        next_run_at = nextRunTime.toUTC().toISO();
      } else {
        next_run_at = DateTime.now().toUTC().toISO();
      }
  
      // Prepare the campaign data
      const baseCampaignData = {
        user_id: user.id,
        brand_id: formData.brandId && formData.brandId.trim() !== '' ? formData.brandId : null,
        campaign_name: formData.name || "Untitled Campaign",
        description: formData.description || null,
        is_active: true,
        goal: formData.goal || null,
        ai_intent: formData.ai_intent || null,
        ai_posting_frequency: formData.frequency.toLowerCase() || null,
        timezone: formData.timezone || "UTC",
        schedule_cron,
        next_run_at,
        start_date,
        end_date,
        target_audience_specific: formData.target_audience_specific ? { description: formData.target_audience_specific } : null,
        target_audience_psychographics: formData.target_audience_psychographics || null,
        ai_tone_preference: formData.ai_tone_preference.length > 0 ? formData.ai_tone_preference : null,
        ai_content_style_preference: formData.ai_content_style_preference.length > 0 ? formData.ai_content_style_preference : null,
        negative_constraints_campaign: formData.negative_constraints_campaign || null,
        cta_action: formData.cta_action || null,
        cta_link: formData.cta_link || null,
        post_length_type: formData.post_length_type || null,
        campaign_type: 'general',
        ai_model_for_general_campaign: formData.ai_model_for_general_campaign && formData.ai_model_for_general_campaign.trim() !== '' ? formData.ai_model_for_general_campaign : null,
        ai_extra_metadata: {
          custom_prompt: formData.customPrompt,
          platforms: formData.platforms
        }
      };

      // Handle multi-platform campaign
      if (formData.platforms.includes("website")) {
        // Website campaigns are handled separately
        const { data, error } = await supabase
          .from("campaigns")
          .insert({
            ...baseCampaignData,
            platforms: ['website'],
            target_platforms: ['website'],
            // Explicitly set page_id and social_id to null for website campaigns
            page_id: null,
            social_id: null
          })
          .select()
          .single();

        if (error || !data) {
          hasError = true;
          console.error("Error inserting website campaign:", error);
        } else {
          const campaignId = data.id;

          // Token deduction is handled inside generateFullBlogPost.ts

          // Find the selected model for blog generation
          const selectedModel = aiModels.find((m: any) => m.id === formData.ai_model_for_general_campaign);
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generateFullBlogPost`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            },
            body: JSON.stringify({
              brand: selectedBrand,
              campaignData: {
                goal: formData.goal,
                strategy: formData.ai_intent,
                tone: formData.ai_tone_preference?.[0] || "neutral",
                contentStyle: formData.ai_content_style_preference?.[0] || "educational",
                audience: formData.target_audience_psychographics || "general",
              },
              campaign_id: campaignId,
              model_id: selectedModel?.api_model_id || 'gpt-3.5-turbo',
            }),
          });

          if (!response.ok) {
            console.error("Blog post creation failed with status:", response.status);
            const errorText = await response.text();
            console.error("Error details:", errorText);

            try {
              const errorJson = JSON.parse(errorText);
              toast.error("Blog post creation failed", {
                description: errorJson?.error || "Unknown error"
              });
            } catch {
              toast.error("Blog post creation failed", {
                description: "Server returned an error"
              });
            }

            hasError = true;
          } else {
            const result = await response.json();
            console.log("Blog post creation result:", result);

            const { slug, embed_url } = result;

            if (!slug || !embed_url) {
              console.error("Missing slug or embed_url in blog post result:", result);
              toast.error("Blog generated, but embed info is missing.");
              hasError = true;
            } else {
              if (selectedBrand?.name) {
                setEmbedUrl(`${embed_url}?brand=${encodeURIComponent(selectedBrand.name)}`);
              } else {
                console.warn('No selectedBrand found when setting embed URL.');
                setEmbedUrl(embed_url);
              }
              setShowEmbedModal(true);
              toast.success("Blog created and ready to embed!");
            }
          }
        }
      } else {
        // Social media campaign - create a single campaign with multiple platforms
        // Collect page IDs and connection IDs for the selected platforms
        const targetPageIds: string[] = selectedPageIds;
        const targetConnectionIds: string[] = selectedConnectionIds;
        
        // Create a single campaign with arrays of platforms, page IDs, and connection IDs
        const { data, error } = await supabase
          .from("campaigns")
          .insert({
            ...baseCampaignData,
            target_platforms: formData.platforms,
            target_page_ids: targetPageIds.length > 0 ? targetPageIds : null,
            target_connection_ids: targetConnectionIds.length > 0 ? targetConnectionIds : null,
            // Set legacy fields to null to avoid conflicts
            page_id: null,
            social_id: null,
            platforms: null
          })
          .select()
          .single();

        if (error) {
          hasError = true;
          console.error("Error inserting multi-platform campaign:", error);
          toast.error("Failed to create campaign", {
            description: error.message
          });
        } else {
          toast.success("Campaign created successfully!");
          
          // Call generate-campaign-posts function to generate posts for all platforms
          try {
            // Deduct tokens before generating campaign posts
            // Find the selected model
            const selectedModel = aiModels.find((m: any) => m.id === formData.ai_model_for_general_campaign);
            
            const deductResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/deductTokens`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              },
              body: JSON.stringify({
                user_id: user.id,
                task_type: 'general_campaign_post',
                model_id: selectedModel?.api_model_id || 'gpt-3.5-turbo',
                include_image: false,
                include_meme: false,
                platform_count: formData.platforms.length
              })
            });

            if (!deductResponse.ok) {
              const errorText = await deductResponse.text();
              if (deductResponse.status === 400 && errorText.includes('Insufficient token balance')) {
                toast.error("You don't have enough tokens to complete this task. Please add more tokens to continue.");
                setShowPricingModal(true);
                return;
              }
              throw new Error('Insufficient tokens or server error');
            }

            const generatePostsRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-campaign-posts`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              },
              body: JSON.stringify({ campaign_id: data.id }),
            });

            if (!generatePostsRes.ok) {
              const errorText = await generatePostsRes.text();
              console.error("Error generating posts:", errorText);
              toast.error("Campaign created, but post generation failed", {
                description: "You may need to manually create posts for this campaign."
              });
            } else {
              const result = await generatePostsRes.json();
              console.log("Posts generated:", result);
              toast.success("Posts generated successfully!");
            }
          } catch (error) {
            console.error("Error calling generate-campaign-posts:", error);
            toast.error("Campaign created, but post generation failed", {
              description: "You may need to manually create posts for this campaign."
            });
          }
        }
      }
  
      // ✅ Final toast logic
      if (!hasError) {
        setJustCreatedCampaign(true);
        if (!formData.platforms.includes("website")) {
          onClose();
        }
      } else {
        toast.error("Some parts of your campaign failed to create.", {
          description: "Please check your selections and try again."
        });
      }
  
    } catch (error) {
      console.error("Unexpected error creating campaigns:", error);
      toast.error("Error creating campaign", {
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step configuration
  const getStepTitle = () => {
    if (campaignTypeStep === 'select') {
      return 'Choose Campaign Type';
    }
    
    switch (currentStep) {
      case 1: return 'Campaign & Brand';
      case 2: return 'Goal & Platform';
      case 3: return 'Content Strategy';
      case 4: return 'Scheduling & CTA';
      default: return 'Create Campaign';
    }
  };

  const getStepDescription = () => {
    if (campaignTypeStep === 'select') {
      return 'Select the type of campaign you want to create';
    }
    
    switch (currentStep) {
      case 1: return 'Set up your campaign basics and select a brand';
      case 2: return 'Choose your goal and target platform';
      case 3: return 'Define your content strategy and preferences';
      case 4: return 'Configure scheduling and call-to-action';
      default: return '';
    }
  };

  // Shared props for steps
  const stepProps = {
    formData,
    setFormData,
    brands,
    selectedBrand,
    socialPages,
    socialConnections,
    availablePages,
    availableConnections,
    selectedPageIds,
    setSelectedPageIds,
    selectedConnectionIds,
    setSelectedConnectionIds,
    shakingPlatform,
    setShakingPlatform,
    showPlatformToast,
    setShowPlatformToast,
    refreshingToken,
    setRefreshingToken,
    setShowPricingModal,
    fetchAvailablePages,
    fetchAvailableConnections,
    platforms
  };

  const renderContent = () => {
    if (campaignTypeStep === 'select') {
      return (
        <div className="space-y-6">
          {/* IMPROVED: More responsive grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* General Campaign Card */}
            <button
              onClick={handleGeneralCampaign}
              className="p-8 bg-dark-lighter border border-dark-border rounded-xl hover:border-primary/50 hover:shadow-glow transition-all duration-300 text-left group w-full"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors flex-shrink-0">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-white">General Campaign</h3>
              </div>
              <p className="text-white/70 mb-6 text-lg leading-relaxed">
                Flexible, ongoing content automation for consistent posting
              </p>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                  <span>Automated scheduling</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                  <span>Flexible content strategy</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                  <span>Multiple platform support</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                  <span>Ongoing content generation</span>
                </li>
              </ul>
            </button>

            {/* Journey Campaign Card */}
            <button
              onClick={handleJourneyCampaign}
              className="p-8 bg-dark-lighter border border-dark-border rounded-xl hover:border-secondary/50 hover:shadow-glow-blue transition-all duration-300 text-left group w-full"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors flex-shrink-0">
                  <Calendar className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Journey Campaign</h3>
              </div>
              <p className="text-white/70 mb-6 text-lg leading-relaxed">
                Structured, narrative-driven, day-by-day posts that tell a story
              </p>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary/60"></div>
                  <span>AI-generated journey map</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary/60"></div>
                  <span>Day-by-day narrative structure</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary/60"></div>
                  <span>Perfect for &quot;building in public&quot;</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary/60"></div>
                  <span>Cohesive storytelling arc</span>
                </li>
              </ul>
            </button>
          </div>
        </div>
      );
    }

    // General campaign steps
    switch (currentStep) {
      case 1:
        return <CampaignBasicsStep {...stepProps} setShowCreateBrandModal={setShowCreateBrandModal} />;
      case 2:
        return <GoalPlatformStep {...stepProps} />;
      case 3:
        return <ContentStrategyStep {...stepProps} />;
      case 4:
        return <SchedulingStep {...stepProps} setShowPricingModal={setShowPricingModal} />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    if (campaignTypeStep === 'select') return false;
    
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.brandId;
      case 2:
        return formData.platforms.length > 0 && formData.goal;
      case 3:
        return true; // Optional fields
      case 4:
        // Require AI model selection
        if (!formData.ai_model_for_general_campaign) {
          return false;
        }
        
        // Add validation for start and end dates if frequency is not 'once'
        if (formData.frequency.toLowerCase() !== "once") {
          if (!formData.startDate || !formData.endDate) {
            return false;
          }
          
          const startDate = new Date(formData.startDate);
          const endDate = new Date(formData.endDate);
          
          // Check if start date is before or equal to end date
          if (startDate > endDate) {
            return false;
          }
          
          // Check if campaign duration is within 90 days (hard cap)
          const daysDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDifference > 90) {
            return false;
          }
          
          return true;
        }
        return true;
      default:
        return false;
    }
  };

  const getActionButton = () => {
    if (campaignTypeStep === 'select') return null;
    
    const canContinue = canProceed();
    
    return (
      <div className="ml-auto">
        {/* Debug info - remove after testing */}
        {currentStep === 4 && !canContinue && (
          <div className="text-xs text-red-400 mb-2">
            {!formData.ai_model_for_general_campaign && "• AI model required"}
            {formData.frequency.toLowerCase() !== "once" && (!formData.startDate || !formData.endDate) && "• Start/end dates required"}
          </div>
        )}
        
        <button
          type="button"
          onClick={currentStep === 4 ? handleSubmit : handleNext}
          className="btn btn-primary"
          disabled={!canContinue || isSubmitting}
        >
          {isSubmitting ? 'Creating...' : (currentStep === 4 ? 'Create Campaign' : 'Next')}
        </button>
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={onClose}
            />
            
            <motion.div
              className={`relative bg-dark-card border border-dark-border rounded-2xl w-full overflow-hidden z-10 ${
                campaignTypeStep === 'select' ? 'max-w-5xl' : 'max-w-2xl'
              }`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] bg-primary/40"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-[80px] bg-secondary/40"></div>
              
              <div className="relative max-h-[calc(100vh-4rem)] min-h-[600px] flex flex-col overflow-hidden">
                <div className="sticky top-0 z-20 bg-dark-card border-b border-dark-border p-6">
                  <button
                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                    onClick={onClose}
                  >
                    <X size={20} />
                  </button>
              
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">
                      Create New <span className="text-gradient">Campaign</span>
                    </h2>
                    <p className="text-white/60">
                      {campaignTypeStep === 'select' ? 'Choose Campaign Type' : `Step ${currentStep} of 4: ${getStepTitle()}`}
                    </p>
                    <p className="text-white/50 text-sm mt-1">
                      {getStepDescription()}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {renderContent()}
                </div>
                
                <div className="sticky bottom-0 bg-dark-card border-t border-dark-border p-6">
                  <div className="flex justify-between">
                    {(currentStep > 1 || campaignTypeStep === 'general') && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="btn btn-secondary inline-flex items-center gap-2"
                        disabled={isSubmitting}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </button>
                    )}
                    
                    {getActionButton()}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreateBrandModal
        isOpen={showCreateBrandModal}
        onClose={() => setShowCreateBrandModal(false)}
        onBrandCreated={fetchBrands}
      />

      <JourneyCampaignModal
        isOpen={showJourneyModal}
        onClose={() => setShowJourneyModal(false)}
        onCampaignCreated={handleJourneyCampaignCreated}
        brands={brands}
      />

      <WebsiteEmbedModal
        isOpen={showEmbedModal}
        onClose={() => {
          setShowEmbedModal(false);
          onClose();
        }}
        embedUrl={embedUrl}
      />
    </>
  );
};

export default CreateBotModal;