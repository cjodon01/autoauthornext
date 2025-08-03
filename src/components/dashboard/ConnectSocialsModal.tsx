'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/provider';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

// Types from Supabase
type SocialConnection = Database['public']['Tables']['social_connections']['Row'];
type SocialPage = Database['public']['Tables']['social_pages']['Row'];

// Props Interface
interface ConnectSocialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  connections: SocialConnection[];
  refreshConnections: () => Promise<void>;
  onConnectionsUpdated?: () => void;
}

const ConnectSocialsModal: React.FC<ConnectSocialsModalProps> = ({
  isOpen,
  onClose,
  connections,
  refreshConnections,
  onConnectionsUpdated
}) => {
  const { user } = useAuth();
  const supabase = createClient();

  const [pages, setPages] = useState<SocialPage[]>([]);
  const [refreshingConnections, setRefreshingConnections] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      fetchPages();
    }
  }, [isOpen, user]);

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

  const handleRefreshConnection = async (connectionId: string) => {
    setRefreshingConnections((prev) => [...prev, connectionId]);
    try {
      await refreshConnections();
      onConnectionsUpdated?.();
    } catch (error) {
      console.error('Error refreshing connection:', error);
      toast.error('Failed to refresh connection');
    } finally {
      setRefreshingConnections((prev) => prev.filter((id) => id !== connectionId));
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
            className="relative bg-dark-card border border-dark-border rounded-2xl w-full max-w-4xl overflow-hidden z-10"
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
                    Social <span className="text-gradient">Connections</span>
                  </h2>
                  <p className="text-white/60">Manage your connected accounts</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {connections.length === 0 ? (
                  <div className="text-center text-white/60">No connected accounts found.</div>
                ) : (
                  connections.map((conn, index) => (
                    <div
                      key={index}
                      className="p-4 bg-dark-lighter border border-dark-border rounded-lg flex items-center justify-between"
                    >
                      <div className="text-white">{conn.provider}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRefreshConnection(conn.id)}
                          className="btn btn-secondary btn-sm"
                          disabled={refreshingConnections.includes(conn.id)}
                        >
                          {refreshingConnections.includes(conn.id) ? 'Refreshing...' : 'Refresh'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
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
