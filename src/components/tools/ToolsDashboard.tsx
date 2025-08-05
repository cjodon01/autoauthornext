'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Zap,
  Sparkles,
  BookOpen,
  MessageSquare,
  Image,
  Type,
  Search,
  Calendar,
  Settings,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';
import { ToolErrorHandler, SuccessFeedback } from '../../utils/errorHandling';
import { useToolOperations } from '../../hooks/useToolOperations';

interface ToolUsage {
  tool_id: string;
  usage_count: number;
  last_used: string | null;
  success_rate: number;
}

interface ToolStats {
  total_operations: number;
  successful_operations: number;
  failed_operations: number;
  average_response_time: number;
  most_used_tool: string;
  recent_activity: ToolUsage[];
}

const ToolsDashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  const [toolStats, setToolStats] = useState<ToolStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use the tool operations hook for data fetching
  const { executeOperation, loading: statsLoading } = useToolOperations<ToolStats>('tools-dashboard');

  useEffect(() => {
    if (user) {
      fetchToolStats();
      fetchRecentActivity();
    }
  }, [user]);

  const fetchToolStats = async () => {
    await executeOperation(async () => {
      // This would typically fetch from a stats table
      // For now, we'll simulate the data
      const mockStats: ToolStats = {
        total_operations: 1247,
        successful_operations: 1189,
        failed_operations: 58,
        average_response_time: 2.3,
        most_used_tool: 'post-now',
        recent_activity: [
          { tool_id: 'post-now', usage_count: 456, last_used: new Date().toISOString(), success_rate: 0.98 },
          { tool_id: 'journal', usage_count: 234, last_used: new Date().toISOString(), success_rate: 0.95 },
          { tool_id: 'media-generator', usage_count: 189, last_used: new Date().toISOString(), success_rate: 0.92 },
          { tool_id: 'meme-creator', usage_count: 156, last_used: new Date().toISOString(), success_rate: 0.94 },
          { tool_id: 'image-search', usage_count: 212, last_used: new Date().toISOString(), success_rate: 0.96 }
        ]
      };
      
      setToolStats(mockStats);
      return mockStats;
    }, 'Tool Statistics');
  };

  const fetchRecentActivity = async () => {
    try {
      // This would fetch recent activity from the database
      // For now, we'll use mock data
      const mockActivity = [
        {
          id: 1,
          tool: 'post-now',
          action: 'Created post',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          status: 'success'
        },
        {
          id: 2,
          tool: 'journal',
          action: 'Generated AI content',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          status: 'success'
        },
        {
          id: 3,
          tool: 'media-generator',
          action: 'Generated image',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'success'
        },
        {
          id: 4,
          tool: 'meme-creator',
          action: 'Created meme',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          status: 'success'
        }
      ];
      
      setRecentActivity(mockActivity);
    } catch (error) {
      ToolErrorHandler.handle(error, 'Recent Activity');
    } finally {
      setIsLoading(false);
    }
  };

  const getToolIcon = (toolId: string) => {
    const icons: Record<string, React.ElementType> = {
      'post-now': MessageSquare,
      'journal': BookOpen,
      'media-generator': Sparkles,
      'meme-creator': Type,
      'image-search': Search
    };
    return icons[toolId] || Settings;
  };

  const getToolName = (toolId: string) => {
    const names: Record<string, string> = {
      'post-now': 'Post Now',
      'journal': 'Journal',
      'media-generator': 'Media Generator',
      'meme-creator': 'Meme Creator',
      'image-search': 'Image Search'
    };
    return names[toolId] || toolId;
  };

  const getToolColor = (toolId: string) => {
    const colors: Record<string, string> = {
      'post-now': '#3B82F6',
      'journal': '#10B981',
      'media-generator': '#8B5CF6',
      'meme-creator': '#F59E0B',
      'image-search': '#EF4444'
    };
    return colors[toolId] || '#6B7280';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleToolClick = (toolId: string) => {
    router.push(`/tools/${toolId}`);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([fetchToolStats(), fetchRecentActivity()]);
    SuccessFeedback.show('Dashboard refreshed', 'Latest data loaded');
  };

  if (isLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Tools Dashboard</h2>
          <p className="text-white/70">Overview of your content creation tools</p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn btn-secondary inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {toolStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-card border border-dark-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Operations</p>
                <p className="text-2xl font-bold text-white">{toolStats.total_operations.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-card border border-dark-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-green-500">
                  {((toolStats.successful_operations / toolStats.total_operations) * 100).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-dark-card border border-dark-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Avg Response Time</p>
                <p className="text-2xl font-bold text-white">{toolStats.average_response_time}s</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-dark-card border border-dark-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Most Used Tool</p>
                <p className="text-lg font-semibold text-white capitalize">
                  {getToolName(toolStats.most_used_tool)}
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Tool Usage Overview */}
      {toolStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-dark-card border border-dark-border rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Tool Usage Overview</h3>
          <div className="space-y-4">
            {toolStats.recent_activity.map((tool, index) => {
              const Icon = getToolIcon(tool.tool_id);
              const color = getToolColor(tool.tool_id);
              
              return (
                <div
                  key={tool.tool_id}
                  className="flex items-center justify-between p-4 bg-dark-lighter rounded-lg cursor-pointer hover:bg-dark-border transition-colors"
                  onClick={() => handleToolClick(tool.tool_id)}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="h-5 w-5" style={{ color }} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{getToolName(tool.tool_id)}</p>
                      <p className="text-sm text-white/60">
                        {tool.usage_count} operations • {(tool.success_rate * 100).toFixed(1)}% success
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/60">
                      {tool.last_used ? formatTimeAgo(tool.last_used) : 'Never'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-white/60">Active</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-dark-card border border-dark-border rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity) => {
            const Icon = getToolIcon(activity.tool);
            const color = getToolColor(activity.tool);
            
            return (
              <div key={activity.id} className="flex items-center gap-4 p-3 bg-dark-lighter rounded-lg">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.action}</p>
                  <p className="text-sm text-white/60">{getToolName(activity.tool)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/60">{formatTimeAgo(activity.timestamp)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {activity.status === 'success' ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-xs text-white/60 capitalize">{activity.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-dark-card border border-dark-border rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleToolClick('post-now')}
            className="p-4 bg-dark-lighter rounded-lg border border-dark-border hover:border-primary/50 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-2 group-hover:bg-blue-500/30 transition-colors">
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </div>
            <h4 className="font-medium text-white text-sm">Post Now</h4>
            <p className="text-xs text-white/60">Quick post creation</p>
          </button>

          <button
            onClick={() => handleToolClick('journal')}
            className="p-4 bg-dark-lighter rounded-lg border border-dark-border hover:border-primary/50 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mb-2 group-hover:bg-green-500/30 transition-colors">
              <BookOpen className="h-4 w-4 text-green-500" />
            </div>
            <h4 className="font-medium text-white text-sm">Journal</h4>
            <p className="text-xs text-white/60">AI-powered entries</p>
          </button>

          <button
            onClick={() => handleToolClick('media-generator')}
            className="p-4 bg-dark-lighter rounded-lg border border-dark-border hover:border-primary/50 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mb-2 group-hover:bg-purple-500/30 transition-colors">
              <Sparkles className="h-4 w-4 text-purple-500" />
            </div>
            <h4 className="font-medium text-white text-sm">Generate</h4>
            <p className="text-xs text-white/60">AI media creation</p>
          </button>

          <button
            onClick={() => handleToolClick('meme-creator')}
            className="p-4 bg-dark-lighter rounded-lg border border-dark-border hover:border-primary/50 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center mb-2 group-hover:bg-orange-500/30 transition-colors">
              <Type className="h-4 w-4 text-orange-500" />
            </div>
            <h4 className="font-medium text-white text-sm">Meme</h4>
            <p className="text-xs text-white/60">Create memes</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ToolsDashboard; 