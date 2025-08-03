'use client';

import React, { useEffect, useState } from 'react';
import { Building2, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import ParticleBackground from '@/components/ui/ParticleBackground';
import CreateBrandModal from '@/components/dashboard/CreateBrandModal';
import EditBrandModal from '@/components/dashboard/EditBrandModal';
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';
import AddTokensModal from '@/components/modals/AddTokensModal';
import { useAuth } from '@/lib/auth/provider';
import type { Database } from '@/lib/supabase/types';

type Brand = Database['public']['Tables']['brands']['Row'];

// Loading component
const BrandManagementLoading = () => (
  <div className="min-h-screen bg-dark relative overflow-hidden">
    <ParticleBackground />
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-white/70">Loading brands...</p>
      </div>
    </div>
  </div>
);

const BrandManagementClient: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const { user, signOut } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchBrands();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Filter brands based on search term
    if (searchTerm.trim() === '') {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
  }, [brands, searchTerm]);

  const fetchBrands = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

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
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleEditBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setShowEditModal(true);
  };

  const handleDeleteBrand = async (brand: Brand) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${brand.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brand.id)
        .eq('user_id', user?.id);

      if (error) {
        if (error.code === '23503') {
          toast.error("Cannot delete brand", {
            description: "This brand is being used by active campaigns. Please remove or reassign campaigns first."
          });
        } else {
          throw error;
        }
        return;
      }

      toast.success("Brand deleted successfully");
      fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error("Failed to delete brand", {
        description: "Please try again or contact support if the issue persists."
      });
    }
  };

  // Show loading state while data is loading
  if (loading) {
    return <BrandManagementLoading />;
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <ParticleBackground />
      
      <AuthenticatedNavbar
        onLogout={handleLogout}
        onTokenClick={() => setShowTokenModal(true)}
        userEmail={user?.email}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">
                Brand <span className="text-gradient">Management</span>
              </h1>
              <p className="text-white/70">
                Create and manage your brand profiles for targeted content creation
              </p>
            </div>
            
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary inline-flex items-center gap-2 mt-4 md:mt-0 shadow-elevation-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="h-4 w-4" />
              Create Brand
            </motion.button>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-lighter border border-dark-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-elevation-1"
              />
            </div>
          </div>

          {/* Brands Grid */}
          {filteredBrands.length === 0 ? (
            <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center shadow-elevation-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white/90">
                {searchTerm ? 'No brands found' : 'No Brands Yet'}
              </h3>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? `No brands match "${searchTerm}". Try a different search term.`
                  : "You haven't created any brands yet. Start by creating your first brand profile."
                }
              </p>
              {!searchTerm && (
                <motion.button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary shadow-elevation-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Your First Brand
                </motion.button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBrands.map((brand, index) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary/50 hover:shadow-glow transition-all duration-300 group card-touch shadow-elevation-2"
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  {/* Brand Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: (brand.primary_color || '#8A2BE2') + '20' }}
                      >
                        <Building2 
                          className="h-6 w-6" 
                          style={{ color: brand.primary_color || '#8A2BE2' }} 
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                          {brand.name}
                        </h3>
                        <p className="text-white/60 text-sm">
                          {brand.industry || 'No industry set'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        onClick={() => handleEditBrand(brand)}
                        className="p-2 text-white/60 hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                        title="Edit brand"
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteBrand(brand)}
                        className="p-2 text-white/60 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                        title="Delete brand"
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Brand Description */}
                  {brand.description && (
                    <p className="text-white/70 text-sm mb-4 line-clamp-3">
                      {brand.description}
                    </p>
                  )}

                  {/* Brand Details */}
                  <div className="space-y-2">
                    {brand.brand_voice && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Voice:</span>
                        <span className="text-white/80 text-sm font-medium">{brand.brand_voice}</span>
                      </div>
                    )}
                    
                    {brand.target_audience && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Audience:</span>
                        <span className="text-white/80 text-sm font-medium truncate ml-2">
                          {brand.target_audience.length > 30 
                            ? `${brand.target_audience.substring(0, 30)}...` 
                            : brand.target_audience
                          }
                        </span>
                      </div>
                    )}

                    {brand.core_values && brand.core_values.length > 0 && (
                      <div>
                        <span className="text-white/60 text-sm">Values:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {brand.core_values.slice(0, 3).map((value, idx) => (
                            <span 
                              key={idx}
                              className="text-xs px-2 py-1 bg-dark-lighter rounded-full text-white/70"
                            >
                              {value}
                            </span>
                          ))}
                          {brand.core_values.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-dark-lighter rounded-full text-white/70">
                              +{brand.core_values.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Brand Colors */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-dark-border">
                    <span className="text-white/60 text-sm">Colors:</span>
                    <div className="flex gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: brand.primary_color || '#8A2BE2' }}
                        title="Primary color"
                      />
                      <div 
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: brand.secondary_color || '#00BFFF' }}
                        title="Secondary color"
                      />
                    </div>
                    <span className="text-white/50 text-xs ml-auto">
                      Created {new Date(brand.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Modals */}
      <CreateBrandModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onBrandCreated={fetchBrands}
      />

      <EditBrandModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBrand(null);
        }}
        brand={selectedBrand}
        onBrandUpdated={fetchBrands}
      />

      <AddTokensModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
      />
    </div>
  );
};

export default BrandManagementClient;