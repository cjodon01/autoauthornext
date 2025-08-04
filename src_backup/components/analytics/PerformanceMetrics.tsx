'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Eye, Heart, MessageCircle, Share, BarChart3 } from 'lucide-react';

interface EngagementData {
  date: string;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  impressions: number;
}

interface PerformanceMetricsProps {
  data?: EngagementData[];
  loading?: boolean;
  dateRange: string;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  data = [],
  loading = false,
  dateRange
}) => {
  const [activeMetric, setActiveMetric] = useState<'engagement' | 'impressions'>('engagement');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['likes', 'comments', 'shares']);

  const metricOptions = [
    { key: 'likes', label: 'Likes', color: '#FF6B6B', icon: Heart },
    { key: 'comments', label: 'Comments', color: '#4ECDC4', icon: MessageCircle },
    { key: 'shares', label: 'Shares', color: '#45B7D1', icon: Share },
    { key: 'clicks', label: 'Clicks', color: '#96CEB4', icon: TrendingUp },
    { key: 'impressions', label: 'Impressions', color: '#FECA57', icon: Eye }
  ];

  const toggleMetric = (metricKey: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricKey)
        ? prev.filter(m => m !== metricKey)
        : [...prev, metricKey]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{formatDate(label)}</p>
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

  const chartData = data.map(item => ({
    ...item,
    date: formatDate(item.date)
  }));

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Performance Metrics</h3>
          <p className="text-white/60 text-sm">
            Track your content engagement over time
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMetric('engagement')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeMetric === 'engagement'
                ? 'bg-primary text-white'
                : 'bg-dark-lighter text-white/70 hover:text-white'
            }`}
          >
            Engagement
          </button>
          <button
            onClick={() => setActiveMetric('impressions')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeMetric === 'impressions'
                ? 'bg-primary text-white'
                : 'bg-dark-lighter text-white/70 hover:text-white'
            }`}
          >
            Reach
          </button>
        </div>
      </div>

      {/* Metric Toggles */}
      <div className="flex flex-wrap gap-2 mb-6">
        {metricOptions.map((metric) => {
          if (activeMetric === 'impressions' && metric.key !== 'impressions') return null;
          if (activeMetric === 'engagement' && metric.key === 'impressions') return null;
          
          const Icon = metric.icon;
          const isSelected = selectedMetrics.includes(metric.key);
          
          return (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-dark-lighter text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4" style={{ color: metric.color }} />
              {metric.label}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 animate-pulse text-primary mx-auto mb-2" />
              <p className="text-white/60 text-sm">Loading metrics...</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-white/40 mx-auto mb-2" />
              <p className="text-white/60 text-sm">No data available for selected period</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {activeMetric === 'impressions' ? (
              <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stroke="#FECA57"
                  fill="#FECA57"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                <Legend 
                  wrapperStyle={{ color: '#9CA3AF' }}
                  formatter={(value) => (
                    <span className="capitalize text-white/70">{value}</span>
                  )}
                />
                {selectedMetrics.map((metricKey) => {
                  const metric = metricOptions.find(m => m.key === metricKey);
                  if (!metric) return null;
                  
                  return (
                    <Line
                      key={metricKey}
                      type="monotone"
                      dataKey={metricKey}
                      stroke={metric.color}
                      strokeWidth={2}
                      dot={{ fill: metric.color, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: metric.color, strokeWidth: 2 }}
                    />
                  );
                })}
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-dark-border">
        {metricOptions.slice(0, 4).map((metric) => {
          const Icon = metric.icon;
          const total = chartData.reduce((sum, item) => sum + (item[metric.key as keyof typeof item] as number || 0), 0);
          const avg = chartData.length > 0 ? Math.round(total / chartData.length) : 0;
          
          return (
            <div key={metric.key} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Icon className="h-4 w-4" style={{ color: metric.color }} />
                <span className="text-white/70 text-sm capitalize">{metric.label}</span>
              </div>
              <div className="text-xl font-bold">{formatNumber(total)}</div>
              <div className="text-white/50 text-xs">Avg: {formatNumber(avg)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PerformanceMetrics;