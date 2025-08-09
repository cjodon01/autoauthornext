import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { CampaignFormData } from './CampaignBasicsStep';
import type { Database } from '../../../lib/supabase/types';

type SocialPage = Database['public']['Tables']['social_pages']['Row'];
type SocialConnection = Database['public']['Tables']['social_connections']['Row'];

interface Platform {
  name: string;
  key: string;
  icon: string;
  color: string;
}

interface GoalPlatformStepProps {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
  availablePages: SocialPage[];
  availableConnections: SocialConnection[];
  selectedPageIds: string[];
  setSelectedPageIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectedConnectionIds: string[];
  setSelectedConnectionIds: React.Dispatch<React.SetStateAction<string[]>>;
  shakingPlatform: string | null;
  setShakingPlatform: React.Dispatch<React.SetStateAction<string | null>>;
  showPlatformToast: boolean;
  setShowPlatformToast: React.Dispatch<React.SetStateAction<boolean>>;
  refreshingToken: boolean;
  setRefreshingToken: React.Dispatch<React.SetStateAction<boolean>>;
  setShowPricingModal: (show: boolean) => void;
  fetchAvailablePages: () => void;
  fetchAvailableConnections: () => void;
  platforms: Platform[];
}

const GoalPlatformStep: React.FC<GoalPlatformStepProps> = ({
  formData,
  setFormData,
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
}) => {
  const handleMultiSelect = (field: 'platforms', value: string) => {
    if (field === 'platforms') {
      // Allow multiple platform selection
      setFormData(prev => {
        const updatedPlatforms = prev.platforms.includes(value)
          ? prev.platforms.filter(p => p !== value) // Remove if already selected
          : [...prev.platforms, value]; // Add if not selected
        
        return {
          ...prev,
          platforms: updatedPlatforms
        };
      });
      
      // If a platform is deselected, remove any associated page or connection selections
      if (formData.platforms.includes(value)) {
        // Remove page selections for this platform
        const platformPages = availablePages.filter(page => 
          page.provider?.toLowerCase() === value.toLowerCase()
        );
        const platformPageIds = platformPages.map(page => page.id);
        
        setSelectedPageIds(prev => 
          prev.filter(id => !platformPageIds.includes(id))
        );
        
        // Remove connection selections for this platform
        const platformConnections = availableConnections.filter(conn => 
          conn.provider?.toLowerCase() === value.toLowerCase()
        );
        const platformConnectionIds = platformConnections.map(conn => conn.id);
        
        setSelectedConnectionIds(prev => 
          prev.filter(id => !platformConnectionIds.includes(id))
        );
      }
    }
  };

  const togglePageSelection = (pageId: string) => {
    setSelectedPageIds(prev => {
      const newSelection = prev.includes(pageId)
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId];
      return newSelection;
    });
  };
  
  const toggleConnectionSelection = (connectionId: string) => {
    setSelectedConnectionIds(prev => {
      const newSelection = prev.includes(connectionId)
        ? prev.filter(id => id !== connectionId)
        : [...prev, connectionId];
      return newSelection;
    });
  };

  const handleRefreshToken = async () => {
    if (refreshingToken) return;
    
    setRefreshingToken(true);
    
    try {
      // Refresh both pages and connections
      await fetchAvailablePages();
      await fetchAvailableConnections();
      // toast.success('Accounts refreshed successfully');
    } catch (error) {
      console.error("Refresh error:", error);
      // toast.error("Failed to refresh accounts");
    } finally {
      setRefreshingToken(false);
    }
  };

  // Group connections by platform for better organization
  const connectionsByPlatform = availableConnections.reduce((acc, conn) => {
    const provider = conn.provider?.toLowerCase() || 'unknown';
    if (!acc[provider]) acc[provider] = [];
    acc[provider].push(conn);
    return acc;
  }, {} as Record<string, SocialConnection[]>);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Campaign Goal
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['brand_awareness', 'lead_generation', 'sales', 'engagement', 'traffic', 'education'].map(goal => (
            <button
              key={goal}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, goal }))}
              className={`p-3 rounded-lg border ${
                formData.goal === goal
                  ? 'border-primary bg-primary/20 text-white'
                  : 'border-dark-border bg-dark-lighter text-white/70 hover:border-white/40'
              } transition-colors text-sm`}
            >
              {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-white/70 mb-2">
          Platforms (Select Multiple)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['Facebook', 'Twitter', 'Reddit', 'LinkedIn', 'Website'].map(platform => {
            const isSelected = formData.platforms.includes(platform.toLowerCase());
            const isShaking = shakingPlatform === platform.toLowerCase();
            
            return (
              <motion.button
                key={platform}
                type="button"
                onClick={() => handleMultiSelect('platforms', platform.toLowerCase())}
                className={`p-3 rounded-lg border ${
                  isSelected
                    ? 'border-primary bg-primary/20 text-white'
                    : 'border-dark-border bg-dark-lighter text-white/70 hover:border-white/40'
                } transition-colors`}
                animate={isShaking ? {
                  x: [-2, 2, -2, 2, 0],
                  transition: { duration: 0.5 }
                } : {}}
              >
                {platform}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Facebook/Instagram Pages Selection */}
      {formData.platforms.some(p => ['facebook', 'instagram'].includes(p)) && (
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Select Pages to Post From
          </label>
          <p className="text-xs text-white/50 mb-2">
            Click on a page below to select it for your campaign
          </p>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availablePages.length > 0 ? (
              availablePages.map(page => {
                const isSelected = selectedPageIds.includes(page.id);
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => togglePageSelection(page.id)}
                    className={`w-full p-4 rounded-lg border transition-all duration-200 text-left relative group ${
                      isSelected
                        ? 'border-primary bg-primary/20 text-white shadow-glow'
                        : 'border-dark-border bg-dark-lighter text-white/70 hover:border-primary/50 hover:bg-dark-border'
                    }`}
                  >
                    {/* Selection indicator */}
                    <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary' 
                        : 'border-white/30 group-hover:border-primary/50'
                    }`}>
                      {isSelected && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    
                    <div className="pr-8">
                      <div className={`font-medium ${isSelected ? 'text-white' : 'text-white/90'}`}>
                        {page.page_name}
                      </div>
                      <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-white/60'}`}>
                        {page.page_category || 'No category'} • {(page.provider?.charAt(0).toUpperCase() || '') + (page.provider?.slice(1) || '')}
                      </div>
                      {page.page_description && (
                        <div className={`text-xs mt-1 ${isSelected ? 'text-white/70' : 'text-white/50'}`}>
                          {page.page_description.length > 60 
                            ? `${page.page_description.substring(0, 60)}...` 
                            : page.page_description
                          }
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-white/60 text-sm p-4 bg-dark-lighter rounded-lg border border-dark-border">
                No connected pages found. Please connect your social media accounts first.
              </div>
            )}
          </div>
          
          {/* Selection summary */}
          {selectedPageIds.length > 0 && (
            <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="text-sm text-primary font-medium">
                ✓ {selectedPageIds.length} page{selectedPageIds.length > 1 ? 's' : ''} selected
              </div>
              <div className="text-xs text-white/70 mt-1">
                {availablePages
                  .filter(page => selectedPageIds.includes(page.id))
                  .map(page => page.page_name)
                  .join(', ')
                }
              </div>
            </div>
          )}
        </div>
      )}

      {/* Social Connections Selection (Twitter, LinkedIn, Reddit) */}
      {formData.platforms.some(p => ['twitter', 'linkedin', 'reddit'].includes(p)) && (
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Select Accounts to Post From
          </label>
          <p className="text-xs text-white/50 mb-2">
            Choose which accounts to use for each platform
          </p>
          
          {/* Group connections by platform */}
          {Object.entries(connectionsByPlatform).map(([platform, connections]) => {
            // Only show platforms that are selected in formData.platforms
            if (!formData.platforms.includes(platform)) return null;
            
            // Find platform info for display
            const platformInfo = platforms.find(p => p.key === platform) || {
              name: platform.charAt(0).toUpperCase() + platform.slice(1),
              color: '#666'
            };
            
            return (
              <div key={platform} className="mb-4">
                <h4 className="text-sm font-medium text-white/80 mb-2" style={{ color: platformInfo.color }}>
                  {platformInfo.name} Accounts
                </h4>
                
                <div className="space-y-2">
                  {connections.length > 0 ? (
                    connections.map(connection => {
                      const isSelected = selectedConnectionIds.includes(connection.id);
                      return (
                        <button
                          key={connection.id}
                          type="button"
                          onClick={() => toggleConnectionSelection(connection.id)}
                          className={`w-full p-4 rounded-lg border transition-all duration-200 text-left relative group ${
                            isSelected
                              ? 'border-primary bg-primary/20 text-white shadow-glow'
                              : 'border-dark-border bg-dark-lighter text-white/70 hover:border-primary/50 hover:bg-dark-border'
                          }`}
                        >
                          {/* Selection indicator */}
                          <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary' 
                              : 'border-white/30 group-hover:border-primary/50'
                          }`}>
                            {isSelected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          
                          <div className="pr-8">
                            <div className={`font-medium ${isSelected ? 'text-white' : 'text-white/90'}`}>
                              {`${platformInfo.name} Account`}
                            </div>
                            <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-white/60'}`}>
                              {connection.account_name || connection.account_id || 'Personal Account'} • {platformInfo.name}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-white/60 text-sm p-4 bg-dark-lighter rounded-lg border border-dark-border">
                      No connected {platformInfo.name} accounts found. Please connect your account first.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Selection summary for connections */}
          {selectedConnectionIds.length > 0 && (
            <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="text-sm text-primary font-medium">
                ✓ {selectedConnectionIds.length} account{selectedConnectionIds.length > 1 ? 's' : ''} selected
              </div>
              <div className="text-xs text-white/70 mt-1">
                {availableConnections
                  .filter(conn => selectedConnectionIds.includes(conn.id))
                  .map(conn => {
                    const platformInfo = platforms.find(p => p.key === conn.provider) || { name: conn.provider || 'Unknown' };
                    return `${platformInfo.name} (${platformInfo.name})`;
                  })
                  .join(', ')
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoalPlatformStep;