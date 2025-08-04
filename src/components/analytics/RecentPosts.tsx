'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageSquare,
  Heart,
  Share,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Clock,
  BarChart3,
  Eye
} from 'lucide-react';

interface PostPerformance {
  id: string;
  content: string;
  platform: string;
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  impressions: number;
  engagementRate: number;
}

interface RecentPostsProps {
  posts?: PostPerformance[];
  loading?: boolean;
  onRefresh?: () => void;
}

const RecentPosts: React.FC<RecentPostsProps> = ({
  posts = [],
  loading = false,
  onRefresh
}) => {
  const [selectedPost, setSelectedPost] = useState<PostPerformance | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'engagement' | 'impressions'>('date');

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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'engagement':
        return (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares);
      case 'impressions':
        return b.impressions - a.impressions;
      case 'date':
      default:
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
  });

  const getPerformanceStatus = (post: PostPerformance) => {
    if (post.engagementRate > 10) {
      return { status: 'excellent', color: 'text-green-400', label: 'Excellent' };
    } else if (post.engagementRate > 5) {
      return { status: 'good', color: 'text-blue-400', label: 'Good' };
    } else if (post.engagementRate > 2) {
      return { status: 'average', color: 'text-yellow-400', label: 'Average' };
    } else {
      return { status: 'poor', color: 'text-red-400', label: 'Needs Improvement' };
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Recent Posts Performance</h3>
          <p className="text-white/60 text-sm">
            Track individual post metrics and engagement
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'engagement' | 'impressions')}
            className="bg-dark-lighter border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="date">Sort by Date</option>
            <option value="engagement">Sort by Engagement</option>
            <option value="impressions">Sort by Impressions</option>
          </select>
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 animate-pulse text-primary mx-auto mb-2" />
            <p className="text-white/60 text-sm">Loading recent posts...</p>
          </div>
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-white/40 mx-auto mb-2" />
            <p className="text-white/60 text-sm">No recent posts found</p>
            <p className="text-white/40 text-xs mt-1">Create some posts to see analytics here</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map((post, index) => {
            const Icon = getPlatformIcon(post.platform);
            const platformColor = getPlatformColor(post.platform);
            const performance = getPerformanceStatus(post);
            const totalEngagement = post.likes + post.comments + post.shares;
            
            return (
              <motion.div
                key={post.id}
                className="bg-dark-lighter rounded-lg p-4 hover:bg-dark-lighter/80 transition-colors cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
              >
                <div className="flex items-start gap-4">
                  {/* Platform Icon */}
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${platformColor}20` }}
                  >
                    <Icon 
                      className="h-5 w-5" 
                      style={{ color: platformColor }}
                    />
                  </div>
                  
                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{post.platform}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${performance.color} bg-current/10`}>
                          {performance.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{formatDate(post.publishedAt)}</span>
                      </div>
                    </div>
                    
                    <p className="text-white/80 text-sm mb-3 leading-relaxed">
                      {truncateContent(post.content)}
                    </p>
                    
                    {/* Quick Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1 text-white/60">
                        <Heart className="h-3 w-3" />
                        <span>{formatNumber(post.likes)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/60">
                        <MessageSquare className="h-3 w-3" />
                        <span>{formatNumber(post.comments)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/60">
                        <Share className="h-3 w-3" />
                        <span>{formatNumber(post.shares)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/60">
                        <Eye className="h-3 w-3" />
                        <span>{formatNumber(post.impressions)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary ml-auto">
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-medium">{post.engagementRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {selectedPost?.id === post.id && (
                  <motion.div
                    className="mt-4 pt-4 border-t border-dark-border"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-dark-card rounded-lg">
                        <div className="text-lg font-bold text-red-400">{formatNumber(post.likes)}</div>
                        <div className="text-xs text-white/60">Likes</div>
                      </div>
                      <div className="text-center p-3 bg-dark-card rounded-lg">
                        <div className="text-lg font-bold text-blue-400">{formatNumber(post.comments)}</div>
                        <div className="text-xs text-white/60">Comments</div>
                      </div>
                      <div className="text-center p-3 bg-dark-card rounded-lg">
                        <div className="text-lg font-bold text-green-400">{formatNumber(post.shares)}</div>
                        <div className="text-xs text-white/60">Shares</div>
                      </div>
                      <div className="text-center p-3 bg-dark-card rounded-lg">
                        <div className="text-lg font-bold text-yellow-400">{formatNumber(post.clicks)}</div>
                        <div className="text-xs text-white/60">Clicks</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white/70">
                        <strong>Total Engagement:</strong> {formatNumber(totalEngagement)} 
                        <span className="ml-2">({post.engagementRate.toFixed(2)}% rate)</span>
                      </div>
                      <button className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm">
                        <ExternalLink className="h-3 w-3" />
                        View Details
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentPosts;