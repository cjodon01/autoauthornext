'use client';

import React from 'react';
import { Coins, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface TokenCostDisplayProps {
  baseCost?: number;
  platformCount?: number;
  includeImage?: boolean;
  includeMeme?: boolean;
  modelMultiplier?: number;
  className?: string;
}

const TokenCostDisplay: React.FC<TokenCostDisplayProps> = ({
  baseCost = 1,
  platformCount = 1,
  includeImage = false,
  includeMeme = false,
  modelMultiplier = 1,
  className = ''
}) => {
  const calculateTotalCost = () => {
    let total = baseCost * modelMultiplier;
    
    // Additional cost for multiple platforms
    if (platformCount > 1) {
      total += (platformCount - 1) * 0.5;
    }
    
    // Additional cost for image generation
    if (includeImage) {
      total += 2;
    }
    
    // Additional cost for meme generation
    if (includeMeme) {
      total += 1.5;
    }
    
    return Math.round(total * 100) / 100; // Round to 2 decimal places
  };

  const totalCost = calculateTotalCost();

  const getCostBreakdown = () => {
    const breakdown = [];
    
    breakdown.push({
      label: 'Base content generation',
      cost: baseCost * modelMultiplier,
      description: 'AI model usage for text generation'
    });
    
    if (platformCount > 1) {
      breakdown.push({
        label: `Multi-platform (${platformCount} platforms)`,
        cost: (platformCount - 1) * 0.5,
        description: 'Additional cost for platform-specific formatting'
      });
    }
    
    if (includeImage) {
      breakdown.push({
        label: 'Image generation',
        cost: 2,
        description: 'AI-generated images for your post'
      });
    }
    
    if (includeMeme) {
      breakdown.push({
        label: 'Meme generation',
        cost: 1.5,
        description: 'AI-generated meme content'
      });
    }
    
    return breakdown;
  };

  const breakdown = getCostBreakdown();

  return (
    <motion.div 
      className={`bg-dark-lighter border border-dark-border rounded-lg p-4 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-white/70">Token Cost</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-primary">{totalCost}</span>
          <span className="text-sm text-white/60">tokens</span>
        </div>
      </div>
      
      {breakdown.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs text-white/50 mb-2">
            <Info className="h-3 w-3" />
            <span>Cost breakdown:</span>
          </div>
          {breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary/60"></div>
                <span className="text-white/60">{item.label}</span>
              </div>
              <span className="text-white/80 font-medium">{item.cost}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-dark-border">
        <div className="text-xs text-white/50">
          Costs are deducted from your token balance when content is generated.
        </div>
      </div>
    </motion.div>
  );
};

export default TokenCostDisplay;