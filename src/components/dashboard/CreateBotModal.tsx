'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Calendar, Zap, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';
import type { Database } from '../../lib/supabase/types';

type Brand = Database['public']['Tables']['brands']['Row'];

interface CreateBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateBotModal: React.FC<CreateBotModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const supabase = createClient();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brandId: '',
    description: '',
    goal: 'awareness',
    frequency: 'daily',
    scheduledTime: '09:00',
    timezone: 'UTC'
  });

  useEffect(() => {
    if (isOpen && user) {
      fetchBrands();
    }
  }, [isOpen, user]);

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
        // Auto-select first brand if available
        if (data && data.length > 0 && !formData.brandId) {
          setFormData(prev => ({ ...prev, brandId: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Authentication required");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Campaign name is required");
      return;
    }

    if (!formData.brandId) {
      toast.error("Please select a brand");
      return;
    }

    setLoading(true);

    try {
      // Create a basic campaign
      const campaignData = {
        user_id: user.id,
        brand_id: formData.brandId,
        campaign_name: formData.name.trim(),
        description: formData.description.trim() || null,
        goal: formData.goal,
        ai_posting_frequency: formData.frequency,
        timezone: formData.timezone,
        is_active: true,
        campaign_type: 'general',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('campaigns')
        .insert(campaignData);

      if (error) {
        throw error;
      }

      toast.success("Campaign created successfully!");
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        brandId: '',
        description: '',
        goal: 'awareness',
        frequency: 'daily',
        scheduledTime: '09:00',
        timezone: 'UTC'
      });

    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error("Failed to create campaign", {
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
                    Create New <span className="text-gradient">Campaign</span>
                  </h2>
                  <p className="text-white/60">
                    Set up your automated content campaign
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
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Enter campaign name"
                      required
                    />
                  </div>

                  {/* Brand Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Brand *
                    </label>
                    <select
                      value={formData.brandId}
                      onChange={(e) => updateFormData('brandId', e.target.value)}
                      className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
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
                      <option value="awareness">Brand Awareness</option>
                      <option value="engagement">Engagement</option>
                      <option value="leads">Lead Generation</option>
                      <option value="sales">Sales</option>
                      <option value="traffic">Website Traffic</option>
                    </select>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Posting Frequency
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => updateFormData('frequency', e.target.value)}
                      className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="once">One-time</option>
                    </select>
                  </div>

                  {/* Time */}
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
                    disabled={loading || !formData.name.trim() || !formData.brandId}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    {loading ? 'Creating...' : 'Create Campaign'}
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

export default CreateBotModal;