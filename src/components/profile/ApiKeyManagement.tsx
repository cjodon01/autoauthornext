'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  permissions: string[];
  created_at: string;
  last_used?: string;
  is_active: boolean;
}

interface ApiKeyManagementProps {
  apiKeys: ApiKey[];
  onCreate: (name: string, permissions: string[]) => Promise<void>;
  onRevoke: (keyId: string) => Promise<void>;
  loading: boolean;
}

const ApiKeyManagement: React.FC<ApiKeyManagementProps> = ({
  apiKeys,
  onCreate,
  onRevoke,
  loading
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['read']);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);

  const availablePermissions = [
    { 
      id: 'read', 
      label: 'Read Access', 
      description: 'View analytics, posts, and campaign data',
      color: 'text-blue-400'
    },
    { 
      id: 'write', 
      label: 'Write Access', 
      description: 'Create and update posts, campaigns, and brands',
      color: 'text-green-400'
    },
    { 
      id: 'admin', 
      label: 'Admin Access', 
      description: 'Full access including account settings and billing',
      color: 'text-red-400'
    }
  ];

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    try {
      await onCreate(newKeyName.trim(), selectedPermissions);
      setShowCreateModal(false);
      setNewKeyName('');
      setSelectedPermissions(['read']);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleRevokeKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Are you sure you want to revoke the API key "${keyName}"? This action cannot be undone and will immediately disable all applications using this key.`)) {
      return;
    }

    setRevokingKeyId(keyId);
    try {
      await onRevoke(keyId);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setRevokingKeyId(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const getPermissionBadge = (permission: string) => {
    const perm = availablePermissions.find(p => p.id === permission);
    if (!perm) return null;

    return (
      <span key={permission} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-dark-lighter ${perm.color}`}>
        <Shield className="h-3 w-3" />
        {perm.label}
      </span>
    );
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-400" />
    ) : (
      <XCircle className="h-4 w-4 text-red-400" />
    );
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            API Key Management
          </h2>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary inline-flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="h-4 w-4" />
            Create New Key
          </motion.button>
        </div>
        <p className="text-white/70 text-sm">
          Generate API keys to integrate AutoAuthor with your applications
        </p>
      </div>

      {/* API Keys List */}
      {apiKeys.length === 0 ? (
        <div className="text-center py-12 bg-dark-lighter rounded-lg border-2 border-dashed border-dark-border">
          <Key className="h-12 w-12 text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No API Keys Created</h3>
          <p className="text-white/60 mb-6">
            Create your first API key to start integrating with AutoAuthor
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create API Key
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <motion.div
              key={apiKey.id}
              className="bg-dark-lighter border border-dark-border rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              layout
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{apiKey.name}</h3>
                    {getStatusIcon(apiKey.is_active)}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      apiKey.is_active 
                        ? 'bg-green-400/20 text-green-400' 
                        : 'bg-red-400/20 text-red-400'
                    }`}>
                      {apiKey.is_active ? 'Active' : 'Revoked'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <code className="bg-dark text-white/80 px-3 py-1 rounded font-mono text-sm">
                      {apiKey.key_preview}
                    </code>
                    <button
                      onClick={() => copyToClipboard(apiKey.key_preview)}
                      className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                      title="Copy key preview"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {apiKey.permissions.map(permission => getPermissionBadge(permission))}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-white/60">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Created: {format(new Date(apiKey.created_at), 'MMM dd, yyyy')}
                    </div>
                    {apiKey.last_used && (
                      <div className="flex items-center gap-1">
                        <Settings className="h-3 w-3" />
                        Last used: {format(new Date(apiKey.last_used), 'MMM dd, yyyy')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {apiKey.is_active && (
                    <motion.button
                      onClick={() => handleRevokeKey(apiKey.id, apiKey.name)}
                      disabled={revokingKeyId === apiKey.id}
                      className="p-2 text-white/60 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {revokingKeyId === apiKey.id ? (
                        <div className="h-4 w-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </motion.button>
                  )}
                </div>
              </div>

              {!apiKey.is_active && (
                <div className="mt-4 p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    This API key has been revoked and can no longer be used
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-8 bg-amber-400/10 border border-amber-400/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-400 mb-2">Security Best Practices</h4>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• Store API keys securely and never expose them in client-side code</li>
              <li>• Use the minimum required permissions for each key</li>
              <li>• Rotate keys regularly and revoke unused keys immediately</li>
              <li>• Monitor key usage and investigate any suspicious activity</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create API Key Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-dark-card border border-dark-border rounded-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Create New API Key
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production API, Mobile App"
                    className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Permissions</label>
                  <div className="space-y-3">
                    {availablePermissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-start gap-3 p-3 bg-dark-lighter/50 rounded-lg hover:bg-dark-lighter transition-colors cursor-pointer"
                        onClick={() => togglePermission(permission.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          className="mt-0.5 h-4 w-4 rounded border-dark-border bg-dark-lighter text-primary focus:ring-primary/50"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className="h-3 w-3" />
                            <span className="font-medium text-white">{permission.label}</span>
                          </div>
                          <p className="text-white/60 text-sm">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-dark-border">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleCreateKey}
                  disabled={loading}
                  className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Key
                    </>
                  )}
                </motion.button>
              </div>

              <div className="mt-4 p-3 bg-amber-400/10 border border-amber-400/20 rounded-lg">
                <div className="flex items-center gap-2 text-amber-400 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  The full API key will only be shown once after creation
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApiKeyManagement;