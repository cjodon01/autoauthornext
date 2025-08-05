'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  Zap, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Play, 
  Pause, 
  Clock, 
  Target, 
  Globe, 
  Calendar, 
  MapPin,
  Loader2,
  Building2,
  MessageSquare,
  TrendingUp,
  Users,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';
import ParticleBackground from '../../components/ui/ParticleBackground';
import CreateBotModal from '../../components/dashboard/CreateBotModal';
import CreateBrandModal from '../../components/dashboard/CreateBrandModal';
import ConnectSocialsModal from '../../components/dashboard/ConnectSocialsModal';
import SinglePostModal from '../../components/dashboard/SinglePostModal';
import OnboardingWizard from '../../components/onboarding/OnboardingWizard';
import SimpleCampaignCreator from '../../components/campaigns/SimpleCampaignCreator';
import TokenBalance from '../../components/ui/TokenBalance';
import AuthenticatedNavbar from '../../components/layout/AuthenticatedNavbar';

const DashboardClient: React.FC = () => {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showSinglePostModal, setShowSinglePostModal] = useState(false);
  const [showConnectSocialsModal, setShowConnectSocialsModal] = useState(false);
  const [showCreateBrandModal, setShowCreateBrandModal] = useState(false);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [showSimpleCampaignCreator, setShowSimpleCampaignCreator] = useState(false);
  
  // Data states
  const [connections, setConnections] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [justCreatedBrand, setJustCreatedBrand] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  // Platform configurations
  const platforms = [
    { name: "Facebook", key: "facebook", icon: Globe, color: "#1877F2" },
    { name: "Twitter", key: "twitter", icon: MessageSquare, color: "#1DA1F2" },
    { name: "Instagram", key: "instagram", icon: MessageSquare, color: "#E4405F" },
    { name: "LinkedIn", key: "linkedin", icon: Users, color: "#0A66C2" },
    { name: "Reddit", key: "reddit", icon: MessageSquare, color: "#FF4500" },
    { name: "Website Embed", key: "website", icon: Globe, color: "#00BFFF" },
  ];

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setDataLoading(false);
        return;
      }

      try {
        // Fetch all data in parallel
        const [connectionsResult, brandsResult, campaignsResult] = await Promise.all([
          supabase
            .from('social_connections')
            .select('*')
            .eq('user_id', user.id),
          supabase
            .from('brands')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('campaigns')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        ]);

        setConnections(connectionsResult.data || []);
        setBrands(brandsResult.data || []);
        setCampaigns(campaignsResult.data || []);

        // Check if this is a first-time user
        const hasBrands = brandsResult.data && brandsResult.data.length > 0;
        const hasConnections = connectionsResult.data && connectionsResult.data.length > 0;
        const hasCampaigns = campaignsResult.data && campaignsResult.data.length > 0;

        console.log('Debug - User data check:', {
          userId: user.id,
          hasBrands,
          hasConnections,
          hasCampaigns,
          brandsCount: brandsResult.data?.length || 0,
          connectionsCount: connectionsResult.data?.length || 0,
          campaignsCount: campaignsResult.data?.length || 0
        });

        // Show onboarding if user has no connections and no campaigns
        // (Brands are created automatically with the profile, so we don't check for that)
        if (!hasConnections && !hasCampaigns) {
          console.log('Debug - First time user detected, showing onboarding wizard');
          setIsFirstTimeUser(true);
          setShowOnboardingWizard(true);
        } else {
          console.log('Debug - Not a first time user, skipping onboarding wizard');
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setConnections([]);
        setBrands([]);
        setCampaigns([]);
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else if (session !== undefined && !user) {
      setDataLoading(false);
    }
  }, [user, session, supabase]);

  const refreshBrands = async () => {
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

  const refreshConnections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching connections:', error);
        setConnections([]);
      } else {
        setConnections(data || []);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
      setConnections([]);
    }
  };

  const refreshCampaigns = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
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
    }
  };

  const handleCreateCampaign = () => {
    const hasBrands = brands.length > 0 || justCreatedBrand;
  
    if (!hasBrands) {
      toast.error("No brands found", {
        description: "Please create a brand first before creating campaigns."
      });
      setShowCreateBrandModal(true);
    } else {
      setShowSimpleCampaignCreator(true);
      setJustCreatedBrand(false);
    }
  };

  const handleBrandCreated = async () => {
    await refreshBrands();
    setShowCreateBrandModal(false);
    setJustCreatedBrand(true);
  };

  const handleOnboardingComplete = async () => {
    setIsFirstTimeUser(false);
    setShowOnboardingWizard(false);
    await Promise.all([refreshBrands(), refreshConnections(), refreshCampaigns()]);
    toast.success('Welcome to AutoAuthor! Your account is now set up.');
  };

  const handleCampaignCreated = async () => {
    await refreshCampaigns();
    setShowSimpleCampaignCreator(false);
  };

  if (loading || (typeof session === "undefined")) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  const safeConnections = connections || [];
  const safeBrands = brands || [];
  const safeCampaigns = campaigns || [];
  const isAnyModalOpen = showTokenModal || showSinglePostModal || showConnectSocialsModal || showOnboardingWizard;

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
                Welcome back, <span className="text-gradient">{user?.email?.split('@')[0]}</span>!
              </h1>
              <p className="text-white/70">
                {isFirstTimeUser 
                  ? "Let's get you started with AutoAuthor" 
                  : "Manage your brands, campaigns, and social media content"
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <TokenBalance />
              
              <motion.button
                onClick={handleCreateCampaign}
                className="btn btn-primary inline-flex items-center gap-2 shadow-elevation-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
                Create Campaign
              </motion.button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary/50 transition-colors shadow-elevation-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Brands</p>
                  <p className="text-2xl font-bold text-white">{safeBrands.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary/50 transition-colors shadow-elevation-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Connected Accounts</p>
                  <p className="text-2xl font-bold text-white">{safeConnections.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary/50 transition-colors shadow-elevation-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Active Campaigns</p>
                  <p className="text-2xl font-bold text-white">
                    {safeCampaigns.filter(c => c.is_active).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary/50 transition-colors shadow-elevation-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Posts</p>
                  <p className="text-2xl font-bold text-white">
                    {safeCampaigns.reduce((total, c) => total + (c.posts_count || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Campaigns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-elevation-2"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Recent Campaigns</h3>
                <button
                  onClick={() => router.push('/campaign-management')}
                  className="text-primary hover:text-primary-light text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              {safeCampaigns.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">No Campaigns Yet</h4>
                  <p className="text-white/60 mb-4">Create your first campaign to start automating content</p>
                  <button
                    onClick={handleCreateCampaign}
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Campaign
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {safeCampaigns.slice(0, 3).map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-3 bg-dark-lighter rounded-lg border border-dark-border"
                    >
                      <div>
                        <h4 className="font-medium text-white">{campaign.campaign_name}</h4>
                        <p className="text-sm text-white/60">{campaign.goal}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.is_active 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-white/10 text-white/60 border border-white/20'
                        }`}>
                          {campaign.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-elevation-2"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowCreateBrandModal(true)}
                  className="p-4 bg-dark-lighter rounded-lg border border-dark-border hover:border-primary/50 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-2 group-hover:bg-blue-500/30 transition-colors">
                    <Building2 className="h-4 w-4 text-blue-500" />
                  </div>
                  <h4 className="font-medium text-white text-sm">Create Brand</h4>
                  <p className="text-xs text-white/60">Set up a new brand profile</p>
                </button>

                <button
                  onClick={() => setShowConnectSocialsModal(true)}
                  className="p-4 bg-dark-lighter rounded-lg border border-dark-border hover:border-primary/50 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mb-2 group-hover:bg-green-500/30 transition-colors">
                    <Globe className="h-4 w-4 text-green-500" />
                  </div>
                  <h4 className="font-medium text-white text-sm">Connect Social</h4>
                  <p className="text-xs text-white/60">Link social media accounts</p>
                </button>

                <button
                  onClick={() => setShowSinglePostModal(true)}
                  className="p-4 bg-dark-lighter rounded-lg border border-dark-border hover:border-primary/50 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mb-2 group-hover:bg-purple-500/30 transition-colors">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                  </div>
                  <h4 className="font-medium text-white text-sm">Single Post</h4>
                  <p className="text-xs text-white/60">Create a one-time post</p>
                </button>

                <button
                  onClick={() => router.push('/analytics')}
                  className="p-4 bg-dark-lighter rounded-lg border border-dark-border hover:border-primary/50 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center mb-2 group-hover:bg-orange-500/30 transition-colors">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  </div>
                  <h4 className="font-medium text-white text-sm">Analytics</h4>
                  <p className="text-xs text-white/60">View performance data</p>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-elevation-2"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
            
            <div className="space-y-3">
              {safeCampaigns.length === 0 && safeBrands.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Welcome to AutoAuthor!</h4>
                  <p className="text-white/60 mb-4">Get started by creating your first brand and campaign</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setShowCreateBrandModal(true)}
                      className="btn btn-primary btn-sm"
                    >
                      Create Brand
                    </button>
                    <button
                      onClick={handleCreateCampaign}
                      className="btn btn-secondary btn-sm"
                    >
                      Create Campaign
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {safeBrands.slice(0, 2).map((brand) => (
                    <div key={brand.id} className="flex items-center gap-3 p-3 bg-dark-lighter rounded-lg border border-dark-border">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          <span className="font-medium">{brand.name}</span> brand created
                        </p>
                        <p className="text-xs text-white/60">
                          {new Date(brand.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {safeCampaigns.slice(0, 2).map((campaign) => (
                    <div key={campaign.id} className="flex items-center gap-3 p-3 bg-dark-lighter rounded-lg border border-dark-border">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          <span className="font-medium">{campaign.campaign_name}</span> campaign {campaign.is_active ? 'activated' : 'created'}
                        </p>
                        <p className="text-xs text-white/60">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Modals */}
      <CreateBotModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
      />

      <CreateBrandModal
        isOpen={showCreateBrandModal}
        onClose={() => setShowCreateBrandModal(false)}
        onBrandCreated={handleBrandCreated}
      />

      <ConnectSocialsModal
        isOpen={showConnectSocialsModal}
        onClose={() => setShowConnectSocialsModal(false)}
        connections={safeConnections}
        refreshConnections={refreshConnections}
      />

      <OnboardingWizard
        isOpen={showOnboardingWizard}
        onClose={() => setShowOnboardingWizard(false)}
        onComplete={handleOnboardingComplete}
      />

      <SimpleCampaignCreator
        isOpen={showSimpleCampaignCreator}
        onClose={() => setShowSimpleCampaignCreator(false)}
        onCampaignCreated={handleCampaignCreated}
      />

      <SinglePostModal
        isOpen={showSinglePostModal}
        onClose={() => setShowSinglePostModal(false)}
      />
    </div>
  );
};

export default DashboardClient;