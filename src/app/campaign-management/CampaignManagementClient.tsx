'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Zap, Plus, Edit, Trash2, Search, Play, Pause, Clock, Target, Globe, Calendar, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';
import ParticleBackground from '../../components/ui/ParticleBackground';
import CreateBotModal from '../../components/dashboard/CreateBotModal';
import EditCampaignModal from '../../components/dashboard/EditCampaignModal';
import TokenBalance from '../../components/ui/TokenBalance';
import AuthenticatedNavbar from '../../components/layout/AuthenticatedNavbar';
import type { Database } from '../../lib/supabase/types';
import { DateTime } from 'luxon';

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

// Loading component
const CampaignManagementLoading = () => (
  <div className="min-h-screen bg-dark relative overflow-hidden">
    <ParticleBackground />
    <nav className="bg-dark-lighter border-b border-dark-border relative z-10 sticky-header safe-area-top">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img
              src="/images/favicon.svg"
              alt="AutoAuthor logo"
              className="h-6 w-6"
            />
            <span className="font-display font-semibold text-gradient">AutoAuthor.cc</span>
          </div>
          <div className="w-32 h-4 bg-dark-border rounded animate-pulse"></div>
        </div>
      </div>
    </nav>
    <main className="container mx-auto px-4 py-8 relative z-10">
      <div className="space-y-4">
        <div className="w-64 h-8 bg-dark-border rounded animate-pulse"></div>
        <div className="w-96 h-4 bg-dark-border rounded animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-dark-card border border-dark-border rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    </main>
  </div>
);

const CampaignManagementClient: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Filter campaigns based on search term and status
    let filtered = campaigns;

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(campaign =>
        campaign.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.goal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.brands?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => 
        statusFilter === 'active' ? campaign.is_active : !campaign.is_active
      );
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, searchTerm, statusFilter]);

  const fetchCampaigns = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          social_connections:social_id (
            provider
          ),
          social_pages:page_id (
            page_name
          ),
          brands:brand_id (
            name,
            industry
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        setCampaigns([]);
      } else {
        setCampaigns(data || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowEditModal(true);
  };

  const handleToggleCampaign = async (campaign: Campaign) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          is_active: !campaign.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaign.id)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      toast.success(`Campaign ${!campaign.is_active ? 'activated' : 'paused'} successfully`);
      fetchCampaigns();
    } catch (error) {
      console.error('Error toggling campaign:', error);
      toast.error("Failed to update campaign status");
    }
  };

  const handleDeleteCampaign = async (campaign: Campaign) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${campaign.campaign_name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaign.id)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      toast.success("Campaign deleted successfully");
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error("Failed to delete campaign");
    }
  };

  const parseCronTime = (cronExpression: string | null): string => {
    if (!cronExpression) return 'Not scheduled';
    
    try {
      const parts = cronExpression.split(' ');
      if (parts.length >= 2) {
        const minute = parts[0];
        const hour = parts[1];
        
        const hourNum = parseInt(hour);
        const minuteNum = parseInt(minute);
        
        if (!isNaN(hourNum) && !isNaN(minuteNum)) {
          const period = hourNum >= 12 ? 'PM' : 'AM';
          const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
          const displayMinute = minuteNum.toString().padStart(2, '0');
          
          return `${displayHour}:${displayMinute} ${period}`;
        }
      }
    } catch (error) {
      console.error('Error parsing cron expression:', error);
    }
    
    return 'Invalid schedule';
  };

  const formatFrequency = (frequency: string | null): string => {
    if (!frequency) return 'Not set';
    
    switch (frequency.toLowerCase()) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'once':
        return 'One-time';
      default:
        return frequency.charAt(0).toUpperCase() + frequency.slice(1);
    }
  };

  const formatStrategy = (strategy: string | null): string => {
    if (!strategy) return 'Not set';
    return strategy.toUpperCase();
  };

  const getPlatformName = (campaign: Campaign): string => {
    // First check the new target_platforms array
    if (campaign.target_platforms && campaign.target_platforms.length > 0) {
      const platforms = campaign.target_platforms.map(p => 
        p.charAt(0).toUpperCase() + p.slice(1)
      );
      return platforms.join(', ');
    }
    
    // Fall back to the old single platform field
    if (campaign.social_connections?.provider) {
      return campaign.social_connections.provider.charAt(0).toUpperCase() + 
             campaign.social_connections.provider.slice(1);
    }
    
    if (campaign.platforms && campaign.platforms.length > 0) {
      return campaign.platforms[0].charAt(0).toUpperCase() + campaign.platforms[0].slice(1);
    }
    
    return 'Website';
  };

  const getPageName = (campaign: Campaign): string => {
    // Check for multiple pages in the new target_page_ids array
    if (campaign.target_page_ids && campaign.target_page_ids.length > 0) {
      return `${campaign.target_page_ids.length} page(s)`;
    }
    
    // Fall back to the old single page field
    if (campaign.social_pages?.page_name) {
      return campaign.social_pages.page_name;
    }
    
    // Check for multiple connections in the new target_connection_ids array
    if (campaign.target_connection_ids && campaign.target_connection_ids.length > 0) {
      return `${campaign.target_connection_ids.length} account(s)`;
    }
    
    return 'Direct posting';
  };

  // Show loading state while session is being determined or data is loading
  if (loading) {
    return <CampaignManagementLoading />;
  }

  // If no user, redirect handled by middleware
  if (!user) {
    return <CampaignManagementLoading />;
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <ParticleBackground />
      
      {/* Navigation */}
      <AuthenticatedNavbar
        onLogout={handleLogout}
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
                Campaign <span className="text-gradient">Management</span>
              </h1>
              <p className="text-white/70">
                Manage and monitor your automated content campaigns
              </p>
            </div>
            
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary inline-flex items-center gap-2 mt-4 md:mt-0 shadow-elevation-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </motion.button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-lighter border border-dark-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-elevation-1"
              />
            </div>
            
            <div className="flex gap-2">
              {(['all', 'active', 'inactive'] as const).map((status) => (
                <motion.button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-primary text-white shadow-glow'
                      : 'bg-dark-lighter text-white/70 hover:text-white hover:bg-dark-border'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Campaigns Grid */}
          {filteredCampaigns.length === 0 ? (
            <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center shadow-elevation-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white/90">
                {searchTerm || statusFilter !== 'all' ? 'No campaigns found' : 'No Campaigns Yet'}
              </h3>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all'
                  ? "No campaigns match your current filters. Try adjusting your search or filter criteria."
                  : "You haven't created any campaigns yet. Start by creating your first automated content campaign."
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <motion.button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary shadow-elevation-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Your First Campaign
                </motion.button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary/50 hover:shadow-glow transition-all duration-300 group card-touch shadow-elevation-2"
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  {/* Campaign Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white group-hover:text-primary transition-colors">
                          {campaign.campaign_name}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.is_active 
                            ? 'bg-primary/20 text-primary border border-primary/30' 
                            : 'bg-white/10 text-white/60 border border-white/20'
                        }`}>
                          {campaign.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      {campaign.brands?.name && (
                        <p className="text-white/60 text-sm">
                          {campaign.brands.name} {campaign.brands.industry && `• ${campaign.brands.industry}`}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        onClick={() => handleToggleCampaign(campaign)}
                        className={`p-2 rounded-lg transition-colors ${
                          campaign.is_active
                            ? 'text-white/60 hover:text-yellow-400 hover:bg-yellow-400/10'
                            : 'text-white/60 hover:text-green-400 hover:bg-green-400/10'
                        }`}
                        title={campaign.is_active ? 'Pause campaign' : 'Activate campaign'}
                        whileTap={{ scale: 0.9 }}
                      >
                        {campaign.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </motion.button>
                      <motion.button
                        onClick={() => handleEditCampaign(campaign)}
                        className="p-2 text-white/60 hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                        title="Edit campaign"
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteCampaign(campaign)}
                        className="p-2 text-white/60 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                        title="Delete campaign"
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Campaign Description */}
                  {campaign.description && (
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                      {campaign.description}
                    </p>
                  )}

                  {/* Campaign Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="h-4 w-4 text-white/60" />
                          <span className="text-sm text-white/60">Platform</span>
                        </div>
                        <span className="text-white font-medium">{getPlatformName(campaign)}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-white/60" />
                          <span className="text-sm text-white/60">Strategy</span>
                        </div>
                        <span className="text-white font-medium">{formatStrategy(campaign.ai_intent)}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-white/60" />
                          <span className="text-sm text-white/60">Frequency</span>
                        </div>
                        <span className="text-white font-medium">{formatFrequency(campaign.ai_posting_frequency)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-white/60">Page</span>
                        </div>
                        <span className="text-white font-medium text-sm">{getPageName(campaign)}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-white/60">Goal</span>
                        </div>
                        <span className="text-white font-medium text-sm">
                          {campaign.goal?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not set'}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-white/60" />
                          <span className="text-sm text-white/60">Time</span>
                        </div>
                        <span className="text-white font-medium">{parseCronTime(campaign.schedule_cron)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Date Range */}
                  {(campaign.start_date || campaign.end_date) && (
                    <div className="mb-4 p-3 bg-dark-lighter rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-white/70">
                          {campaign.start_date && campaign.end_date 
                            ? `${new Date(campaign.start_date).toLocaleDateString()} - ${new Date(campaign.end_date).toLocaleDateString()}`
                            : campaign.start_date 
                              ? `From ${new Date(campaign.start_date).toLocaleDateString()}`
                              : campaign.end_date
                                ? `Until ${new Date(campaign.end_date).toLocaleDateString()}`
                                : 'No date range set'
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Timezone */}
                  <div className="pt-4 border-t border-dark-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-white/60" />
                        <span className="text-sm text-white/60">Timezone:</span>
                        <span className="text-white/80 text-sm">{campaign.timezone || 'UTC'}</span>
                      </div>
                      <span className="text-white/50 text-xs">
                        Created {new Date(campaign.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Next Run Info */}
                  {campaign.next_run_at && campaign.is_active && (
                    <div className="mt-3 p-3 bg-dark-lighter rounded-lg border border-dark-border">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-secondary" />
                        <span className="text-sm text-white/70">Next run:</span>
                        <span className="text-secondary text-sm font-medium">
                          {DateTime.fromISO(campaign.next_run_at, { zone: 'utc' })
                            .setZone(campaign.timezone || 'UTC')
                            .toLocaleString(DateTime.DATETIME_MED)}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Modals */}
      <CreateBotModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <EditCampaignModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCampaign(null);
        }}
        campaign={selectedCampaign}
        onCampaignUpdated={fetchCampaigns}
      />
    </div>
  );
};

export default CampaignManagementClient;