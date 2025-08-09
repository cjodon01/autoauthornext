'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Calendar, Zap, Map, Clock, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';
import type { Database } from '../../lib/supabase/types';

type Brand = Database['public']['Tables']['brands']['Row'];

interface JourneyCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated: () => void;
  brands: Brand[];
}

interface JourneyStep {
  day: number;
  title: string;
  description: string;
  content_type: string;
  platform: string;
}

const JourneyCampaignModal: React.FC<JourneyCampaignModalProps> = ({
  isOpen,
  onClose,
  onCampaignCreated,
  brands
}) => {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [journeyDuration, setJourneyDuration] = useState(7);
  const [journeyType, setJourneyType] = useState('build_in_public');
  const [generatedSteps, setGeneratedSteps] = useState<JourneyStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const journeyTypes = [
    {
      id: 'build_in_public',
      title: 'Build in Public',
      description: 'Share your journey of building a product or business',
      icon: Map,
      color: 'text-blue-500'
    },
    {
      id: 'learning_journey',
      title: 'Learning Journey',
      description: 'Document your learning process and insights',
      icon: Target,
      color: 'text-green-500'
    },
    {
      id: 'transformation',
      title: 'Transformation',
      description: 'Share a personal or professional transformation',
      icon: Zap,
      color: 'text-purple-500'
    }
  ];

  useEffect(() => {
    if (isOpen && brands.length > 0 && !selectedBrand) {
      setSelectedBrand(brands[0]);
    }
  }, [isOpen, brands, selectedBrand]);

  const handleGenerateJourney = async () => {
    if (!selectedBrand || !campaignName.trim()) {
      toast.error('Please select a brand and enter a campaign name');
      return;
    }

    setIsGenerating(true);

    try {
      // Generate journey steps using AI
      const steps = await generateJourneySteps(selectedBrand, campaignName, journeyType, journeyDuration);
      setGeneratedSteps(steps);
      setCurrentStep(2);
      toast.success('Journey map generated successfully!');
    } catch (error) {
      console.error('Error generating journey:', error);
      toast.error('Failed to generate journey map');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateJourneySteps = async (brand: Brand, name: string, type: string, duration: number): Promise<JourneyStep[]> => {
    // This should be called from an edge function instead of client-side
    // For now, return mock data
    return [
      {
        day: 1,
        title: "Introduction",
        description: "Introduce your journey and set expectations",
        content_type: "text",
        platform: "all"
      },
      {
        day: 2,
        title: "First Steps",
        description: "Take your first concrete action",
        content_type: "text",
        platform: "all"
      }
    ];
  };

  const handleCreateCampaign = async () => {
    if (!user || !selectedBrand || !campaignName.trim() || generatedSteps.length === 0) {
      toast.error('Missing required information');
      return;
    }

    setIsCreating(true);

    try {
      // Create the journey campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          user_id: user.id,
          brand_id: selectedBrand.id,
          campaign_name: campaignName,
          campaign_type: 'journey',
          is_active: true,
          journey_steps: generatedSteps,
          journey_duration: journeyDuration,
          journey_type: journeyType,
          description: `A ${journeyDuration}-day ${journeyType} journey campaign`
        })
        .select()
        .single();

      if (campaignError) {
        throw campaignError;
      }

      // Create pending posts for each journey step
      for (const step of generatedSteps) {
        await supabase
          .from('pending_posts')
          .insert({
            campaign_id: campaign.id,
            platform: step.platform,
            content: `[${step.title}] ${step.description}`,
            status: 'pending',
            scheduled_for: new Date(Date.now() + (step.day - 1) * 24 * 60 * 60 * 1000).toISOString(),
            user_id: user.id,
            brand_id: selectedBrand.id,
            journey_step: step.day
          });
      }

      toast.success('Journey campaign created successfully!');
      onCampaignCreated();
      onClose();
    } catch (error) {
      console.error('Error creating journey campaign:', error);
      toast.error('Failed to create journey campaign');
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Campaign Name *
        </label>
        <input
          type="text"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="e.g., My Startup Journey"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Select Brand *
        </label>
        <select
          value={selectedBrand?.id || ''}
          onChange={(e) => {
            const brand = brands.find(b => b.id === e.target.value);
            setSelectedBrand(brand || null);
          }}
          className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {brands.map(brand => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-3">
          Journey Type *
        </label>
        <div className="grid grid-cols-1 gap-3">
          {journeyTypes.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setJourneyType(type.id)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  journeyType === type.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-dark-border bg-dark-lighter text-white/70 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${type.color}`} />
                  <div>
                    <div className="font-medium">{type.title}</div>
                    <div className="text-sm opacity-70">{type.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Journey Duration *
        </label>
        <select
          value={journeyDuration}
          onChange={(e) => setJourneyDuration(Number(e.target.value))}
          className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={21}>21 days</option>
          <option value={30}>30 days</option>
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">
          Your Journey Map
        </h3>
        <p className="text-white/60">
          Review and customize your {journeyDuration}-day journey
        </p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {generatedSteps.map((step, index) => (
          <div
            key={step.day}
            className="p-4 bg-dark-lighter border border-dark-border rounded-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-medium">
                {step.day}
              </div>
              <h4 className="font-medium text-white">{step.title}</h4>
              <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">
                {step.platform}
              </span>
            </div>
            <p className="text-white/70 text-sm mb-2">{step.description}</p>
            <div className="text-xs text-white/50">
              Content type: {step.content_type}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] bg-secondary/40"></div>
            
            <div className="relative max-h-[90vh] flex flex-col">
              <div className="bg-dark-card border-b border-dark-border p-6">
                <button
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                  onClick={onClose}
                >
                  <X size={20} />
                </button>
                
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-6 w-6 text-secondary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Create <span className="text-gradient">Journey Campaign</span>
                  </h2>
                  <p className="text-white/60">
                    Step {currentStep} of 2: {currentStep === 1 ? 'Setup' : 'Review'}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {currentStep === 1 ? renderStep1() : renderStep2()}
              </div>

              <div className="bg-dark-card border-t border-dark-border p-6">
                <div className="flex justify-between">
                  {currentStep > 1 && (
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="btn btn-secondary inline-flex items-center gap-2"
                      disabled={isGenerating || isCreating}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  )}
                  
                  <div className="ml-auto">
                    {currentStep === 1 ? (
                      <button
                        onClick={handleGenerateJourney}
                        disabled={!selectedBrand || !campaignName.trim() || isGenerating}
                        className="btn btn-primary inline-flex items-center gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Map className="h-4 w-4" />
                            Generate Journey
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleCreateCampaign}
                        disabled={isCreating}
                        className="btn btn-primary inline-flex items-center gap-2"
                      >
                        {isCreating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4" />
                            Create Campaign
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default JourneyCampaignModal; 