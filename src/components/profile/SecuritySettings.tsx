'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Key, 
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Clock,
  Monitor,
  MapPin,
  RotateCcw,
  Save,
  XCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface LoginSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'password_change' | 'api_key_created' | 'failed_login';
  description: string;
  timestamp: string;
  ip: string;
  location: string;
}

const SecuritySettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock data
  const activeSessions: LoginSession[] = [
    {
      id: 'session-1',
      device: 'MacBook Pro',
      browser: 'Chrome 120.0',
      location: 'New York, NY',
      ip: '192.168.1.100',
      lastActive: new Date().toISOString(),
      isCurrent: true
    },
    {
      id: 'session-2',
      device: 'iPhone 15',
      browser: 'Safari Mobile',
      location: 'New York, NY',
      ip: '192.168.1.101',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isCurrent: false
    },
    {
      id: 'session-3',
      device: 'Windows PC',
      browser: 'Edge 120.0',
      location: 'Brooklyn, NY',
      ip: '192.168.1.102',
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isCurrent: false
    }
  ];

  const securityEvents: SecurityEvent[] = [
    {
      id: 'event-1',
      type: 'login',
      description: 'Successful login from new device',
      timestamp: new Date().toISOString(),
      ip: '192.168.1.100',
      location: 'New York, NY'
    },
    {
      id: 'event-2',
      type: 'api_key_created',
      description: 'New API key created: Production API',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      ip: '192.168.1.100',
      location: 'New York, NY'
    },
    {
      id: 'event-3',
      type: 'failed_login',
      description: 'Failed login attempt',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      ip: '192.168.1.200',
      location: 'Unknown'
    }
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Session revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  const handleToggle2FA = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTwoFactorEnabled(!twoFactorEnabled);
      toast.success(`Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update two-factor authentication');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'password_change':
        return <Lock className="h-4 w-4 text-blue-400" />;
      case 'api_key_created':
        return <Key className="h-4 w-4 text-purple-400" />;
      case 'failed_login':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    }
  };

  const getEventColor = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return 'bg-green-400/10 border-green-400/20';
      case 'password_change':
        return 'bg-blue-400/10 border-blue-400/20';
      case 'api_key_created':
        return 'bg-purple-400/10 border-purple-400/20';
      case 'failed_login':
        return 'bg-red-400/10 border-red-400/20';
      default:
        return 'bg-amber-400/10 border-amber-400/20';
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Security Settings
        </h2>
        <p className="text-white/70 text-sm">
          Manage your account security and monitor login activity
        </p>
      </div>

      <div className="space-y-8">
        {/* Password Change */}
        <div className="bg-dark-lighter border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Change Password
          </h3>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => {
                    setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }));
                    if (errors.currentPassword) setErrors(prev => ({ ...prev, currentPassword: '' }));
                  }}
                  className={`w-full bg-dark-lighter border rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:ring-2 transition-colors ${
                    errors.currentPassword
                      ? 'border-red-400 focus:ring-red-400/50'
                      : 'border-dark-border focus:ring-primary/50'
                  }`}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
                    if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: '' }));
                  }}
                  className={`w-full bg-dark-lighter border rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:ring-2 transition-colors ${
                    errors.newPassword
                      ? 'border-red-400 focus:ring-red-400/50'
                      : 'border-dark-border focus:ring-primary/50'
                  }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => {
                    setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  className={`w-full bg-dark-lighter border rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:ring-2 transition-colors ${
                    errors.confirmPassword
                      ? 'border-red-400 focus:ring-red-400/50'
                      : 'border-dark-border focus:ring-primary/50'
                  }`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Password
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-dark-lighter border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Two-Factor Authentication
              </h3>
              <p className="text-white/70 text-sm">
                Add an extra layer of security to your account
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                twoFactorEnabled 
                  ? 'bg-green-400/20 text-green-400'
                  : 'bg-red-400/20 text-red-400'
              }`}>
                {twoFactorEnabled ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </div>

              <button
                onClick={handleToggle2FA}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  twoFactorEnabled ? 'bg-primary' : 'bg-dark-border'
                }`}
              >
                <motion.span
                  className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  animate={{ x: twoFactorEnabled ? 24 : 2 }}
                />
              </button>
            </div>
          </div>

          {!twoFactorEnabled && (
            <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-400 font-medium mb-1">Enhance Your Security</p>
                  <p className="text-white/80 text-sm">
                    Enable two-factor authentication to significantly improve your account security. 
                    You'll need an authenticator app like Google Authenticator or Authy.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div className="bg-dark-lighter border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            Active Sessions
          </h3>

          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-dark-lighter/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-dark rounded-lg">
                    <Monitor className="h-5 w-5 text-white/80" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white">{session.device}</p>
                      {session.isCurrent && (
                        <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
                          Current Session
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>{session.browser}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>

                {!session.isCurrent && (
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-red-400 hover:text-red-300 text-sm px-3 py-1 hover:bg-red-400/10 rounded transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-400/10 border border-blue-400/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              If you see any unfamiliar sessions, revoke them immediately and change your password.
            </div>
          </div>
        </div>

        {/* Security Activity Log */}
        <div className="bg-dark-lighter border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Security Activity
            </h3>
            <button className="text-primary hover:text-primary/80 text-sm">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {securityEvents.map((event) => (
              <div key={event.id} className={`p-4 border rounded-lg ${getEventColor(event.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getEventIcon(event.type)}
                    <div>
                      <p className="font-medium text-white mb-1">{event.description}</p>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>{format(new Date(event.timestamp), 'MMM dd, yyyy \'at\' h:mm a')}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                        <span>IP: {event.ip}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Recovery */}
        <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <RotateCcw className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-400 mb-2">Account Recovery</h4>
              <p className="text-white/80 text-sm mb-3">
                Make sure you have a way to recover your account if you lose access. 
                Keep your email address up to date and consider setting up backup authentication methods.
              </p>
              <button className="text-amber-400 hover:text-amber-300 text-sm font-medium">
                Learn More About Account Recovery →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;