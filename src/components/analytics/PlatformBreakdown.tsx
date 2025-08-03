'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageSquare,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react';

interface PlatformData {
  platform: string;
  posts: number;
  engagement: number;
  followers: number;
  engagementRate: number;
  color: string;
}

interface PlatformBreakdownProps {
  data?: PlatformData[];
  loading?: boolean;
}

const PlatformBreakdown: React.FC<PlatformBreakdownProps> = ({
  data = [],
  loading = false
}) => {
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const totalEngagement = data.reduce((sum, platform) => sum + platform.engagement, 0);
  const totalPosts = data.reduce((sum, platform) => sum + platform.posts, 0);
  const totalFollowers = data.reduce((sum, platform) => sum + platform.followers, 0);

  const sortedData = [...data].sort((a, b) => b.engagement - a.engagement);

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Platform Performance</h3>
          <p className="text-white/60 text-sm">
            Engagement breakdown by platform
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{data.length}</div>
          <div className="text-white/60 text-sm">Connected</div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 animate-pulse text-primary mx-auto mb-2" />
            <p className="text-white/60 text-sm">Loading platform data...</p>
          </div>
        </div>
      ) : sortedData.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-white/40 mx-auto mb-2" />
            <p className="text-white/60 text-sm">No platform data available</p>
            <p className="text-white/40 text-xs mt-1">Connect your social accounts to see analytics</p>
          </div>
        </div>
      ) : (
        <>
          {/* Platform List */}
          <div className="space-y-4 mb-6">
            {sortedData.map((platform, index) => {
              const Icon = getPlatformIcon(platform.platform);
              const engagementPercentage = totalEngagement > 0 ? (platform.engagement / totalEngagement) * 100 : 0;
              
              return (
                <motion.div
                  key={platform.platform}
                  className="bg-dark-lighter rounded-lg p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${platform.color}20` }}
                    >
                      <Icon 
                        className="h-5 w-5" 
                        style={{ color: platform.color }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{platform.platform}</h4>
                        <span className="text-sm text-white/60">
                          {engagementPercentage.toFixed(1)}% of total
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-white/70">
                        <span>{platform.posts} posts</span>
                        <span>{formatNumber(platform.followers)} followers</span>
                        <span>{platform.engagementRate.toFixed(1)}% rate</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Engagement Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Engagement</span>
                      <span className="font-medium">{formatNumber(platform.engagement)}</span>
                    </div>
                    <div className="w-full bg-dark-border rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: platform.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${engagementPercentage}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-dark-border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-white/70 text-sm">Total Posts</span>
              </div>
              <div className="text-xl font-bold">{totalPosts}</div>
              <div className="text-white/50 text-xs">
                Avg: {totalPosts > 0 ? Math.round(totalPosts / data.length) : 0} per platform
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-secondary" />
                <span className="text-white/70 text-sm">Engagement</span>
              </div>
              <div className="text-xl font-bold">{formatNumber(totalEngagement)}</div>
              <div className="text-white/50 text-xs">
                Avg: {formatNumber(totalEngagement > 0 ? Math.round(totalEngagement / data.length) : 0)} per platform
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="h-4 w-4 text-accent" />
                <span className="text-white/70 text-sm">Followers</span>
              </div>
              <div className="text-xl font-bold">{formatNumber(totalFollowers)}</div>
              <div className="text-white/50 text-xs">
                Avg: {formatNumber(totalFollowers > 0 ? Math.round(totalFollowers / data.length) : 0)} per platform
              </div>
            </div>
          </div>

          {/* Top Performer */}
          {sortedData.length > 0 && (
            <div className="mt-6 pt-6 border-t border-dark-border">
              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">
                    🏆 Top Performer: {sortedData[0].platform}
                  </div>
                  <div className="text-sm text-white/70">
                    {formatNumber(sortedData[0].engagement)} engagement ({sortedData[0].engagementRate.toFixed(1)}% rate)
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PlatformBreakdown;