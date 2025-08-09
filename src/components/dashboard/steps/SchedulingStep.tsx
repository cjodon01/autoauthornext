import React, { useEffect, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';
import { useAuth } from '../../../lib/auth/provider';
import { toast } from 'sonner';
import type { CampaignFormData } from './CampaignBasicsStep';
import { useTokenBalance } from '../../../hooks/useTokenBalance';
import { useAiModels } from '../../../hooks/useAiModels';

interface SchedulingStepProps {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
  setShowPricingModal: (show: boolean) => void;
}

const SchedulingStep: React.FC<SchedulingStepProps> = ({
  formData,
  setFormData,
  setShowPricingModal
}) => {
  const { user } = useAuth();
  const supabase = createClient();
  const { tokenBalance, loading: tokenLoading } = useTokenBalance();
  const { aiModels, loading: modelsLoading } = useAiModels();
  
  // Debug logging
  useEffect(() => {
    console.log('🎯 SchedulingStep - AI Models state:', { aiModels, modelsLoading, count: aiModels.length });
  }, [aiModels, modelsLoading]);
  const [userTier, setUserTier] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  const tierRank = { free: 0, starter: 1, pro: 2, team: 3, enterprise: 4 };

  useEffect(() => {
    if (user) {
      fetchUserTier();
    }
  }, [user]);

  const fetchUserTier = async () => {
    if (!user) return;

    try {
      // Fetch user tier
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tier')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        setUserTier('free');
      } else {
        setUserTier(profile?.tier || 'free');
      }
    } catch (error) {
      console.error('Error fetching user tier:', error);
      setUserTier('free');
    } finally {
      setLoading(false);
    }
  };

  const isModelAccessible = (model: any) => {
    if (!model.min_tier) return true; // No tier restriction
    
    const tierRankings = { free: 0, starter: 1, pro: 2, team: 3, enterprise: 4 };
    const userTierRank = tierRankings[userTier as keyof typeof tierRankings] || 0;
    const modelTierRank = tierRankings[model.min_tier as keyof typeof tierRankings] || 0;
    
    return userTierRank >= modelTierRank;
  };

  useEffect(() => {
    if (
      !formData.ai_model_for_general_campaign &&
      aiModels.length > 0 &&
      !modelsLoading &&
      userTier
    ) {
      // Find the best accessible model for the user's tier
      const accessibleModels = aiModels.filter(model => isModelAccessible(model));
      
      // Try to find GPT-3.5 first as default
      let defaultModel = accessibleModels.find(
        (m) => m.api_model_id === 'gpt-3.5-turbo'
      );
      
      // If GPT-3.5 not available, use the first accessible model
      if (!defaultModel && accessibleModels.length > 0) {
        defaultModel = accessibleModels[0];
      }
      
      if (defaultModel) {
        setFormData((prev) => ({
          ...prev,
          ai_model_for_general_campaign: defaultModel.id
        }));
      }
    }
  }, [formData.ai_model_for_general_campaign, aiModels, modelsLoading, userTier]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Posting Frequency
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['daily', 'weekly', 'monthly'].map(freq => (
            <button
              key={freq}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, frequency: freq }))}
              className={`p-3 rounded-lg border ${
                formData.frequency === freq
                  ? 'border-primary bg-primary/20 text-white'
                  : 'border-dark-border bg-dark-lighter text-white/70 hover:border-white/40'
              } transition-colors capitalize`}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="scheduledTime" className="block text-sm font-medium text-white/70 mb-1">
            Scheduled Time
          </label>
          <input
            type="time"
            id="scheduledTime"
            name="scheduledTime"
            value={formData.scheduledTime}
            onChange={handleInputChange}
            className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-white/70 mb-1">
            Timezone
          </label>
          <select
            id="timezone"
            name="timezone"
            value={formData.timezone}
            onChange={handleInputChange}
            className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-white/70 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-white/70 mb-1">
            End Date (Optional)
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* AI Model Selection */}
      <div>
        <label htmlFor="ai_model_for_general_campaign" className="block text-sm font-medium text-white/70 mb-1">
          AI Model {modelsLoading && <span className="text-xs text-white/40">(Loading...)</span>}
        </label>
        
        {modelsLoading ? (
          <div className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white/60">
            Loading AI models...
          </div>
        ) : aiModels.length === 0 ? (
          <div className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white/60">
            No AI models available
          </div>
        ) : (
          <select
            id="ai_model_for_general_campaign"
            name="ai_model_for_general_campaign"
            value={formData.ai_model_for_general_campaign || ''}
            onChange={handleInputChange}
            className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select an AI model</option>
            {aiModels
              .filter(model => isModelAccessible(model))
              .map(model => (
                <option key={model.id} value={model.id}>
                  {model.model_name} {model.min_tier && model.min_tier !== 'free' ? `[${model.min_tier}+]` : ''}
                </option>
              ))}
            {aiModels
              .filter(model => !isModelAccessible(model))
              .map(model => (
                <option key={model.id} value={model.id} disabled>
                  {model.model_name} [Requires {model.min_tier}+ tier]
                </option>
              ))}
          </select>
        )}
        
        {!tokenLoading && tokenBalance !== null && (
          <div className="mt-2 text-xs text-white/60">
            Current token balance: {tokenBalance}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulingStep;