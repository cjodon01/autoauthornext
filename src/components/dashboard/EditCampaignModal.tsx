'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/provider';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Campaign = Database['public']['Tables']['campaigns']['Row'] & {
  social_connections?: {
    provider: string;
  } | null;
  social_pages?: {
    page_name: string;
  } | null;
  brands?: {
    name: string;
    industry: string | null;
  } | null;
  target_platforms?: string[] | null;
  target_page_ids?: string[] | null;
  target_connection_ids?: string[] | null;
  platforms?: string[] | null; // Legacy field for backward compatibility
  start_date?: string | null; // Campaign start date
  end_date?: string | null; // Campaign end date
  campaign_type?: string | null; // Campaign type (general, journey, etc.)
};

type Brand = Database['public']['Tables']['brands']['Row'];

interface EditCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onCampaignUpdated?: () => void;
}

const EditCampaignModal: React.FC<EditCampaignModalProps> = ({ 
  isOpen, 
  onClose, 
  campaign, 
  onCampaignUpdated 
}) => {
  const { user } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  const [formData, setFormData] = useState({
    campaign_name: '',
    brand_id: '',
    description: '',
    goal: '',
    ai_intent: '',
    ai_posting_frequency: '',
    timezone: '',
    scheduledTime: '19:00',
    is_active: true,
    end_date: '',
    start_date: ''
  });

  // Fetch brands on mount
  useEffect(() => {
    if (user && isOpen) {
      fetchBrands();
    }
  }, [user, isOpen]);

  // Populate form when campaign changes
  useEffect(() => {
    if (campaign && isOpen) {
      // Parse schedule_cron to get time
      let scheduledTime = '19:00';
      if (campaign.schedule_cron) {
        try {
          const parts = campaign.schedule_cron.split(' ');
          if (parts.length >= 2) {
            const minute = parts[0];
            const hour = parts[1];
            const hourNum = parseInt(hour);
            const minuteNum = parseInt(minute);
            
            if (!isNaN(hourNum) && !isNaN(minuteNum)) {
              scheduledTime = `${hourNum.toString().padStart(2, '0')}:${minuteNum.toString().padStart(2, '0')}`;
            }
          }
        } catch (error) {
          console.error('Error parsing cron expression:', error);
        }
      }

      setFormData({
        campaign_name: campaign.campaign_name || '',
        brand_id: campaign.brand_id || '',
        description: campaign.description || '',
        goal: campaign.goal || '',
        ai_intent: campaign.ai_intent || '',
        ai_posting_frequency: campaign.ai_posting_frequency || '',
        timezone: campaign.timezone || 'UTC',
        scheduledTime,
        is_active: campaign.is_active || false,
        end_date: campaign.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : '',
        start_date: campaign.start_date ? new Date(campaign.start_date).toISOString().split('T')[0] : ''
      });
    }
  }, [campaign, isOpen]);

  const fetchBrands = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching brands:', error);
        setBrands([]);
      } else {
        setBrands(data || []);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !campaign) {
      toast.error("Authentication required");
      return;
    }

    if (!formData.campaign_name.trim()) {
      toast.error("Campaign name is required");
      return;
    }

    setLoading(true);

    try {
      // Calculate schedule_cron from scheduledTime
      let schedule_cron = null;
      if (formData.ai_posting_frequency && formData.ai_posting_frequency !== 'once') {
        const [hour, minute] = formData.scheduledTime.split(':');
        if (formData.ai_posting_frequency === 'daily') {
          schedule_cron = `${minute} ${hour} * * *`;
        } else if (formData.ai_posting_frequency === 'weekly') {
          // Default to Monday (1) for weekly
          schedule_cron = `${minute} ${hour} * * 1`;
        }
      }

      const updateData = {
        campaign_name: formData.campaign_name.trim(),
        brand_id: formData.brand_id || null,
        description: formData.description.trim() || null,
        goal: formData.goal || null,
        ai_intent: formData.ai_intent || null,
        ai_posting_frequency: formData.ai_posting_frequency || null,
        timezone: formData.timezone || 'UTC',
        schedule_cron,
        is_active: formData.is_active,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', campaign.id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast.success("Campaign updated successfully!");
      onCampaignUpdated?.();
      onClose();

    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error("Failed to update campaign", {
        description: "Please try again or contact support if the issue persists."
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && campaign && (
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
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] bg-primary/40"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-[80px] bg-secondary/40"></div>
            
            <div className="relative max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="bg-dark-card border-b border-dark-border p-6">
                <button
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                  onClick={onClose}
                >
                  <X size={20} />
                </button>
                
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Edit <span className="text-gradient">Campaign</span>
                  </h2>
                  <p className="text-white/60">
                    Update your campaign settings
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Campaign Name */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      value={formData.campaign_name}
                      onChange={(e) => updateFormData('campaign_name', e.target.value)}
                      className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Enter campaign name"
                      required
                    />
                  </div>

                  {/* Brand Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Brand
                    </label>
                    <select
                      value={formData.brand_id}
                      onChange={(e) => updateFormData('brand_id', e.target.value)}
                      className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select a brand</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 h-24"
                      placeholder="Describe your campaign goals and strategy..."
                    />
                  </div>

                  {/* Goal */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Campaign Goal
                    </label>
                    <select
                      value={formData.goal}
                      onChange={(e) => updateFormData('goal', e.target.value)}
                      className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select a goal</option>
                      <option value="awareness">Brand Awareness</option>
                      <option value="engagement">Engagement</option>
                      <option value="leads">Lead Generation</option>
                      <option value="sales">Sales</option>
                      <option value="traffic">Website Traffic</option>
                    </select>
                  </div>

                  {/* Strategy */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      AI Intent/Strategy
                    </label>
                    <select
                      value={formData.ai_intent}
                      onChange={(e) => updateFormData('ai_intent', e.target.value)}
                      className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select strategy</option>
                      <option value="educational">Educational</option>
                      <option value="promotional">Promotional</option>
                      <option value="entertaining">Entertaining</option>
                      <option value="inspirational">Inspirational</option>
                      <option value="informational">Informational</option>
                    </select>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Posting Frequency
                    </label>
                    <select
                      value={formData.ai_posting_frequency}
                      onChange={(e) => updateFormData('ai_posting_frequency', e.target.value)}
                      className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select frequency</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="once">One-time</option>
                    </select>
                  </div>

                  {/* Time and Timezone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Scheduled Time
                      </label>
                      <input
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => updateFormData('scheduledTime', e.target.value)}
                        className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Timezone
                      </label>
                      <select
                        value={formData.timezone}
                        onChange={(e) => updateFormData('timezone', e.target.value)}
                        className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
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

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => updateFormData('start_date', e.target.value)}
                        className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => updateFormData('end_date', e.target.value)}
                        className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => updateFormData('is_active', e.target.checked)}
                      className="w-4 h-4 text-primary bg-dark-lighter border-dark-border rounded focus:ring-primary focus:ring-2"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-white/70">
                      Campaign is active
                    </label>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="bg-dark-card border-t border-dark-border p-6">
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !formData.campaign_name.trim()}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditCampaignModal;