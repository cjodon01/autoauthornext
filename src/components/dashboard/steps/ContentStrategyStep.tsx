import React from 'react';
import type { CampaignFormData } from './CampaignBasicsStep';

interface ContentStrategyStepProps {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
}

const ContentStrategyStep: React.FC<ContentStrategyStepProps> = ({
  formData,
  setFormData
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (field: 'ai_tone_preference' | 'ai_content_style_preference', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Content Strategy
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['SEO', 'Trending', 'Manual'].map(strategy => (
            <button
              key={strategy}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, ai_intent: strategy }))}
              className={`p-3 rounded-lg border ${
                formData.ai_intent === strategy
                  ? 'border-primary bg-primary/20 text-white'
                  : 'border-dark-border bg-dark-lighter text-white/70 hover:border-white/40'
              } transition-colors`}
            >
              {strategy}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Tone Preferences (Select Multiple)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['professional', 'casual', 'friendly', 'authoritative', 'humorous', 'inspirational'].map(tone => (
            <button
              key={tone}
              type="button"
              onClick={() => handleMultiSelect('ai_tone_preference', tone)}
              className={`p-2 rounded-lg border text-sm ${
                formData.ai_tone_preference.includes(tone)
                  ? 'border-primary bg-primary/20 text-white'
                  : 'border-dark-border bg-dark-lighter text-white/70 hover:border-white/40'
              } transition-colors capitalize`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Content Style (Select Multiple)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['educational', 'promotional', 'storytelling', 'news_update', 'behind_scenes', 'user_generated'].map(style => (
            <button
              key={style}
              type="button"
              onClick={() => handleMultiSelect('ai_content_style_preference', style)}
              className={`p-2 rounded-lg border text-sm ${
                formData.ai_content_style_preference.includes(style)
                  ? 'border-primary bg-primary/20 text-white'
                  : 'border-dark-border bg-dark-lighter text-white/70 hover:border-white/40'
              } transition-colors`}
            >
              {style.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="target_audience_specific" className="block text-sm font-medium text-white/70 mb-1">
          Specific Target Audience (Optional)
        </label>
        <textarea
          id="target_audience_specific"
          name="target_audience_specific"
          value={formData.target_audience_specific}
          onChange={handleInputChange}
          className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
          placeholder="Describe specific audience segments for this campaign..."
        />
      </div>

      <div>
        <label htmlFor="customPrompt" className="block text-sm font-medium text-white/70 mb-1">
          Custom Instructions (Optional)
        </label>
        <textarea
          id="customPrompt"
          name="customPrompt"
          value={formData.customPrompt}
          onChange={handleInputChange}
          className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
          placeholder="Any specific instructions for content generation..."
        />
      </div>
    </div>
  );
};

export default ContentStrategyStep;