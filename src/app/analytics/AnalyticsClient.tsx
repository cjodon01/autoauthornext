'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';
import AuthenticatedNavbar from '../../components/layout/AuthenticatedNavbar';
import ComponentLoader from '../../components/ui/ComponentLoader';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';

// Dynamic imports for heavy analytics components
const PerformanceMetrics = lazy(() => import('../../components/analytics/PerformanceMetrics'));
const EngagementCharts = lazy(() => import('../../components/analytics/EngagementCharts'));
const PlatformBreakdown = lazy(() => import('../../components/analytics/PlatformBreakdown'));
const RecentPosts = lazy(() => import('../../components/analytics/RecentPosts'));
const ROICalculator = lazy(() => import('../../components/analytics/ROICalculator'));
const PostStatusMonitor = lazy(() => import('../../components/analytics/PostStatusMonitor'));
const TokenUsageAnalytics = lazy(() => import('../../components/analytics/TokenUsageAnalytics'));
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Heart,
  MessageCircle,
  Share,
  Calendar,
  DollarSign,
  Download,
  Filter,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const AnalyticsClient: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const supabase = createClient();
  
  // Date range state
  const [dateRange, setDateRange] = useState('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Analytics data
  const { 
    analyticsData, 
    loading: analyticsLoading, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useAnalyticsData(dateRange, customStartDate, customEndDate);
  
  const handleLogout = async () => {
    await signOut();
  };

  const handleExportData = async () => {
    try {
      toast.info('Preparing analytics export...');
      
      // In production, this would generate and download a CSV/PDF report
      const exportData = {
        dateRange,
        metrics: analyticsData?.metrics || {},
        posts: analyticsData?.posts || [],
        platforms: analyticsData?.platforms || {},
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autoauthor-analytics-${dateRange}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Analytics data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics data');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/70">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom range' }
  ];

  const quickStats = [
    {
      title: 'Total Posts',
      value: analyticsData?.metrics?.totalPosts || '24',
      change: analyticsData?.metrics?.postsChange || '+12%',
      icon: BarChart3,
      color: 'text-primary',
      trend: 'up'
    },
    {
      title: 'Total Engagement',
      value: analyticsData?.metrics?.totalEngagement || '2.4K',
      change: analyticsData?.metrics?.engagementChange || '+18%',
      icon: Heart,
      color: 'text-secondary',
      trend: 'up'
    },
    {
      title: 'Avg. Engagement Rate',
      value: analyticsData?.metrics?.avgEngagementRate || '8.2%',
      change: analyticsData?.metrics?.engagementRateChange || '+1.4%',
      icon: TrendingUp,
      color: 'text-accent',
      trend: 'up'
    },
    {
      title: 'New Followers',
      value: analyticsData?.metrics?.newFollowers || '143',
      change: analyticsData?.metrics?.followersChange || '+23',
      icon: Users,
      color: 'text-primary',
      trend: 'up'
    }
  ];

  return (
    <div className="min-h-screen bg-dark">
      <AuthenticatedNavbar
        onLogout={handleLogout}
        onTokenClick={() => {}}
        userEmail={user?.email}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">
              Analytics Dashboard 📊
            </h1>
            <p className="text-white/70">
              Track your content performance and engagement metrics
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-white/60" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Export Button */}
            <button
              onClick={handleExportData}
              className="btn btn-secondary inline-flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        {dateRange === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-dark-card border border-dark-border rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-dark-lighter border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-dark-lighter border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="self-end">
                <button
                  onClick={refetchAnalytics}
                  className="btn btn-primary"
                  disabled={!customStartDate || !customEndDate}
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary/30 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-${stat.color.split('-')[1]}/20`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-white/60 text-sm">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Metrics */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Suspense fallback={<ComponentLoader height="h-96" text="Loading performance metrics..." />}>
              <PerformanceMetrics 
                data={analyticsData?.performanceData}
                loading={analyticsLoading}
                dateRange={dateRange}
              />
            </Suspense>
          </motion.div>

          {/* Platform Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Suspense fallback={<ComponentLoader height="h-96" text="Loading platform breakdown..." />}>
              <PlatformBreakdown 
                data={analyticsData?.platformData}
                loading={analyticsLoading}
              />
            </Suspense>
          </motion.div>
        </div>

        {/* Engagement Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Suspense fallback={<ComponentLoader height="h-80" text="Loading engagement charts..." />}>
              <EngagementCharts 
                data={analyticsData?.engagementData}
                loading={analyticsLoading}
                dateRange={dateRange}
              />
            </Suspense>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Suspense fallback={<ComponentLoader height="h-80" text="Loading ROI calculator..." />}>
              <ROICalculator 
                data={analyticsData?.roiData}
                loading={analyticsLoading}
              />
            </Suspense>
          </motion.div>
        </div>

        {/* Post Status Monitor & Recent Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Suspense fallback={<ComponentLoader height="h-96" text="Loading post status monitor..." />}>
              <PostStatusMonitor 
                className="h-full"
                autoRefresh={true}
                refreshInterval={10000}
              />
            </Suspense>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Suspense fallback={<ComponentLoader height="h-80" text="Loading recent posts..." />}>
              <RecentPosts 
                posts={analyticsData?.recentPosts}
                loading={analyticsLoading}
                onRefresh={refetchAnalytics}
              />
            </Suspense>
          </motion.div>
        </div>

        {/* Token Usage Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Suspense fallback={<ComponentLoader height="h-96" text="Loading token usage analytics..." />}>
            <TokenUsageAnalytics 
              dateRange={dateRange}
            />
          </Suspense>
        </motion.div>
      </main>
    </div>
  );
};

export default AnalyticsClient;