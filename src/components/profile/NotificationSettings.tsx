'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  BarChart3, 
  AlertTriangle, 
  Calendar,
  Save,
  Volume2,
  VolumeX,
  Check
} from 'lucide-react';

interface NotificationPreferences {
  email_marketing: boolean;
  email_updates: boolean;
  email_errors: boolean;
  push_notifications: boolean;
  weekly_reports: boolean;
  campaign_reminders: boolean;
}

interface NotificationSettingsProps {
  preferences: NotificationPreferences;
  onSave: (preferences: NotificationPreferences) => Promise<void>;
  loading: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  preferences,
  onSave,
  loading
}) => {
  const [formData, setFormData] = useState<NotificationPreferences>(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData(preferences);
  }, [preferences]);

  useEffect(() => {
    const changed = Object.keys(preferences).some(key => {
      const prefKey = key as keyof NotificationPreferences;
      return formData[prefKey] !== preferences[prefKey];
    });
    setHasChanges(changed);
  }, [formData, preferences]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setFormData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setHasChanges(false);
  };

  const handleSelectAll = (enabled: boolean) => {
    const newData = Object.keys(formData).reduce((acc, key) => {
      acc[key as keyof NotificationPreferences] = enabled;
      return acc;
    }, {} as NotificationPreferences);
    
    setFormData(newData);
  };

  const notificationGroups = [
    {
      title: 'Email Notifications',
      icon: Mail,
      description: 'Receive updates and alerts via email',
      settings: [
        {
          key: 'email_updates' as keyof NotificationPreferences,
          label: 'Product Updates',
          description: 'New features, improvements, and important announcements'
        },
        {
          key: 'email_errors' as keyof NotificationPreferences,
          label: 'Error Alerts',
          description: 'Notifications when posts fail or require attention'
        },
        {
          key: 'email_marketing' as keyof NotificationPreferences,
          label: 'Marketing & Tips',
          description: 'Tips, best practices, and promotional content'
        }
      ]
    },
    {
      title: 'Push Notifications',
      icon: Smartphone,
      description: 'Real-time notifications to your browser',
      settings: [
        {
          key: 'push_notifications' as keyof NotificationPreferences,
          label: 'Browser Notifications',
          description: 'Real-time alerts for important events and errors'
        }
      ]
    },
    {
      title: 'Reports & Reminders',
      icon: BarChart3,
      description: 'Scheduled reports and campaign reminders',
      settings: [
        {
          key: 'weekly_reports' as keyof NotificationPreferences,
          label: 'Weekly Reports',
          description: 'Weekly summary of your post performance and analytics'
        },
        {
          key: 'campaign_reminders' as keyof NotificationPreferences,
          label: 'Campaign Reminders',
          description: 'Notifications about upcoming campaigns and scheduled posts'
        }
      ]
    }
  ];

  const enabledCount = Object.values(formData).filter(Boolean).length;
  const totalCount = Object.keys(formData).length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notification Preferences
        </h2>
        <p className="text-white/70 text-sm">
          Choose how and when you want to receive notifications
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Summary Card */}
        <div className="bg-dark-lighter border border-dark-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium text-white">Notification Summary</h3>
              <p className="text-white/60 text-sm">
                {enabledCount} of {totalCount} notification types enabled
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="text-sm text-white/70 hover:text-white px-3 py-1 hover:bg-white/5 rounded transition-colors"
              >
                Disable All
              </button>
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="text-sm text-primary hover:text-primary/80 px-3 py-1 hover:bg-primary/10 rounded transition-colors"
              >
                Enable All
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-dark-border rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(enabledCount / totalCount) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Notification Groups */}
        {notificationGroups.map((group) => {
          const GroupIcon = group.icon;
          const groupEnabled = group.settings.some(setting => formData[setting.key]);
          
          return (
            <div key={group.title} className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-dark-border">
                <div className={`p-2 rounded-lg ${groupEnabled ? 'bg-primary/20 text-primary' : 'bg-dark-lighter text-white/60'}`}>
                  <GroupIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{group.title}</h3>
                  <p className="text-white/60 text-sm">{group.description}</p>
                </div>
              </div>

              <div className="space-y-3 ml-6">
                {group.settings.map((setting) => (
                  <motion.div
                    key={setting.key}
                    className="flex items-start justify-between p-3 bg-dark-lighter/50 rounded-lg hover:bg-dark-lighter transition-colors"
                    whileHover={{ x: 2 }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white">{setting.label}</h4>
                        {formData[setting.key] && (
                          <Check className="h-3 w-3 text-green-400" />
                        )}
                      </div>
                      <p className="text-white/60 text-sm">{setting.description}</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleToggle(setting.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        formData[setting.key] ? 'bg-primary' : 'bg-dark-border'
                      }`}
                    >
                      <motion.span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData[setting.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                        layout
                      />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Additional Settings */}
        <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-400 mb-2">Important Notes</h4>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Critical security alerts cannot be disabled</li>
                <li>• Email notifications require email verification</li>
                <li>• Push notifications require browser permission</li>
                <li>• Some notifications may be delayed during high traffic periods</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Push Notification Permission */}
        {formData.push_notifications && (
          <div className="bg-blue-400/10 border border-blue-400/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-blue-400" />
                <div>
                  <h4 className="font-medium text-blue-400">Browser Permission Required</h4>
                  <p className="text-white/70 text-sm">
                    Click &quot;Allow&quot; when prompted to enable push notifications
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  if ('Notification' in window) {
                    Notification.requestPermission();
                  }
                }}
                className="text-sm text-blue-400 hover:text-blue-300 px-3 py-1 hover:bg-blue-400/10 rounded transition-colors"
              >
                Enable Permission
              </button>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-between pt-6 border-t border-dark-border">
          <div>
            {hasChanges && (
              <p className="text-amber-400 text-sm flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                You have unsaved changes
              </p>
            )}
          </div>
          
          <motion.button
            type="submit"
            disabled={!hasChanges || loading}
            className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: hasChanges && !loading ? 1.02 : 1 }}
            whileTap={{ scale: hasChanges && !loading ? 0.98 : 1 }}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Preferences
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSettings;