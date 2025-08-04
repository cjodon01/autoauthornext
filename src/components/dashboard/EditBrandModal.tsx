'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';
import type { Database } from '../../lib/supabase/types';

type Brand = Database['public']['Tables']['brands']['Row'];

interface EditBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand | null;
  onBrandUpdated?: () => void;
}

const EditBrandModal: React.FC<EditBrandModalProps> = ({ 
  isOpen, 
  onClose, 
  brand,
  onBrandUpdated 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    target_audience: '',
    brand_voice: '',
    primary_color: '#8A2BE2',
    secondary_color: '#00BFFF',
    core_values: [''],
  });

  // Initialize form data when brand prop changes
  useEffect(() => {
    if (brand && isOpen) {
      setFormData({
        name: brand.name || '',
        description: brand.description || '',
        industry: brand.industry || '',
        target_audience: brand.target_audience || '',
        brand_voice: brand.brand_voice || '',
        primary_color: brand.primary_color || '#8A2BE2',
        secondary_color: brand.secondary_color || '#00BFFF',
        core_values: brand.core_values && brand.core_values.length > 0 ? brand.core_values : [''],
      });
    }
  }, [brand, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !brand) {
      toast.error("Authentication required");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    setLoading(true);

    try {
      // Filter out empty values from arrays
      const core_values = formData.core_values.filter(value => value.trim() !== '');

      const brandData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        target_audience: formData.target_audience.trim() || null,
        brand_voice: formData.brand_voice.trim() || null,
        industry: formData.industry.trim() || null,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        core_values: core_values.length > 0 ? core_values : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('brands')
        .update(brandData)
        .eq('id', brand.id)
        .eq('user_id', user.id);

      if (error) {
        if (error.code === '23505') {
          toast.error("Brand name already exists", {
            description: "Please choose a different name for your brand."
          });
        } else {
          throw error;
        }
        return;
      }

      toast.success("Brand updated successfully!");
      onBrandUpdated?.();
      onClose();

    } catch (error) {
      console.error('Error updating brand:', error);
      toast.error("Failed to update brand", {
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

  const addCoreValue = () => {
    setFormData(prev => ({
      ...prev,
      core_values: [...prev.core_values, '']
    }));
  };

  const updateCoreValue = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      core_values: prev.core_values.map((val, i) => i === index ? value : val)
    }));
  };

  const removeCoreValue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      core_values: prev.core_values.filter((_, i) => i !== index)
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && brand && (
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
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Edit <span className="text-gradient">Brand</span>
                  </h2>
                  <p className="text-white/60">
                    Update your brand profile settings
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Brand Name */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Enter your brand name"
                      required
                    />
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
                      placeholder="Describe your brand..."
                    />
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => updateFormData('industry', e.target.value)}
                      className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g., Technology, Healthcare, Finance"
                    />
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={formData.target_audience}
                      onChange={(e) => updateFormData('target_audience', e.target.value)}
                      className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Describe your target audience"
                    />
                  </div>

                  {/* Brand Voice */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Brand Voice
                    </label>
                    <select
                      value={formData.brand_voice}
                      onChange={(e) => updateFormData('brand_voice', e.target.value)}
                      className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select a voice</option>
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="casual">Casual</option>
                      <option value="authoritative">Authoritative</option>
                      <option value="playful">Playful</option>
                      <option value="inspiring">Inspiring</option>
                    </select>
                  </div>

                  {/* Brand Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => updateFormData('primary_color', e.target.value)}
                          className="w-12 h-12 bg-dark-lighter border border-dark-border rounded-lg"
                        />
                        <span className="text-white/60 text-sm">{formData.primary_color}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Secondary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) => updateFormData('secondary_color', e.target.value)}
                          className="w-12 h-12 bg-dark-lighter border border-dark-border rounded-lg"
                        />
                        <span className="text-white/60 text-sm">{formData.secondary_color}</span>
                      </div>
                    </div>
                  </div>

                  {/* Core Values */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Core Values
                    </label>
                    {formData.core_values.map((value, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateCoreValue(index, e.target.value)}
                          className="flex-1 bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Enter a core value"
                        />
                        {formData.core_values.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCoreValue(index)}
                            className="text-red-400 hover:text-red-300 p-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addCoreValue}
                      className="text-primary hover:text-primary-light text-sm"
                    >
                      + Add another value
                    </button>
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
                    disabled={loading || !formData.name.trim()}
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

export default EditBrandModal;