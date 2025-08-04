'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
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
import { 
  Coins, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Zap,
  Brain,
  FileText,
  Image as ImageIcon,
  BarChart3,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../lib/auth/provider';

interface TokenUsageData {
  date: string;
  totalTokens: number;
  aiGeneration: number;
  imageGeneration: number;
  textProcessing: number;
  cost: number;
}

interface TokenBreakdown {
  category: string;
  tokens: number;
  cost: number;
  percentage: number;
  color: string;
  icon: React.ElementType;
}

interface TokenUsageAnalyticsProps {
  className?: string;
  dateRange?: string;
}

const TokenUsageAnalytics: React.FC<TokenUsageAnalyticsProps> = ({
  className = '',
  dateRange = '30d'
}) => {
  const { user } = useAuth();
  const [usageData, setUsageData] = useState<TokenUsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'usage' | 'cost'>('usage');

  // Generate mock token usage data
  const generateMockData = (): TokenUsageData[] => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const data: TokenUsageData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const aiGeneration = Math.floor(Math.random() * 5000) + 2000;
      const imageGeneration = Math.floor(Math.random() * 1000) + 500;
      const textProcessing = Math.floor(Math.random() * 2000) + 1000;
      const totalTokens = aiGeneration + imageGeneration + textProcessing;
      
      data.push({
        date: date.toISOString().split('T')[0],
        totalTokens,
        aiGeneration,
        imageGeneration,
        textProcessing,
        cost: totalTokens * 0.002 // $0.002 per token estimate
      });
    }
    
    return data;
  };

  useEffect(() => {
    const fetchTokenUsage = async () => {
      setLoading(true);
      
      try {
        // In production, this would fetch from Supabase
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockData = generateMockData();
        setUsageData(mockData);
      } catch (error) {
        console.error('Failed to fetch token usage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenUsage();
  }, [dateRange]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate totals and breakdown
  const totalTokens = usageData.reduce((sum, day) => sum + day.totalTokens, 0);
  const totalCost = usageData.reduce((sum, day) => sum + day.cost, 0);
  const avgDailyTokens = usageData.length > 0 ? Math.round(totalTokens / usageData.length) : 0;
  const avgDailyCost = usageData.length > 0 ? totalCost / usageData.length : 0;

  // Calculate breakdown by category
  const breakdown: TokenBreakdown[] = [
    {
      category: 'AI Content Generation',
      tokens: usageData.reduce((sum, day) => sum + day.aiGeneration, 0),
      cost: usageData.reduce((sum, day) => sum + day.aiGeneration * 0.002, 0),
      percentage: 0,
      color: '#8B5CF6',
      icon: Brain
    },
    {
      category: 'Image Generation',
      tokens: usageData.reduce((sum, day) => sum + day.imageGeneration, 0),
      cost: usageData.reduce((sum, day) => sum + day.imageGeneration * 0.002, 0),
      percentage: 0,
      color: '#06B6D4',
      icon: ImageIcon
    },
    {
      category: 'Text Processing',
      tokens: usageData.reduce((sum, day) => sum + day.textProcessing, 0),
      cost: usageData.reduce((sum, day) => sum + day.textProcessing * 0.002, 0),
      percentage: 0,
      color: '#10B981',
      icon: FileText
    }
  ];

  // Calculate percentages
  breakdown.forEach(item => {
    item.percentage = totalTokens > 0 ? (item.tokens / totalTokens) * 100 : 0;
  });

  // Calculate trend
  const recentUsage = usageData.slice(-7).reduce((sum, day) => sum + day.totalTokens, 0);
  const previousUsage = usageData.slice(-14, -7).reduce((sum, day) => sum + day.totalTokens, 0);
  const trend = previousUsage > 0 ? ((recentUsage - previousUsage) / previousUsage) * 100 : 0;

  const chartData = usageData.map(item => ({
    ...item,
    date: formatDate(item.date)
  }));

  const pieData = breakdown.map(item => ({
    name: item.category,
    value: item.tokens,
    color: item.color,
    cost: item.cost
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
              <span className="text-white/70 capitalize">{entry.dataKey.replace(/([A-Z])/g, ' $1')}:</span>
              <span className="text-white font-medium">
                {viewMode === 'usage' ? formatNumber(entry.value) : formatCurrency(entry.value)}
              </span>
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
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: data.payload.color }}
              />
              <span className="text-white font-medium">{data.name}</span>
            </div>
            <div className="text-white/70">
              Tokens: {formatNumber(data.value)}
            </div>
            <div className="text-white/70">
              Cost: {formatCurrency(data.payload.cost)}
            </div>
            <div className="text-white/70">
              {((data.value / totalTokens) * 100).toFixed(1)}% of total
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-dark-card border border-dark-border rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Token Usage Analytics</h3>
          <p className="text-white/60 text-sm">
            Track your AI token consumption and costs
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('usage')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'usage'
                ? 'bg-primary text-white'
                : 'bg-dark-lighter text-white/70 hover:text-white'
            }`}
          >
            Usage
          </button>
          <button
            onClick={() => setViewMode('cost')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'cost'
                ? 'bg-primary text-white'
                : 'bg-dark-lighter text-white/70 hover:text-white'
            }`}
          >
            Cost
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Coins className="h-8 w-8 animate-pulse text-primary mx-auto mb-2" />
            <p className="text-white/60 text-sm">Loading token usage...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-dark-lighter rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-primary" />
                <span className="text-sm text-white/70">Total Tokens</span>
              </div>
              <div className="text-xl font-bold">{formatNumber(totalTokens)}</div>
              <div className="flex items-center gap-1 text-xs">
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span className={trend > 0 ? 'text-green-400' : 'text-red-400'}>
                  {Math.abs(trend).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="bg-dark-lighter rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-secondary" />
                <span className="text-sm text-white/70">Total Cost</span>
              </div>
              <div className="text-xl font-bold">{formatCurrency(totalCost)}</div>
              <div className="text-xs text-white/50">
                This period
              </div>
            </div>
            
            <div className="bg-dark-lighter rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-accent" />
                <span className="text-sm text-white/70">Daily Average</span>
              </div>
              <div className="text-xl font-bold">{formatNumber(avgDailyTokens)}</div>
              <div className="text-xs text-white/50">
                {formatCurrency(avgDailyCost)}/day
              </div>
            </div>
            
            <div className="bg-dark-lighter rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-white/70">Efficiency</span>
              </div>
              <div className="text-xl font-bold">
                ${(totalCost / (totalTokens || 1) * 1000).toFixed(3)}
              </div>
              <div className="text-xs text-white/50">
                per 1K tokens
              </div>
            </div>
          </div>

          {/* Usage Chart */}
          <div className="mb-6">
            <h4 className="font-medium mb-4">
              {viewMode === 'usage' ? 'Token Usage Over Time' : 'Cost Over Time'}
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
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
                    tickFormatter={viewMode === 'usage' ? formatNumber : (value) => `$${value.toFixed(2)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={viewMode === 'usage' ? 'totalTokens' : 'cost'}
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Usage Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div>
              <h4 className="font-medium mb-4">Usage by Category</h4>
              <div className="space-y-3">
                {breakdown.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.category}
                      className="flex items-center justify-between p-3 bg-dark-lighter rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${item.color}20` }}
                        >
                          <Icon 
                            className="h-4 w-4" 
                            style={{ color: item.color }}
                          />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{item.category}</div>
                          <div className="text-xs text-white/60">
                            {item.percentage.toFixed(1)}% of total
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatNumber(item.tokens)}</div>
                        <div className="text-xs text-white/60">{formatCurrency(item.cost)}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Pie Chart */}
            <div>
              <h4 className="font-medium mb-4">Distribution</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name.split(' ')[0]} ${(percent || 0).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Cost Alert */}
          {totalCost > 50 && (
            <div className="mt-6 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-medium text-yellow-400 mb-1">High Usage Alert</h5>
                  <p className="text-white/80 text-sm">
                    Your token usage this period ({formatCurrency(totalCost)}) is higher than average. 
                    Consider optimizing your AI prompts or reviewing your automation settings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TokenUsageAnalytics;