'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Zap,
  Facebook,
  Twitter,
  Linkedin,
  MessageSquare,
  Play,
  Pause,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/lib/auth/provider';
import { createClient } from '@/lib/supabase/client';

interface PostStatus {
  id: string;
  content: string;
  platform: string;
  status: 'pending' | 'processing' | 'published' | 'failed' | 'scheduled';
  scheduledAt?: string;
  publishedAt?: string;
  error?: string;
  retryCount: number;
  lastUpdated: string;
}

interface PostStatusMonitorProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const PostStatusMonitor: React.FC<PostStatusMonitorProps> = ({
  className = '',
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [posts, setPosts] = useState<PostStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(autoRefresh);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Mock data for demonstration
  const generateMockPosts = (): PostStatus[] => [
    {
      id: '1',
      content: 'Exciting announcement about our new AI features! 🚀 #AI #Innovation',
      platform: 'twitter',
      status: 'published',
      publishedAt: '2025-01-21T10:30:00Z',
      retryCount: 0,
      lastUpdated: '2025-01-21T10:30:00Z'
    },
    {
      id: '2',
      content: 'Deep dive into the future of automated content creation...',
      platform: 'linkedin',
      status: 'processing',
      retryCount: 0,
      lastUpdated: new Date().toISOString()
    },
    {
      id: '3',
      content: 'Check out our latest blog post on social media automation',
      platform: 'facebook',
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      retryCount: 0,
      lastUpdated: new Date().toISOString()
    },
    {
      id: '4',
      content: 'Weekend vibes with our amazing community! 💫',
      platform: 'instagram',
      status: 'failed',
      error: 'Authentication token expired',
      retryCount: 2,
      lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
    },
    {
      id: '5',
      content: 'Monday motivation: Automate your way to success!',
      platform: 'twitter',
      status: 'pending',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      retryCount: 0,
      lastUpdated: new Date().toISOString()
    }
  ];

  const fetchPostStatuses = async () => {
    try {
      // In production, this would fetch from Supabase
      // For now, simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate status changes for demo
      const mockPosts = generateMockPosts();
      
      // Randomly update processing posts to show real-time changes
      const updatedPosts = mockPosts.map(post => {
        if (post.status === 'processing' && Math.random() > 0.7) {
          const newStatus = Math.random() > 0.5 ? 'published' : 'failed';
          return {
            ...post,
            status: newStatus,
            publishedAt: newStatus === 'published' ? new Date().toISOString() : undefined,
            error: newStatus === 'failed' ? 'Network timeout' : undefined,
            lastUpdated: new Date().toISOString()
          } as PostStatus;
        }
        return post;
      });
      
      setPosts(updatedPosts);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch post statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostStatuses();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoRefreshing) {
      interval = setInterval(() => {
        fetchPostStatuses();
      }, refreshInterval);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAutoRefreshing, refreshInterval]);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return Facebook;
      case 'twitter':
        return Twitter;
      case 'linkedin':
        return Linkedin;
      case 'instagram':
        return MessageSquare;
      default:
        return MessageSquare;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return '#1877F2';
      case 'twitter':
        return '#1DA1F2';
      case 'linkedin':
        return '#0A66C2';
      case 'instagram':
        return '#E4405F';
      default:
        return '#6B7280';
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'published':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          borderColor: 'border-green-400/30',
          label: 'Published'
        };
      case 'processing':
        return {
          icon: RefreshCw,
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/10',
          borderColor: 'border-blue-400/30',
          label: 'Publishing...'
        };
      case 'scheduled':
        return {
          icon: Calendar,
          color: 'text-purple-400',
          bgColor: 'bg-purple-400/10',
          borderColor: 'border-purple-400/30',
          label: 'Scheduled'
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-400/10',
          borderColor: 'border-red-400/30',
          label: 'Failed'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          borderColor: 'border-yellow-400/30',
          label: 'Pending'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/30',
          label: 'Unknown'
        };
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return time.toLocaleDateString();
  };

  const formatScheduledTime = (timestamp: string) => {
    const time = new Date(timestamp);
    const now = new Date();
    const diffMs = time.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMs < 0) return 'Past due';
    if (diffHours < 1) return 'In < 1 hour';
    if (diffHours < 24) return `In ${diffHours}h`;
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  const statusCounts = posts.reduce((acc, post) => {
    acc[post.status] = (acc[post.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={`bg-dark-card border border-dark-border rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Post Status Monitor</h3>
          <p className="text-white/60 text-sm">
            Real-time tracking of your post publishing status
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-xs text-white/50">
            Last updated: {formatTimeAgo(lastRefresh.toISOString())}
          </div>
          
          <button
            onClick={() => setIsAutoRefreshing(!isAutoRefreshing)}
            className={`p-2 rounded-lg transition-colors ${
              isAutoRefreshing 
                ? 'bg-primary/20 text-primary' 
                : 'bg-dark-lighter text-white/60 hover:text-white'
            }`}
          >
            {isAutoRefreshing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          
          <button
            onClick={fetchPostStatuses}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => {
          const config = getStatusConfig(status);
          const StatusIcon = config.icon;
          
          return (
            <div
              key={status}
              className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <StatusIcon className={`h-4 w-4 ${config.color}`} />
                <span className="text-sm font-medium capitalize">{status}</span>
              </div>
              <div className={`text-xl font-bold ${config.color}`}>{count}</div>
            </div>
          );
        })}
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        <AnimatePresence>
          {posts.map((post, index) => {
            const PlatformIcon = getPlatformIcon(post.platform);
            const platformColor = getPlatformColor(post.platform);
            const statusConfig = getStatusConfig(post.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <motion.div
                key={post.id}
                className={`p-4 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${platformColor}20` }}
                  >
                    <PlatformIcon 
                      className="h-5 w-5" 
                      style={{ color: platformColor }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white capitalize">{post.platform}</h4>
                        <div className="flex items-center gap-1">
                          <StatusIcon className={`h-4 w-4 ${statusConfig.color} ${post.status === 'processing' ? 'animate-spin' : ''}`} />
                          <span className={`text-sm ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-white/50">
                        {post.status === 'scheduled' && post.scheduledAt && formatScheduledTime(post.scheduledAt)}
                        {post.status === 'published' && post.publishedAt && `Published ${formatTimeAgo(post.publishedAt)}`}
                        {post.status === 'failed' && `Failed ${formatTimeAgo(post.lastUpdated)}`}
                        {(post.status === 'pending' || post.status === 'processing') && `Updated ${formatTimeAgo(post.lastUpdated)}`}
                      </div>
                    </div>
                    
                    <p className="text-white/80 text-sm mb-2 line-clamp-2">
                      {post.content}
                    </p>
                    
                    {post.error && (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{post.error}</span>
                        {post.retryCount > 0 && (
                          <span className="text-white/50">
                            (Retry {post.retryCount})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Real-time Indicator */}
      {isAutoRefreshing && (
        <div className="flex items-center justify-center mt-6 pt-4 border-t border-dark-border">
          <div className="flex items-center gap-2 text-primary text-sm">
            <motion.div
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Zap className="h-3 w-3" />
            <span>Live monitoring active</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostStatusMonitor;