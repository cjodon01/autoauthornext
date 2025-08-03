'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/provider';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export interface AnalyticsMetrics {
  totalPosts: string;
  postsChange: string;
  totalEngagement: string;
  engagementChange: string;
  avgEngagementRate: string;
  engagementRateChange: string;
  newFollowers: string;
  followersChange: string;
}

export interface PostPerformance {
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

export interface PlatformData {
  platform: string;
  posts: number;
  engagement: number;
  followers: number;
  engagementRate: number;
  color: string;
}

export interface EngagementData {
  date: string;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  impressions: number;
}

export interface ROIData {
  totalSpent: number;
  totalRevenue: number;
  roi: number;
  costPerEngagement: number;
  conversionRate: number;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  performanceData: EngagementData[];
  platformData: PlatformData[];
  engagementData: EngagementData[];
  roiData: ROIData;
  recentPosts: PostPerformance[];
  posts: PostPerformance[];
  platforms: { [key: string]: any };
}

export const useAnalyticsData = (
  dateRange: string,
  customStartDate?: string,
  customEndDate?: string
) => {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateMockData = useCallback((): AnalyticsData => {
    // Generate realistic mock data for analytics
    const now = new Date();
    const daysToGenerate = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    
    // Generate performance data over time
    const performanceData: EngagementData[] = [];
    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      performanceData.push({
        date: date.toISOString().split('T')[0],
        likes: Math.floor(Math.random() * 200) + 50,
        comments: Math.floor(Math.random() * 50) + 10,
        shares: Math.floor(Math.random() * 30) + 5,
        clicks: Math.floor(Math.random() * 100) + 20,
        impressions: Math.floor(Math.random() * 2000) + 500
      });
    }

    // Platform breakdown data
    const platformData: PlatformData[] = [
      {
        platform: 'Twitter',
        posts: 12,
        engagement: 2400,
        followers: 1200,
        engagementRate: 8.5,
        color: '#1DA1F2'
      },
      {
        platform: 'Facebook',
        posts: 8,
        engagement: 1800,
        followers: 850,
        engagementRate: 6.2,
        color: '#1877F2'
      },
      {
        platform: 'LinkedIn',
        posts: 6,
        engagement: 1200,
        followers: 600,
        engagementRate: 9.1,
        color: '#0A66C2'
      },
      {
        platform: 'Instagram',
        posts: 4,
        engagement: 800,
        followers: 400,
        engagementRate: 7.8,
        color: '#E4405F'
      }
    ];

    // Recent posts performance
    const recentPosts: PostPerformance[] = [
      {
        id: '1',
        content: 'Just launched our new AI-powered content automation platform! 🚀 What do you think about the future of automated social media?',
        platform: 'Twitter',
        publishedAt: '2025-01-20T14:30:00Z',
        likes: 145,
        comments: 23,
        shares: 12,
        clicks: 67,
        impressions: 2100,
        engagementRate: 8.6
      },
      {
        id: '2',
        content: 'The importance of authentic brand voice in automated content cannot be overstated. Here are 5 tips for maintaining your unique voice...',
        platform: 'LinkedIn',
        publishedAt: '2025-01-19T10:15:00Z',
        likes: 89,
        comments: 15,
        shares: 8,
        clicks: 45,
        impressions: 1200,
        engagementRate: 9.3
      },
      {
        id: '3',
        content: 'Behind the scenes of our content creation process ✨ From idea to published post in minutes, not hours.',
        platform: 'Instagram',
        publishedAt: '2025-01-18T16:45:00Z',
        likes: 234,
        comments: 31,
        shares: 19,
        clicks: 78,
        impressions: 3200,
        engagementRate: 8.9
      }
    ];

    return {
      metrics: {
        totalPosts: '24',
        postsChange: '+12%',
        totalEngagement: '2.4K',
        engagementChange: '+18%',
        avgEngagementRate: '8.2%',
        engagementRateChange: '+1.4%',
        newFollowers: '143',
        followersChange: '+23'
      },
      performanceData,
      platformData,
      engagementData: performanceData,
      roiData: {
        totalSpent: 450,
        totalRevenue: 1200,
        roi: 166.7,
        costPerEngagement: 0.18,
        conversionRate: 3.2
      },
      recentPosts,
      posts: recentPosts,
      platforms: {
        twitter: { engagement: 2400, followers: 1200 },
        facebook: { engagement: 1800, followers: 850 },
        linkedin: { engagement: 1200, followers: 600 },
        instagram: { engagement: 800, followers: 400 }
      }
    };
  }, [dateRange]);

  const fetchAnalyticsData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // In production, this would fetch real analytics data from the database
      // For now, we'll use mock data with a realistic API delay
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to fetch real data first, fall back to mock data
      const { data: posts, error: postsError } = await supabase
        .from('posts_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) {
        console.warn('Could not fetch posts data, using mock data:', postsError);
      }

      // Generate mock data (in production, this would be real data processing)
      const mockData = generateMockData();
      
      // If we have real posts, we could enhance the mock data with real information
      if (posts && posts.length > 0) {
        // Process real posts data and merge with mock analytics
        // This is where you'd calculate real engagement metrics
      }

      setAnalyticsData(mockData);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data');
      
      // Still provide mock data even if there's an error
      const mockData = generateMockData();
      setAnalyticsData(mockData);
      
      toast.error('Using demo analytics data');
    } finally {
      setLoading(false);
    }
  }, [user, dateRange, customStartDate, customEndDate, generateMockData, supabase]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const refetch = useCallback(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return {
    analyticsData,
    loading,
    error,
    refetch
  };
};