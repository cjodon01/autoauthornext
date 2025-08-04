'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Heart, MessageCircle, Share, TrendingUp, Calendar } from 'lucide-react';

interface EngagementData {
  date: string;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  impressions: number;
}

interface EngagementChartsProps {
  data?: EngagementData[];
  loading?: boolean;
  dateRange: string;
}

const EngagementCharts: React.FC<EngagementChartsProps> = ({
  data = [],
  loading = false,
  dateRange
}) => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  const colors = {
    likes: '#FF6B6B',
    comments: '#4ECDC4',
    shares: '#45B7D1',
    clicks: '#96CEB4'
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
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate totals for pie chart
  const totalEngagement = data.reduce((acc, item) => ({
    likes: acc.likes + item.likes,
    comments: acc.comments + item.comments,
    shares: acc.shares + item.shares,
    clicks: acc.clicks + item.clicks
  }), { likes: 0, comments: 0, shares: 0, clicks: 0 });

  const pieData = [
    { name: 'Likes', value: totalEngagement.likes, color: colors.likes },
    { name: 'Comments', value: totalEngagement.comments, color: colors.comments },
    { name: 'Shares', value: totalEngagement.shares, color: colors.shares },
    { name: 'Clicks', value: totalEngagement.clicks, color: colors.clicks }
  ].filter(item => item.value > 0);

  const chartData = data.map(item => ({
    ...item,
    date: formatDate(item.date),
    total: item.likes + item.comments + item.shares + item.clicks
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-white/70 capitalize">{entry.dataKey}:</span>
              <span className="text-white font-medium">{formatNumber(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.payload.color }}
            />
            <span className="text-white/70">{data.name}:</span>
            <span className="text-white font-medium">{formatNumber(data.value)}</span>
            <span className="text-white/50">({data.payload.percent?.toFixed(1)}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate engagement trends
  const getEngagementTrend = () => {
    if (chartData.length < 2) return { trend: 0, direction: 'neutral' };
    
    const recent = chartData.slice(-7).reduce((sum, item) => sum + item.total, 0);
    const previous = chartData.slice(-14, -7).reduce((sum, item) => sum + item.total, 0);
    
    if (previous === 0) return { trend: 0, direction: 'neutral' };
    
    const change = ((recent - previous) / previous) * 100;
    return {
      trend: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
  };

  const trend = getEngagementTrend();

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Engagement Breakdown</h3>
          <div className="flex items-center gap-2">
            <p className="text-white/60 text-sm">
              Distribution of engagement types
            </p>
            {trend.direction !== 'neutral' && (
              <div className={`flex items-center gap-1 text-sm ${
                trend.direction === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                <TrendingUp className={`h-3 w-3 ${trend.direction === 'down' ? 'rotate-180' : ''}`} />
                <span>{trend.trend.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'bar'
                ? 'bg-primary text-white'
                : 'bg-dark-lighter text-white/70 hover:text-white'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'pie'
                ? 'bg-primary text-white'
                : 'bg-dark-lighter text-white/70 hover:text-white'
            }`}
          >
            Distribution
          </button>
        </div>
      </div>

      <div className="h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Heart className="h-8 w-8 animate-pulse text-secondary mx-auto mb-2" />
              <p className="text-white/60 text-sm">Loading engagement data...</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Heart className="h-8 w-8 text-white/40 mx-auto mb-2" />
              <p className="text-white/60 text-sm">No engagement data available</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={formatNumber}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="likes" stackId="a" fill={colors.likes} />
                <Bar dataKey="comments" stackId="a" fill={colors.comments} />
                <Bar dataKey="shares" stackId="a" fill={colors.shares} />
                <Bar dataKey="clicks" stackId="a" fill={colors.clicks} />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent || 0).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-dark-border">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Heart className="h-4 w-4 text-red-400" />
            <span className="text-white/70 text-sm">Likes</span>
          </div>
          <div className="text-lg font-bold">{formatNumber(totalEngagement.likes)}</div>
          <div className="text-white/50 text-xs">
            {totalEngagement.likes > 0 ? 
              ((totalEngagement.likes / (totalEngagement.likes + totalEngagement.comments + totalEngagement.shares + totalEngagement.clicks)) * 100).toFixed(1) 
              : '0'
            }%
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <MessageCircle className="h-4 w-4 text-teal-400" />
            <span className="text-white/70 text-sm">Comments</span>
          </div>
          <div className="text-lg font-bold">{formatNumber(totalEngagement.comments)}</div>
          <div className="text-white/50 text-xs">
            {totalEngagement.comments > 0 ? 
              ((totalEngagement.comments / (totalEngagement.likes + totalEngagement.comments + totalEngagement.shares + totalEngagement.clicks)) * 100).toFixed(1) 
              : '0'
            }%
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Share className="h-4 w-4 text-blue-400" />
            <span className="text-white/70 text-sm">Shares</span>
          </div>
          <div className="text-lg font-bold">{formatNumber(totalEngagement.shares)}</div>
          <div className="text-white/50 text-xs">
            {totalEngagement.shares > 0 ? 
              ((totalEngagement.shares / (totalEngagement.likes + totalEngagement.comments + totalEngagement.shares + totalEngagement.clicks)) * 100).toFixed(1) 
              : '0'
            }%
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-white/70 text-sm">Clicks</span>
          </div>
          <div className="text-lg font-bold">{formatNumber(totalEngagement.clicks)}</div>
          <div className="text-white/50 text-xs">
            {totalEngagement.clicks > 0 ? 
              ((totalEngagement.clicks / (totalEngagement.likes + totalEngagement.comments + totalEngagement.shares + totalEngagement.clicks)) * 100).toFixed(1) 
              : '0'
            }%
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementCharts;