'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';
import AuthenticatedNavbar from '../../components/layout/AuthenticatedNavbar';
import AddTokensModal from '../../components/modals/AddTokensModal';
import SinglePostModal from '../../components/dashboard/SinglePostModal';
import ConnectSocialsModal from '../../components/dashboard/ConnectSocialsModal';
import CreateBrandModal from '../../components/dashboard/CreateBrandModal';
import { Loader2, Plus, BarChart3, BookOpen, Send, ClipboardList, Building2, Settings, Edit, CheckCircle2, Facebook, Twitter, MessageSquare, Linkedin, Globe } from 'lucide-react';
import { toast } from 'sonner';

const DashboardClient: React.FC = () => {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showSinglePostModal, setShowSinglePostModal] = useState(false);
  const [showConnectSocialsModal, setShowConnectSocialsModal] = useState(false);
  const [showCreateBrandModal, setShowCreateBrandModal] = useState(false);
  
  // Data states
  const [connections, setConnections] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [justCreatedBrand, setJustCreatedBrand] = useState(false);

  // Platform configurations
  const platforms = [
    { name: "Facebook", key: "facebook", icon: Facebook, color: "#1877F2" },
    { name: "Twitter", key: "twitter", icon: Twitter, color: "#1DA1F2" },
    { name: "Instagram", key: "instagram", icon: MessageSquare, color: "#E4405F" },
    { name: "LinkedIn", key: "linkedin", icon: Linkedin, color: "#0A66C2" },
    { name: "Reddit", key: "reddit", icon: MessageSquare, color: "#FF4500" },
    { name: "Website Embed", key: "website", icon: Globe, color: "#00BFFF" },
  ];

  // Fetch data on mount
  useEffect(() => {
    const fetchConnections = async () => {
      if (!user) {
        setDataLoading(false);
        return;
      }

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
      } finally {
        setDataLoading(false);
      }
    };

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

    if (user) {
      fetchConnections();
      fetchBrands();
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

  const handleCreateCampaign = () => {
    const hasBrands = brands.length > 0 || justCreatedBrand;
  
    if (!hasBrands) {
      toast.error("No brands found", {
        description: "Please create a brand first before creating campaigns."
      });
      setShowCreateBrandModal(true);
    } else {
      router.push('/campaign-management');
      setJustCreatedBrand(false);
    }
  };

  const handleBrandCreated = async () => {
    await refreshBrands();
    setShowCreateBrandModal(false);
    setJustCreatedBrand(true);
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
  const isAnyModalOpen = showTokenModal || showSinglePostModal || showConnectSocialsModal || showCreateBrandModal;

  return (
    <div className={`min-h-screen bg-dark relative ${isAnyModalOpen ? 'overflow-hidden' : ''}`}>
      <AuthenticatedNavbar
        onLogout={handleLogout}
        onTokenClick={() => setShowTokenModal(true)}
        userEmail={user?.email}
      />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-card border border-dark-border rounded-xl p-8 shadow-elevation-2"
        >
          <div className="relative z-10">
            <h1 className="text-3xl font-display font-bold mb-4">
              Welcome back, <span className="text-gradient">{user?.email}</span>
            </h1>
            <p className="text-white/70 mb-6 text-lg leading-relaxed">
              <strong>Your dashboard is ready!</strong><br />
              🚀 Launch in 3 easy steps:
            </p>
          
            <ul className="text-white/70 space-y-3 text-base pl-4 list-none mb-8">
              <li>
                <span className="mr-2">①</span>Connect a platform to publish on.
              </li>
              <li>
  <span className="mr-2">②</span>Create a brand to shape your content&rsquo;s voice.
</li>
              <li>
                <span className="mr-2">③</span>Launch a campaign to generate and schedule powerful posts.
              </li>
            </ul>

            {/* Quick Actions - 5 cards matching original */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              <motion.button
                onClick={handleCreateCampaign}
                className="p-4 bg-dark-lighter border border-dark-border rounded-lg hover:border-primary/50 hover:shadow-glow transition-all duration-300 text-left group card-touch shadow-elevation-1"
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Create Campaign</h3>
                </div>
                <p className="text-white/60 text-sm">Set up automated content posting</p>
              </motion.button>

              <motion.button
                onClick={() => setShowSinglePostModal(true)}
                className="p-4 bg-dark-lighter border border-dark-border rounded-lg hover:border-secondary/50 hover:shadow-glow-blue transition-all duration-300 text-left group card-touch shadow-elevation-1"
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                    <Send className="h-5 w-5 text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Post Now!</h3>
                </div>
                <p className="text-white/60 text-sm">Post to multiple platforms at once</p>
              </motion.button>

              <motion.button
                onClick={() => router.push('/pending-posts')}
                className="p-4 bg-dark-lighter border border-dark-border rounded-lg hover:border-accent/50 hover:shadow-glow-coral transition-all duration-300 text-left group card-touch shadow-elevation-1"
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                    <ClipboardList className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Scheduled Posts</h3>
                </div>
                <p className="text-white/60 text-sm">Review and manage scheduled posts</p>
              </motion.button>

              <motion.button
                onClick={() => router.push('/analytics')}
                className="p-4 bg-dark-lighter border border-dark-border rounded-lg hover:border-primary/50 hover:shadow-glow transition-all duration-300 text-left group card-touch shadow-elevation-1"
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Analytics</h3>
                </div>
                <p className="text-white/60 text-sm">Track content performance</p>
              </motion.button>

              <motion.button
                onClick={() => router.push('/journal')}
                className="p-4 bg-dark-lighter border border-dark-border rounded-lg hover:border-accent/50 hover:shadow-glow-coral transition-all duration-300 text-left group card-touch shadow-elevation-1"
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                    <BookOpen className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Write Journal</h3>
                </div>
                <p className="text-white/60 text-sm">Record your thoughts and ideas</p>
              </motion.button>
            </div>

            {/* Management Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <motion.button
                onClick={() => router.push('/brand-management')}
                className="p-4 bg-dark-lighter border border-dark-border rounded-lg hover:border-primary/50 hover:shadow-glow transition-all duration-300 text-left group card-touch shadow-elevation-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Manage Brands</h3>
                      <p className="text-white/60 text-sm">Edit and organize your brand profiles</p>
                    </div>
                  </div>
                  <Edit className="h-5 w-5 text-white/40 group-hover:text-primary transition-colors" />
                </div>
              </motion.button>

              <motion.button
                onClick={() => router.push('/campaign-management')}
                className="p-4 bg-dark-lighter border border-dark-border rounded-lg hover:border-secondary/50 hover:shadow-glow-blue transition-all duration-300 text-left group card-touch shadow-elevation-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                      <Settings className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Manage Campaigns</h3>
                      <p className="text-white/60 text-sm">Edit and control your automated campaigns</p>
                    </div>
                  </div>
                  <Edit className="h-5 w-5 text-white/40 group-hover:text-secondary transition-colors" />
                </div>
              </motion.button>
            </div>

            {/* Brands Section */}
            {brands.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Your Brands</h3>
                  <motion.button
                    onClick={() => router.push('/brand-management')}
                    className="text-primary hover:text-primary-light text-sm transition-colors touch-feedback"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Manage All →
                  </motion.button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {brands.slice(0, 4).map((brand, index) => (
                    <motion.div 
                      key={brand.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-dark-lighter border border-dark-border hover:border-primary/50 hover:shadow-glow transition-all card-touch shadow-elevation-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -3 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: brand.primary_color + '20' }}
                        >
                          <Building2 
                            className="h-5 w-5" 
                            style={{ color: brand.primary_color }} 
                          />
                        </div>
                        <div>
                          <div className="text-white/90 font-medium">{brand.name}</div>
                          <div className="text-white/60 text-sm">{brand.industry || 'No industry set'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-primary/80 text-sm">Active</span>
                        <CheckCircle2 className="h-4 w-4 text-primary/80" />
                      </div>
                    </motion.div>
                  ))}
                </div>
                {brands.length > 4 && (
                  <div className="text-center mt-3">
                    <motion.button
                      onClick={() => router.push('/brand-management')}
                      className="text-white/60 hover:text-white text-sm transition-colors touch-feedback"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      +{brands.length - 4} more brands
                    </motion.button>
                  </div>
                )}
              </div>
            )}

            {/* Connected Platforms Section */}
            {safeConnections.length > 0 ? (
              <div className="mt-8 mb-8">
                <h3 className="text-lg font-semibold mb-4">Connected Platforms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {safeConnections.map((connection, index) => {
                    const platformConfig = platforms.find(p => p.key === connection.provider);
                    if (!platformConfig) return null;
                    
                    return (
                      <motion.div 
                        key={connection.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-dark-lighter border border-dark-border hover:border-secondary/50 hover:shadow-glow-blue transition-all card-touch shadow-elevation-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (index * 0.1) }}
                        whileHover={{ scale: 1.02, y: -3 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <platformConfig.icon 
                            className="h-5 w-5" 
                            style={{ color: platformConfig.color }} 
                          />
                          <span className="text-white/90">{platformConfig.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-primary/80 text-sm">Connected</span>
                          <CheckCircle2 className="h-4 w-4 text-primary/80" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-8 mb-8">
                <div className="text-center p-8 bg-dark-lighter rounded-lg border border-dark-border shadow-elevation-1">
                  <h3 className="text-lg font-semibold mb-2 text-white/90">No Platforms Connected</h3>
                  <p className="text-white/60 mb-4">Connect your social media accounts to start automating your content.</p>
                </div>
              </div>
            )}

            <motion.button
              onClick={() => setShowConnectSocialsModal(true)}
              className="btn btn-primary cursor-pointer relative z-10 hover:bg-primary-light transition-colors shadow-elevation-2"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {safeConnections.length === 0 ? 'Connect Your Socials' : 'Manage Connected Platforms'}
            </motion.button>
            
            <p className="text-white/60 mt-6 text-sm italic">
              Need help? Contact <a href="mailto:support@autoauthorapp.com" className="underline hover:text-white">support@autoauthorapp.com</a>✨
            </p>
          </div>
        </motion.div>
      </main>

      {/* Floating Action Button */}
      <motion.button
        onClick={handleCreateCampaign}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-glow hover:bg-primary-light transition-colors cursor-pointer z-50 fab safe-area-bottom"
        whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(138, 43, 226, 0.7)" }}
        whileTap={{ scale: 0.9 }}
      >
        <Plus className="h-6 w-6 text-white" />
      </motion.button>

      {/* Secondary Floating Action Button for Single Post */}
      <motion.button
        onClick={() => setShowSinglePostModal(true)}
        className="fixed bottom-8 right-24 w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-glow-blue hover:bg-secondary-light transition-colors cursor-pointer z-50 fab safe-area-bottom"
        whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(0, 191, 255, 0.7)" }}
        whileTap={{ scale: 0.9 }}
      >
        <Send className="h-5 w-5 text-white" />
      </motion.button>

      {/* Modals */}
      <AddTokensModal 
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
      />

      <SinglePostModal
        isOpen={showSinglePostModal}
        onClose={() => setShowSinglePostModal(false)}
      />

      <ConnectSocialsModal
        isOpen={showConnectSocialsModal}
        onClose={() => setShowConnectSocialsModal(false)}
        connections={safeConnections}
        refreshConnections={refreshConnections}
      />

      <CreateBrandModal
        isOpen={showCreateBrandModal}
        onClose={() => setShowCreateBrandModal(false)}
        onBrandCreated={handleBrandCreated}
      />
    </div>
  );
};

export default DashboardClient;