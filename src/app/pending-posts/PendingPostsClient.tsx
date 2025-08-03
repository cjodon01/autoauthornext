'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/provider';
import { createClient } from '@/lib/supabase/client';
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';
import ScheduledPostCard from '@/components/pending-posts/ScheduledPostCard';
import PostEditModal from '@/components/pending-posts/PostEditModal';
import BulkActionsBar from '@/components/pending-posts/BulkActionsBar';
import CalendarView from '@/components/pending-posts/CalendarView';
import { 
  Calendar,
  List,
  Filter,
  Search,
  Plus,
  RefreshCw,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface ScheduledPost {
  id: string;
  content: string;
  platform: string;
  scheduledAt: string;
  status: 'scheduled' | 'processing' | 'published' | 'failed' | 'paused';
  brandId: string;
  brandName: string;
  mediaUrls?: string[];
  campaignId?: string;
  campaignName?: string;
  error?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

interface FilterOptions {
  status: string;
  platform: string;
  dateRange: string;
  search: string;
}

const PendingPostsClient: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const supabase = createClient();
  
  // State
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    platform: 'all',
    dateRange: 'all',
    search: ''
  });

  // Generate mock data for demonstration
  const generateMockPosts = (): ScheduledPost[] => {
    const platforms = ['twitter', 'facebook', 'linkedin', 'instagram'];
    const statuses: ScheduledPost['status'][] = ['scheduled', 'processing', 'published', 'failed', 'paused'];
    const brands = [
      { id: '1', name: 'TechCorp' },
      { id: '2', name: 'StartupX' },
      { id: '3', name: 'BrandY' }
    ];
    
    const mockPosts: ScheduledPost[] = [];
    
    for (let i = 0; i < 25; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Generate various scheduled times (past, present, future)
      const baseTime = new Date();
      const randomHours = Math.floor(Math.random() * 168) - 84; // ±3.5 days
      const scheduledAt = new Date(baseTime.getTime() + randomHours * 60 * 60 * 1000);
      
      mockPosts.push({
        id: `post-${i + 1}`,
        content: `Sample post content ${i + 1}. This is a ${platform} post about ${brand.name}'s latest updates and announcements. #${brand.name.toLowerCase()} #socialmedia`,
        platform,
        scheduledAt: scheduledAt.toISOString(),
        status,
        brandId: brand.id,
        brandName: brand.name,
        mediaUrls: Math.random() > 0.7 ? [`https://via.placeholder.com/400x300?text=Media+${i + 1}`] : undefined,
        campaignId: Math.random() > 0.5 ? `campaign-${Math.floor(Math.random() * 5) + 1}` : undefined,
        campaignName: Math.random() > 0.5 ? `Campaign ${Math.floor(Math.random() * 5) + 1}` : undefined,
        error: status === 'failed' ? 'Authentication token expired' : undefined,
        retryCount: status === 'failed' ? Math.floor(Math.random() * 3) : 0,
        createdAt: new Date(baseTime.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    return mockPosts.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  };

  const fetchPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // In production, this would fetch from Supabase
      // For now, simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockPosts = generateMockPosts();
      setPosts(mockPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
  };

  const handlePostSelect = (postId: string, selected: boolean) => {
    setSelectedPosts(prev => 
      selected 
        ? [...prev, postId]
        : prev.filter(id => id !== postId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedPosts(selected ? filteredPosts.map(post => post.id) : []);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPosts.length === 0) {
      toast.error('No posts selected');
      return;
    }

    try {
      // In production, this would make API calls to perform bulk actions
      switch (action) {
        case 'delete':
          setPosts(prev => prev.filter(post => !selectedPosts.includes(post.id)));
          toast.success(`Deleted ${selectedPosts.length} posts`);
          break;
        case 'pause':
          setPosts(prev => prev.map(post => 
            selectedPosts.includes(post.id) 
              ? { ...post, status: 'paused' as const } 
              : post
          ));
          toast.success(`Paused ${selectedPosts.length} posts`);
          break;
        case 'resume':
          setPosts(prev => prev.map(post => 
            selectedPosts.includes(post.id) 
              ? { ...post, status: 'scheduled' as const } 
              : post
          ));
          toast.success(`Resumed ${selectedPosts.length} posts`);
          break;
        case 'retry':
          setPosts(prev => prev.map(post => 
            selectedPosts.includes(post.id) && post.status === 'failed'
              ? { ...post, status: 'scheduled' as const, error: undefined, retryCount: post.retryCount + 1 } 
              : post
          ));
          toast.success(`Retrying ${selectedPosts.length} posts`);
          break;
      }
      setSelectedPosts([]);
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const handlePostEdit = (post: ScheduledPost) => {
    setEditingPost(post);
  };

  const handlePostUpdate = (updatedPost: ScheduledPost) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
    setEditingPost(null);
    toast.success('Post updated successfully');
  };

  const handlePostDelete = async (postId: string) => {
    try {
      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete post');
    }
  };

  // Filter posts based on current filters
  const filteredPosts = posts.filter(post => {
    if (filters.status !== 'all' && post.status !== filters.status) return false;
    if (filters.platform !== 'all' && post.platform !== filters.platform) return false;
    if (filters.search && !post.content.toLowerCase().includes(filters.search.toLowerCase()) && 
        !post.brandName.toLowerCase().includes(filters.search.toLowerCase())) return false;
    
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const postDate = new Date(post.scheduledAt);
      const diffHours = (postDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      switch (filters.dateRange) {
        case 'today':
          if (diffHours < 0 || diffHours > 24) return false;
          break;
        case 'week':
          if (diffHours < 0 || diffHours > 168) return false;
          break;
        case 'overdue':
          if (diffHours >= 0) return false;
          break;
      }
    }
    
    return true;
  });

  // Status counts for filter badges
  const statusCounts = posts.reduce((acc, post) => {
    acc[post.status] = (acc[post.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/70">Loading scheduled posts...</p>
        </div>
      </div>
    );
  }

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
              Scheduled Posts 📅
            </h1>
            <p className="text-white/70">
              Manage your upcoming posts and publication schedule
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <button
              onClick={fetchPosts}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'bg-dark-lighter text-white/70 hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-primary text-white'
                    : 'bg-dark-lighter text-white/70 hover:text-white'
                }`}
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search posts or brands..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full bg-dark-lighter border border-dark-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="bg-dark-lighter border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status ({posts.length})</option>
              <option value="scheduled">Scheduled ({statusCounts.scheduled || 0})</option>
              <option value="processing">Processing ({statusCounts.processing || 0})</option>
              <option value="published">Published ({statusCounts.published || 0})</option>
              <option value="failed">Failed ({statusCounts.failed || 0})</option>
              <option value="paused">Paused ({statusCounts.paused || 0})</option>
            </select>
            
            {/* Platform Filter */}
            <select
              value={filters.platform}
              onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
              className="bg-dark-lighter border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Platforms</option>
              <option value="twitter">Twitter</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
            </select>
            
            {/* Date Range Filter */}
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="bg-dark-lighter border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Dates</option>
              <option value="overdue">Overdue</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <BulkActionsBar
                selectedCount={selectedPosts.length}
                onSelectAll={handleSelectAll}
                onDeselectAll={() => setSelectedPosts([])}
                onBulkAction={handleBulkAction}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Clock className="h-8 w-8 animate-pulse text-primary mx-auto mb-2" />
              <p className="text-white/60">Loading scheduled posts...</p>
            </div>
          </div>
        ) : viewMode === 'calendar' ? (
          <CalendarView
            posts={filteredPosts}
            onPostSelect={handlePostEdit}
            onPostUpdate={handlePostUpdate}
          />
        ) : (
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No scheduled posts found</h3>
                <p className="text-white/60 mb-6">
                  {filters.search || filters.status !== 'all' || filters.platform !== 'all' || filters.dateRange !== 'all'
                    ? 'Try adjusting your filters or search terms.'
                    : 'Create your first scheduled post to get started.'}
                </p>
                <button className="btn btn-primary inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Schedule New Post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ScheduledPostCard
                      post={post}
                      selected={selectedPosts.includes(post.id)}
                      onSelect={handlePostSelect}
                      onEdit={handlePostEdit}
                      onDelete={handlePostDelete}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <PostEditModal
        post={editingPost}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        onSave={handlePostUpdate}
      />
    </div>
  );
};

export default PendingPostsClient;