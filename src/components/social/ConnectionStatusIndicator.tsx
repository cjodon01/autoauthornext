'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';

interface ConnectionStatusIndicatorProps {
  connectionId: string;
  platform: string;
  status: 'connected' | 'expired' | 'error' | 'refreshing' | 'disconnected';
  lastChecked?: string;
  expiresAt?: string;
  onRefresh?: () => void;
  className?: string;
  showDetails?: boolean;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  connectionId,
  platform,
  status,
  lastChecked,
  expiresAt,
  onRefresh,
  className = '',
  showDetails = true
}) => {
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<string>('');

  useEffect(() => {
    if (expiresAt && status === 'connected') {
      const updateTimer = () => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeUntilExpiry('Expired');
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeUntilExpiry(`${days}d ${hours}h`);
        } else if (hours > 0) {
          setTimeUntilExpiry(`${hours}h ${minutes}m`);
        } else {
          setTimeUntilExpiry(`${minutes}m`);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [expiresAt, status]);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          borderColor: 'border-green-400/30',
          label: 'Connected',
          description: 'Connection is active and healthy'
        };
      case 'expired':
        return {
          icon: AlertCircle,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          borderColor: 'border-yellow-400/30',
          label: 'Token Expired',
          description: 'Authentication token needs refresh'
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-400/10',
          borderColor: 'border-red-400/30',
          label: 'Connection Error',
          description: 'Unable to connect to platform'
        };
      case 'refreshing':
        return {
          icon: RefreshCw,
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/10',
          borderColor: 'border-blue-400/30',
          label: 'Refreshing...',
          description: 'Updating connection credentials'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/30',
          label: 'Disconnected',
          description: 'No active connection'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/30',
          label: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  const formatLastChecked = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const checked = new Date(timestamp);
    const diff = now.getTime() - checked.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const shouldShowWarning = () => {
    if (!expiresAt || status !== 'connected') return false;
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const hoursUntilExpiry = diff / (1000 * 60 * 60);
    
    return hoursUntilExpiry < 24; // Show warning if expires within 24 hours
  };

  return (
    <motion.div 
      className={`${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {showDetails ? (
        <div className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <StatusIcon 
                className={`h-4 w-4 ${config.color} ${status === 'refreshing' ? 'animate-spin' : ''}`}
              />
              <span className={`text-sm font-medium ${config.color}`}>
                {config.label}
              </span>
            </div>
            
            {onRefresh && (status === 'expired' || status === 'error') && (
              <button
                onClick={onRefresh}
                className={`p-1 rounded hover:bg-white/10 transition-colors ${config.color}`}
                disabled={false}
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className="space-y-1 text-xs">
            <div className="text-white/60">{config.description}</div>
            
            {lastChecked && (
              <div className="text-white/50">
                Last checked: {formatLastChecked(lastChecked)}
              </div>
            )}
            
            {timeUntilExpiry && status === 'connected' && (
              <div className={`flex items-center gap-1 ${shouldShowWarning() ? 'text-yellow-400' : 'text-white/50'}`}>
                <Clock className="h-3 w-3" />
                <span>
                  {shouldShowWarning() ? 'Expires soon: ' : 'Expires in: '}
                  {timeUntilExpiry}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <StatusIcon 
            className={`h-4 w-4 ${config.color} ${status === 'refreshing' ? 'animate-spin' : ''}`}
          />
          <span className={`text-sm ${config.color}`}>
            {config.label}
          </span>
          {shouldShowWarning() && (
            <motion.div
              className="w-2 h-2 rounded-full bg-yellow-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ConnectionStatusIndicator;