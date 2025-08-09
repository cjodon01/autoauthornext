import React from 'react';
import { Building2, Plus } from 'lucide-react';
import type { Database } from '../../../lib/supabase/types';

type Brand = Database['public']['Tables']['brands']['Row'];

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

interface CampaignBasicsStepProps {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
  brands: Brand[];
  selectedBrand: Brand | null;
  setShowCreateBrandModal: (show: boolean) => void;
}

const CampaignBasicsStep: React.FC<CampaignBasicsStepProps> = ({
  formData,
  setFormData,
  brands,
  selectedBrand,
  setShowCreateBrandModal
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1">
          Campaign Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="My Awesome Campaign"
          required
        />
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="brandId" className="block text-sm font-medium text-white/70">
            Select Brand
          </label>
          {brands.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCreateBrandModal(true)}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary-light transition-colors"
            >
              <Plus className="h-3 w-3" />
              Create New Brand
            </button>
          )}
        </div>
        
        {brands.length === 0 ? (
          <div className="bg-dark-border text-white/60 p-4 rounded-lg text-center">
            <Building2 className="h-8 w-8 mx-auto mb-2 text-white/40" />
            <p className="mb-3">No brands found. Create a brand first to continue.</p>
            <button
              type="button"
              onClick={() => setShowCreateBrandModal(true)}
              className="btn btn-primary text-sm"
            >
              Create Brand
            </button>
          </div>
        ) : (
          <select
            id="brandId"
            name="brandId"
            value={formData.brandId}
            onChange={handleInputChange}
            className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          >
            <option value="">Select a brand</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>
                {brand.name} {brand.industry && `(${brand.industry})`}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedBrand && (
        <div className="bg-dark-lighter border border-dark-border rounded-lg p-4">
          <h4 className="text-sm font-medium text-white/70 mb-2">Brand Information</h4>
          <div className="space-y-2 text-sm">
            {selectedBrand.description && (
              <p className="text-white/80">{selectedBrand.description}</p>
            )}
            {selectedBrand.target_audience && (
              <p className="text-white/60"><strong>Target Audience:</strong> {selectedBrand.target_audience}</p>
            )}
            {selectedBrand.brand_voice && (
              <p className="text-white/60"><strong>Brand Voice:</strong> {selectedBrand.brand_voice}</p>
            )}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-white/70 mb-1">
          Campaign Description (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
          placeholder="Describe the purpose and goals of this campaign..."
        />
      </div>
    </div>
  );
};

export default CampaignBasicsStep;