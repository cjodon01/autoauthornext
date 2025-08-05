'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  X, 
  Globe, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';

interface ConnectSocialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  connections: any[];
  refreshConnections: () => Promise<void>;
}

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  isConnected: boolean;
  isConnecting: boolean;
}

const ConnectSocialsModal: React.FC<ConnectSocialsModalProps> = ({
  isOpen,
  onClose,
  connections,
  refreshConnections
}) => {
  const { user } = useAuth();
  const supabase = createClient();
  const [isFbSdkLoaded, setIsFbSdkLoaded] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: '#1877F2',
      description: 'Connect your Facebook pages and groups',
      isConnected: false,
      isConnecting: false
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: '#1DA1F2',
      description: 'Connect your Twitter account',
      isConnected: false,
      isConnecting: false
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: '#E4405F',
      description: 'Connect your Instagram business account',
      isConnected: false,
      isConnecting: false
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: '#0A66C2',
      description: 'Connect your LinkedIn company page',
      isConnected: false,
      isConnecting: false
    }
  ]);

  // Load Facebook SDK
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).FB) {
      setIsFbSdkLoaded(true);
      return;
    }

    if (!document.getElementById("fb-root")) {
      const fbRoot = document.createElement("div");
      fbRoot.id = "fb-root";
      document.body.appendChild(fbRoot);
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.onload = () => {
      (window as any).FB.init({
        appId: "686038484393201",
        cookie: true,
        xfbml: false,
        version: "v17.0",
      });
      setIsFbSdkLoaded(true);
    };
    script.onerror = () => {
      toast.error("Failed to load Facebook SDK");
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateConnectionStatus();
    }
  }, [isOpen, connections]);

  const updateConnectionStatus = () => {
    setPlatforms(prevPlatforms => 
      prevPlatforms.map(platform => ({
        ...platform,
        isConnected: connections.some(conn => conn.provider === platform.id),
        isConnecting: connecting === platform.id
      }))
    );
  };

  const handleConnect = async (platformId: string) => {
    if (!user) return;

    setConnecting(platformId);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Not logged in");
        setConnecting(null);
        return;
      }

      if (platformId === "facebook") {
        if (!isFbSdkLoaded || typeof (window as any).FB === "undefined") {
          toast.error("Facebook SDK not loaded");
          setConnecting(null);
          return;
        }

        (window as any).FB.login((response: any) => {
          (async () => {
            if (response.status === "connected") {
              const shortLivedToken = response.authResponse.accessToken;

              const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/social-media-connector`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ provider: "facebook", user_token: shortLivedToken }),
              });

              const result = await res.json();

              if (!res.ok) {
                toast.error(result.error || "Facebook connection failed");
              } else {
                toast.success(`Facebook ${result.pages_count ? "refreshed" : "connected"} successfully`);
                await refreshConnections();
              }
            } else {
              toast.error("Facebook login failed");
            }
            setConnecting(null);
          })();
        }, {
          auth_type: 'rerequest',
          scope: "pages_manage_posts,business_management,pages_show_list,read_insights,pages_read_engagement"
        });

        return;
      }

      // For other platforms, redirect to OAuth
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/social-media-connector`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ provider: platformId }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || `Failed to connect/refresh ${platformId}`);
      } else if (result.url) {
        window.location.href = result.url;
      } else {
        toast.success(`${platformId} account refreshed`);
        await refreshConnections();
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    if (!user) return;

    const confirmed = window.confirm(`Are you sure you want to disconnect ${platformId}?`);
    if (!confirmed) return;

    setDisconnecting(platformId);

    try {
      const { error } = await supabase
        .from('social_connections')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', platformId);

      if (error) {
        if (error.code === '23503' || error.message.includes('foreign key')) {
          toast.error("Cannot Disconnect", {
            description: "Remove linked campaigns first."
          });
        } else {
          toast.error("Disconnect Failed");
        }
        return;
      }

      await refreshConnections();
      toast.success(`Disconnected ${platformId}`);
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      toast.error("Disconnect Failed");
    } finally {
      setDisconnecting(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl overflow-hidden z-10"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="relative max-h-[90vh] flex flex-col">
              <div className="bg-dark-card border-b border-dark-border p-6 relative">
                <button
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                  onClick={onClose}
                >
                  <X size={20} />
                </button>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Connect <span className="text-gradient">Social Media</span>
                  </h2>
                  <p className="text-white/60">Link your social media accounts to start posting</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {platforms.map((platform) => {
                    const IconComponent = platform.icon;
                    return (
                      <motion.div
                        key={platform.id}
                        className="p-4 bg-dark-lighter border border-dark-border rounded-lg hover:border-primary/30 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${platform.color}20` }}
                            >
                              <IconComponent 
                                className="h-6 w-6" 
                                style={{ color: platform.color }}
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{platform.name}</h3>
                              <p className="text-sm text-white/60">{platform.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {platform.isConnected ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="text-sm text-green-500">Connected</span>
                                <button
                                  onClick={() => handleDisconnect(platform.id)}
                                  disabled={disconnecting === platform.id}
                                  className="btn btn-outline btn-sm text-red-500 border-red-500 hover:bg-red-500 hover:text-white inline-flex items-center gap-2"
                                >
                                  {disconnecting === platform.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Disconnecting...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="h-4 w-4" />
                                      Disconnect
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleConnect(platform.id)}
                                disabled={connecting === platform.id}
                                className="btn btn-primary btn-sm inline-flex items-center gap-2"
                              >
                                {connecting === platform.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Connecting...
                                  </>
                                ) : (
                                  'Connect'
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-400 mb-1">Note</h4>
                      <p className="text-sm text-blue-300/80">
                        Connecting social accounts requires OAuth authentication. You&apos;ll be redirected to the platform&apos;s login page to authorize access.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-dark-card border-t border-dark-border p-6 flex justify-end">
                <button onClick={onClose} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectSocialsModal;
