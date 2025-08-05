'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';
import AuthenticatedNavbar from '../../components/layout/AuthenticatedNavbar';
import ScheduledPostCard from '../../components/pending-posts/ScheduledPostCard';
import PostEditModal from '../../components/pending-posts/PostEditModal';
import BulkActionsBar from '../../components/pending-posts/BulkActionsBar';
import CalendarView from '../../components/pending-posts/CalendarView';
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

interface DatabasePost {
  id: string;
  post_content: string;
  post_date: string | null;
  approved: boolean;
  platform?: string;
  target_platforms?: string[];
  page_id?: string;
  social_connection_id?: string;
  target_page_ids?: string[];
  target_connection_ids?: string[];
  campaign_id?: string;
  created_at: string;
  updated_at?: string;
  metadata?: any; // For storing meme editing data
  // Enriched data from joins
  campaigns?: {
    id: string;
    campaign_name: string;
    user_id: string;
  } | null;
  relatedPages?: any[];
  relatedConnections?: any[];
  platforms?: string[];
  isCompleted?: boolean;
}

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
  // Enhanced fields for meme editing
  selectedImage?: string | null;
  textOverlays?: any[];
  imagePosition?: any;
  capturedImage?: string | null;
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
  const [posts, setPosts] = useState<DatabasePost[]>([]);
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

  // Campaigns for filter dropdown
  const [campaigns, setCampaigns] = useState<any[]>([]);
  
  // Convert database post to UI post format
  const convertToScheduledPost = (dbPost: DatabasePost): ScheduledPost => {
    // Extract meme editing data from metadata
    const metadata = dbPost.metadata || {};
    
    return {
      id: dbPost.id,
      content: dbPost.post_content,
      platform: dbPost.platforms?.[0] || 'unknown',
      scheduledAt: dbPost.post_date || '',
      status: dbPost.isCompleted ? 'published' : (dbPost.approved ? 'scheduled' : 'failed'),
      brandId: dbPost.campaign_id || '',
      brandName: dbPost.campaigns?.campaign_name || 'No Campaign',
      mediaUrls: metadata.mediaUrls || [],
      campaignId: dbPost.campaign_id,
      campaignName: dbPost.campaigns?.campaign_name,
      retryCount: 0,
      createdAt: dbPost.created_at,
      updatedAt: dbPost.updated_at || dbPost.created_at,
      // Enhanced fields for meme editing
      selectedImage: metadata.selectedImage || null,
      textOverlays: metadata.textOverlays || [],
      imagePosition: metadata.imagePosition || { x: 0, y: 0, scale: 1 },
      capturedImage: metadata.capturedImage || null
    };
  };
  
  // Fetch campaigns for filter dropdown
  const fetchCampaigns = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, campaign_name')
        .eq('user_id', user.id)
        .order('campaign_name', { ascending: true });
        
      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Build query with joins similar to original app
      let query = supabase
        .from('posts_log')
        .select(`
          *,
          campaigns (
            id,
            campaign_name,
            user_id
          )
        `);
      
      // Apply status filter
      if (filters.status === 'scheduled') {
        const now = new Date().toISOString();
        query = query.eq('approved', true).gt('post_date', now);
      } else if (filters.status === 'published') {
        const now = new Date().toISOString();
        query = query.eq('approved', true).lte('post_date', now);
      } else if (filters.status === 'failed') {
        query = query.eq('approved', false);
      }
      
      // Apply platform filter
      if (filters.platform !== 'all') {
        query = query.or(`platform.eq.${filters.platform},target_platforms.cs.{${filters.platform}}`);
      }
      
      // Apply search filter
      if (filters.search) {
        query = query.ilike('post_content', `%${filters.search}%`);
      }
      
      // Execute query
      const { data: postsData, error } = await query.order('post_date', { ascending: true });
      
      if (error) throw error;
      
      // Filter posts to only show those belonging to the current user
      const userPosts = postsData?.filter(post => post.campaigns?.user_id === user.id) || [];
      
      // Collect page and connection IDs for enrichment
      const pageIds = userPosts
        .flatMap(post => post.page_id ? [post.page_id] : [])
        .concat(userPosts.flatMap(post => post.target_page_ids || []));
        
      const connectionIds = userPosts
        .flatMap(post => post.social_connection_id ? [post.social_connection_id] : [])
        .concat(userPosts.flatMap(post => post.target_connection_ids || []));
      
      // Fetch related social pages
      let pagesData: any[] = [];
      if (pageIds.length > 0) {
        const { data: pages, error: pagesError } = await supabase
          .from('social_pages')
          .select('*')
          .in('id', [...new Set(pageIds)]);
          
        if (!pagesError) {
          pagesData = pages || [];
        }
      }
      
      // Fetch related social connections
      let connectionsData: any[] = [];
      if (connectionIds.length > 0) {
        const { data: connections, error: connectionsError } = await supabase
          .from('social_connections')
          .select('*')
          .in('id', [...new Set(connectionIds)]);
          
        if (!connectionsError) {
          connectionsData = connections || [];
        }
      }
      
      // Enrich posts with related data
      const enrichedPosts = userPosts.map(post => {
        // Find related pages
        const relatedPages = pagesData.filter(page => 
          page.id === post.page_id || (post.target_page_ids && post.target_page_ids.includes(page.id))
        );
        
        // Find related connections
        const relatedConnections = connectionsData.filter(conn => 
          conn.id === post.social_connection_id || (post.target_connection_ids && post.target_connection_ids.includes(conn.id))
        );
        
        // Determine platforms
        const platforms = new Set<string>();
        
        if (post.platform) {
          platforms.add(post.platform.toLowerCase());
        }
        
        if (post.target_platforms && Array.isArray(post.target_platforms)) {
          post.target_platforms.forEach((p: string) => platforms.add(p.toLowerCase()));
        }
        
        relatedPages.forEach(page => {
          if (page.provider) {
            platforms.add(page.provider.toLowerCase());
          }
        });
        
        relatedConnections.forEach(conn => {
          if (conn.provider) {
            platforms.add(conn.provider.toLowerCase());
          }
        });
        
        // Determine if post is completed (approved and past date)
        const isCompleted = post.approved && post.post_date && new Date(post.post_date) <= new Date();
        
        return {
          ...post,
          relatedPages,
          relatedConnections,
          platforms: Array.from(platforms),
          isCompleted
        };
      });
      
      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchCampaigns();
    }
  }, [user]);
  
  // Refetch when filters change
  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [filters, user]);

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
      switch (action) {
        case 'delete':
          const { error: deleteError } = await supabase
            .from('posts_log')
            .delete()
            .in('id', selectedPosts);
            
          if (deleteError) throw deleteError;
          
          setPosts(prev => prev.filter(post => !selectedPosts.includes(post.id)));
          toast.success(`Deleted ${selectedPosts.length} posts`);
          break;
          
        case 'approve':
          const { error: approveError } = await supabase
            .from('posts_log')
            .update({ approved: true })
            .in('id', selectedPosts);
            
          if (approveError) throw approveError;
          
          toast.success(`Approved ${selectedPosts.length} posts`);
          fetchPosts(); // Refresh to show updated status
          break;
          
        case 'unapprove':
          const { error: unapproveError } = await supabase
            .from('posts_log')
            .update({ approved: false })
            .in('id', selectedPosts);
            
          if (unapproveError) throw unapproveError;
          
          toast.success(`Unapproved ${selectedPosts.length} posts`);
          fetchPosts(); // Refresh to show updated status
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

  const handlePostUpdate = async (updatedPost: ScheduledPost) => {
    try {
      const { error } = await supabase
        .from('posts_log')
        .update({
          post_content: updatedPost.content,
          post_date: updatedPost.scheduledAt,
          approved: updatedPost.status === 'scheduled' || updatedPost.status === 'published',
          // Save meme editing data as metadata
          metadata: {
            selectedImage: updatedPost.selectedImage,
            textOverlays: updatedPost.textOverlays,
            imagePosition: updatedPost.imagePosition,
            capturedImage: updatedPost.capturedImage,
            mediaUrls: updatedPost.mediaUrls
          }
        })
        .eq('id', updatedPost.id);
        
      if (error) throw error;
      
      // Refresh posts to show updated data
      await fetchPosts();
      setEditingPost(null);
      toast.success('Post updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update post');
    }
  };

  const handlePostDelete = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts_log')
        .delete()
        .eq('id', postId);
        
      if (error) throw error;
      
      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete post');
    }
  };

  // Filter posts based on current filters
  const filteredPosts = posts.filter(post => {
    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'scheduled' && (!post.approved || !post.post_date || post.isCompleted)) return false;
      if (filters.status === 'published' && !post.isCompleted) return false;
      if (filters.status === 'failed' && post.approved) return false;
    }
    
    // Platform filter
    if (filters.platform !== 'all') {
      const postPlatforms = post.platforms || [];
      if (!postPlatforms.includes(filters.platform)) return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const contentMatch = post.post_content?.toLowerCase().includes(searchLower);
      const campaignMatch = post.campaigns?.campaign_name?.toLowerCase().includes(searchLower);
      if (!contentMatch && !campaignMatch) return false;
    }
    
    // Date range filter
    if (filters.dateRange !== 'all' && post.post_date) {
      const now = new Date();
      const postDate = new Date(post.post_date);
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
    if (post.isCompleted) {
      acc['published'] = (acc['published'] || 0) + 1;
    } else if (post.approved && post.post_date) {
      acc['scheduled'] = (acc['scheduled'] || 0) + 1;
    } else {
      acc['failed'] = (acc['failed'] || 0) + 1;
    }
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
              <option value="published">Published ({statusCounts.published || 0})</option>
              <option value="failed">Pending Approval ({statusCounts.failed || 0})</option>
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
            posts={filteredPosts.map(convertToScheduledPost)}
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
                      post={convertToScheduledPost(post)}
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