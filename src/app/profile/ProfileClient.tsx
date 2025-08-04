'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';
import AuthenticatedNavbar from '../../components/layout/AuthenticatedNavbar';
import ProfileSettings from '../../components/profile/ProfileSettings';
import NotificationSettings from '../../components/profile/NotificationSettings';
import ApiKeyManagement from '../../components/profile/ApiKeyManagement';
import BillingSettings from '../../components/profile/BillingSettings';
import SecuritySettings from '../../components/profile/SecuritySettings';
import { 
  User,
  Bell,
  Key,
  CreditCard,
  Shield,
  Settings,
  Loader2,
  Save,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

interface NotificationPreferences {
  email_marketing: boolean;
  email_updates: boolean;
  email_errors: boolean;
  push_notifications: boolean;
  weekly_reports: boolean;
  campaign_reminders: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  permissions: string[];
  created_at: string;
  last_used?: string;
  is_active: boolean;
}

const ProfileClient: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const supabase = createClient();
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_marketing: false,
    email_updates: true,
    email_errors: true,
    push_notifications: false,
    weekly_reports: true,
    campaign_reminders: true
  });
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  // Mock data generation for demonstration
  const generateMockProfile = (): UserProfile => ({
    id: user?.id || 'mock-user-id',
    email: user?.email || 'user@example.com',
    full_name: 'John Doe',
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`,
    timezone: 'America/New_York',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: new Date().toISOString()
  });

  const generateMockApiKeys = (): ApiKey[] => [
    {
      id: 'key-1',
      name: 'Production API',
      key_preview: 'aa_prod_12345...',
      permissions: ['read', 'write', 'admin'],
      created_at: '2024-01-15T10:30:00Z',
      last_used: '2024-01-20T14:22:00Z',
      is_active: true
    },
    {
      id: 'key-2', 
      name: 'Development API',
      key_preview: 'aa_dev_67890...',
      permissions: ['read', 'write'],
      created_at: '2024-01-10T08:15:00Z',
      last_used: '2024-01-19T16:45:00Z',
      is_active: true
    },
    {
      id: 'key-3',
      name: 'Testing API (Inactive)',
      key_preview: 'aa_test_abcde...',
      permissions: ['read'],
      created_at: '2024-01-05T12:00:00Z',
      last_used: '2024-01-08T09:30:00Z',
      is_active: false
    }
  ];

  const fetchUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // In production, this would fetch from Supabase
      // For now, simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfile(generateMockProfile());
      setApiKeys(generateMockApiKeys());
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
  };

  const handleSaveProfile = async (updatedProfile: Partial<UserProfile>) => {
    setSaving(true);
    try {
      // In production, this would update Supabase
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProfile(prev => prev ? { ...prev, ...updatedProfile, updated_at: new Date().toISOString() } : null);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async (updatedNotifications: NotificationPreferences) => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotifications(updatedNotifications);
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateApiKey = async (name: string, permissions: string[]) => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newKey: ApiKey = {
        id: `key-${Date.now()}`,
        name,
        key_preview: `aa_${Date.now().toString().slice(-8)}...`,
        permissions,
        created_at: new Date().toISOString(),
        is_active: true
      };
      
      setApiKeys(prev => [newKey, ...prev]);
      toast.success('API key created successfully');
      
      // Show the full key once (in production, this would be the only time it's shown)
      toast.info(`Your new API key: aa_${Date.now()}_full_key_here`, { duration: 10000 });
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeApiKey = async (keyId: string) => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      toast.success('API key revoked successfully');
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast.error('Failed to revoke API key');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <AuthenticatedNavbar
        onLogout={handleLogout}
        onTokenClick={() => {}}
        userEmail={user?.email}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              Profile & Settings
            </h1>
            <p className="text-white/70">
              Manage your account, preferences, and integrations
            </p>
          </div>
          
          {saving && (
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Saving...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              {/* User Info */}
              {profile && (
                <div className="text-center mb-6 pb-6 border-b border-dark-border">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-dark-lighter">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-8 w-8 text-white/60" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-white mb-1">
                    {profile.full_name || 'User'}
                  </h3>
                  <p className="text-white/60 text-sm">{profile.email}</p>
                </div>
              )}

              {/* Tab Navigation */}
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </motion.button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  {activeTab === 'profile' && profile && (
                    <ProfileSettings
                      profile={profile}
                      onSave={handleSaveProfile}
                      loading={saving}
                    />
                  )}
                  
                  {activeTab === 'notifications' && (
                    <NotificationSettings
                      preferences={notifications}
                      onSave={handleSaveNotifications}
                      loading={saving}
                    />
                  )}
                  
                  {activeTab === 'api-keys' && (
                    <ApiKeyManagement
                      apiKeys={apiKeys}
                      onCreate={handleCreateApiKey}
                      onRevoke={handleRevokeApiKey}
                      loading={saving}
                    />
                  )}
                  
                  {activeTab === 'billing' && (
                    <BillingSettings />
                  )}
                  
                  {activeTab === 'security' && (
                    <SecuritySettings />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileClient;