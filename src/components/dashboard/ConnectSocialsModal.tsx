'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Facebook, 
  Twitter, 
  MessageSquare, 
  Linkedin, 
  Globe,
  Plus,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/provider';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type SocialConnection = Database['public']['Tables']['social_connections']['Row'];
type SocialPage = Database['public']['Tables']['social_pages']['Row'];

interface ConnectSocialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionsUpdated?: () => void;
}

interface Platform {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
  features: string[];
  connectionType: 'direct' | 'pages';
  available: boolean;
}

const platforms: Platform[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: '#1877F2',
    description: 'Connect your Facebook pages for automated posting',
    features: ['Page posting', 'Image/video support', 'Link previews', 'Scheduling'],
    connectionType: 'pages',
    available: true
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: MessageSquare,
    color: '#E4405F',
    description: 'Connect Instagram business accounts via Facebook',
    features: ['Feed posts', 'Stories', 'Image/video', 'Hashtag optimization'],
    connectionType: 'pages',
    available: true
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Twitter,
    color: '#1DA1F2',
    description: 'Connect your Twitter account for direct posting',
    features: ['Tweet threads', 'Image support', 'Real-time posting', 'Engagement tracking'],
    connectionType: 'direct',
    available: true
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: '#0A66C2',
    description: 'Connect your LinkedIn profile or company page',
    features: ['Professional content', 'Article publishing', 'Network reach', 'B2B targeting'],
    connectionType: 'direct',
    available: true
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: MessageSquare,
    color: '#FF4500',
    description: 'Connect your Reddit account for community engagement',
    features: ['Subreddit posting', 'Community guidelines', 'Discussion threads', 'Karma tracking'],
    connectionType: 'direct',
    available: false // Coming soon
  }
];

const ConnectSocialsModal: React.FC<ConnectSocialsModalProps> = ({ 
  isOpen, 
  onClose, 
  onConnectionsUpdated 
}) => {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [pages, setPages] = useState<SocialPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshingConnections, setRefreshingConnections] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<'connect' | 'manage'>('connect');

  useEffect(() => {
    if (isOpen && user) {
      fetchConnections();
      fetchPages();
    }
  }, [isOpen, user]);

  const fetchConnections = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load social connections');
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('social_pages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to load social pages');
    }
  };

  const handleConnect = async (platformId: string) => {
    toast.info('OAuth integration coming soon!', {
      description: `${platforms.find(p => p.id === platformId)?.name} connection will be available in the next update.`
    });
    
    // TODO: Implement actual OAuth flow
    // This would redirect to the platform's OAuth endpoint
    // For now, we'll show a placeholder
  };

  const handleRefreshConnection = async (connectionId: string) => {
    setRefreshingConnections(prev => [...prev, connectionId]);
    
    try {
      // TODO: Implement token refresh logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast.success('Connection refreshed successfully');
      fetchConnections();
    } catch (error) {
      toast.error('Failed to refresh connection');
    } finally {
      setRefreshingConnections(prev => prev.filter(id => id !== connectionId));
    }
  };

  const handleDisconnect = async (connectionId: string, platformName: string) => {
    const confirmed = window.confirm(`Are you sure you want to disconnect ${platformName}? This will stop all automated posting to this account.`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('social_connections')
        .delete()
        .eq('id', connectionId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success(`${platformName} disconnected successfully`);
      fetchConnections();
      fetchPages();
      onConnectionsUpdated?.();
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect account');
    }
  };

  const getConnectionStatus = (platformId: string) => {
    const connection = connections.find(c => c.provider === platformId);
    if (!connection) return 'disconnected';
    
    // Check if token is expired (simplified check)
    if (connection.token_expires_at) {
      const expiresAt = new Date(connection.token_expires_at);
      const now = new Date();
      if (expiresAt <= now) return 'expired';
    }
    
    return 'connected';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return <Plus className="h-4 w-4 text-white/60" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'expired':
        return 'Needs Refresh';
      default:
        return 'Connect';
    }
  };

  const renderConnectTab = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Connect Your Social Accounts</h3>
        <p className="text-white/60 text-sm">
          Connect your social media accounts to start automated posting
        </p>
      </div>

      <div className="space-y-4">
        {platforms.map((platform) => {
          const status = getConnectionStatus(platform.id);
          const connection = connections.find(c => c.provider === platform.id);
          
          return (
            <motion.div
              key={platform.id}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                status === 'connected' 
                  ? 'border-green-500/30 bg-green-500/5'
                  : status === 'expired'
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : 'border-dark-border bg-dark-lighter hover:border-primary/30'
              }`}
              whileHover={{ scale: platform.available ? 1.01 : 1 }}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: platform.color + '20' }}
                >
                  <platform.icon 
                    className="h-6 w-6" 
                    style={{ color: platform.color }}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-white">{platform.name}</h4>
                    {!platform.available && (
                      <span className="text-xs bg-dark-border text-white/60 px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  
                  <p className="text-white/70 text-sm mb-3">{platform.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {platform.features.map((feature, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-dark-border text-white/60 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="text-sm font-medium">
                      {getStatusText(status)}
                    </span>
                  </div>
                  
                  {status === 'disconnected' && platform.available && (
                    <button
                      onClick={() => handleConnect(platform.id)}
                      className="btn btn-primary btn-sm inline-flex items-center gap-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Connect
                    </button>
                  )}
                  
                  {status === 'expired' && (
                    <button
                      onClick={() => connection && handleRefreshConnection(connection.id)}
                      disabled={refreshingConnections.includes(connection?.id || '')}
                      className="btn btn-secondary btn-sm inline-flex items-center gap-2"
                    >
                      <RefreshCw className={`h-3 w-3 ${refreshingConnections.includes(connection?.id || '') ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  )}
                  
                  {status === 'connected' && (
                    <button
                      onClick={() => connection && handleRefreshConnection(connection.id)}
                      disabled={refreshingConnections.includes(connection?.id || '')}
                      className="btn btn-secondary btn-sm inline-flex items-center gap-2"
                    >
                      <RefreshCw className={`h-3 w-3 ${refreshingConnections.includes(connection?.id || '') ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderManageTab = () => (
    <div className="space-y-6">
      {/* Connected Accounts */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Connected Accounts</h3>
        {connections.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No social accounts connected yet.</p>
            <p className="text-sm mt-2">Switch to the Connect tab to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((connection) => {
              const platform = platforms.find(p => p.id === connection.provider);
              if (!platform) return null;

              return (
                <div 
                  key={connection.id}
                  className="flex items-center justify-between p-4 bg-dark-lighter rounded-lg border border-dark-border"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: platform.color + '20' }}
                    >
                      <platform.icon 
                        className="h-4 w-4" 
                        style={{ color: platform.color }}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-white">{platform.name}</div>
                      <div className="text-sm text-white/60">
                        {connection.account_id || 'Connected Account'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRefreshConnection(connection.id)}
                      disabled={refreshingConnections.includes(connection.id)}
                      className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-dark-border"
                      title="Refresh connection"
                    >
                      <RefreshCw className={`h-4 w-4 ${refreshingConnections.includes(connection.id) ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleDisconnect(connection.id, platform.name)}
                      className="p-2 text-white/60 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                      title="Disconnect"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Connected Pages */}
      {pages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Connected Pages</h3>
          <div className="space-y-3">
            {pages.map((page) => {
              const platform = platforms.find(p => p.id === page.provider);
              if (!platform) return null;

              return (
                <div 
                  key={page.id}
                  className="flex items-center justify-between p-4 bg-dark-lighter rounded-lg border border-dark-border"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: platform.color + '20' }}
                    >
                      <platform.icon 
                        className="h-4 w-4" 
                        style={{ color: platform.color }}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-white">{page.page_name}</div>
                      <div className="text-sm text-white/60">
                        {platform.name} Page
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-green-400">Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

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
            className="relative bg-dark-card border border-dark-border rounded-2xl w-full max-w-4xl overflow-hidden z-10"
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
                
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Social <span className="text-gradient">Connections</span>
                  </h2>
                  <p className="text-white/60">
                    Connect and manage your social media accounts
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center">
                  <div className="flex bg-dark-lighter rounded-lg p-1">
                    <button
                      onClick={() => setSelectedTab('connect')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedTab === 'connect'
                          ? 'bg-primary text-white'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Connect Accounts
                    </button>
                    <button
                      onClick={() => setSelectedTab('manage')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedTab === 'manage'
                          ? 'bg-primary text-white'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Manage Connections
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {selectedTab === 'connect' ? renderConnectTab() : renderManageTab()}
              </div>

              {/* Footer */}
              <div className="bg-dark-card border-t border-dark-border p-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-white/50">
                    Connected accounts: {connections.length}
                  </div>
                  <button
                    onClick={onClose}
                    className="btn btn-secondary"
                  >
                    Close
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

export default ConnectSocialsModal;