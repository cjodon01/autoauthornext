'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ContentStrategySelectorProps {
  selectedTone?: string[];
  selectedStyle?: string[];
  onToneChange?: (tones: string[]) => void;
  onStyleChange?: (styles: string[]) => void;
  className?: string;
}

const toneOptions = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-focused' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
  { value: 'authoritative', label: 'Authoritative', description: 'Expert and confident' },
  { value: 'playful', label: 'Playful', description: 'Fun and energetic' },
  { value: 'inspiring', label: 'Inspiring', description: 'Motivational and uplifting' },
  { value: 'humorous', label: 'Humorous', description: 'Light-hearted and witty' },
  { value: 'empathetic', label: 'Empathetic', description: 'Understanding and caring' }
];

const styleOptions = [
  { value: 'educational', label: 'Educational', description: 'Teaching and informative' },
  { value: 'promotional', label: 'Promotional', description: 'Marketing and sales-focused' },
  { value: 'storytelling', label: 'Storytelling', description: 'Narrative and engaging' },
  { value: 'question', label: 'Question-based', description: 'Interactive and engaging' },
  { value: 'list', label: 'List/Tips', description: 'Structured and scannable' },
  { value: 'behind_scenes', label: 'Behind the Scenes', description: 'Transparent and authentic' },
  { value: 'user_generated', label: 'User-Generated', description: 'Community-focused' },
  { value: 'trending', label: 'Trending', description: 'Current and topical' }
];

const ContentStrategySelector: React.FC<ContentStrategySelectorProps> = ({
  selectedTone = [],
  selectedStyle = [],
  onToneChange,
  onStyleChange,
  className = ''
}) => {
  const handleToneToggle = (tone: string) => {
    if (!onToneChange) return;
    
    const newTones = selectedTone.includes(tone)
      ? selectedTone.filter(t => t !== tone)
      : [...selectedTone, tone];
    onToneChange(newTones);
  };

  const handleStyleToggle = (style: string) => {
    if (!onStyleChange) return;
    
    const newStyles = selectedStyle.includes(style)
      ? selectedStyle.filter(s => s !== style)
      : [...selectedStyle, style];
    onStyleChange(newStyles);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tone Selection */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-3">
          Content Tone
        </label>
        <p className="text-white/50 text-xs mb-4">
          Choose the tone that matches your brand voice
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {toneOptions.map((option) => (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => handleToneToggle(option.value)}
              className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                selectedTone.includes(option.value)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-dark-border bg-dark-lighter text-white/70 hover:text-white hover:border-primary/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title={option.description}
            >
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs opacity-60 mt-1">{option.description}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Style Selection */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-3">
          Content Style
        </label>
        <p className="text-white/50 text-xs mb-4">
          Select content formats that work best for your audience
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {styleOptions.map((option) => (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => handleStyleToggle(option.value)}
              className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                selectedStyle.includes(option.value)
                  ? 'border-secondary bg-secondary/10 text-secondary'
                  : 'border-dark-border bg-dark-lighter text-white/70 hover:text-white hover:border-secondary/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title={option.description}
            >
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs opacity-60 mt-1">{option.description}</div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentStrategySelector;