'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, ArrowRight, Search, Tag, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AuthenticatedNavbar from '../../components/layout/AuthenticatedNavbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  preview_text: string;
  slug: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  status: 'published' | 'draft';
  ai_provider: string | null;
  ai_model: string | null;
  embed_url: string | null;
  content_html: string;
  content_markdown: string | null;
}

export default function BlogClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, session, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await signOut();
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .eq('brand_id', '87e05ae7-8f83-4c89-afcc-450fc1572e2c')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
        setError('Failed to load blog posts');
        return;
      }

      setBlogPosts(data || []);
    } catch (err) {
      console.error('Error in fetchBlogPosts:', err);
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.preview_text && post.preview_text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const handlePostClick = (post: BlogPost) => {
    router.push(`/blog/${post.slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark">
        <AuthenticatedNavbar onLogout={handleLogout} userEmail={user?.email} />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto pt-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-white/70">Loading blog posts...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark">
        <AuthenticatedNavbar onLogout={handleLogout} userEmail={user?.email} />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto pt-20">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchBlogPosts}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <AuthenticatedNavbar onLogout={handleLogout} userEmail={user?.email} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 pt-20">
            <h1 className="text-4xl font-display font-bold mb-6">
              AutoAuthor <span className="text-gradient">Blog</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Expert insights on AI-powered content creation, social media automation, and digital marketing strategies.
            </p>
          </div>

          {/* Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-card border border-dark-border rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Blog Posts Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handlePostClick(post)}
                  className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                >
                  {/* Image */}
                  {post.image_url && (
                    <div className="aspect-video bg-dark-lighter">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-gradient transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    
                    {post.preview_text && (
                      <p className="text-white/70 mb-4 leading-relaxed line-clamp-3">
                        {post.preview_text}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{calculateReadTime(post.content_html)}</span>
                      </div>
                    </div>

                    {/* AI Badge */}
                    {post.ai_provider && (
                      <div className="flex items-center gap-2 mb-4">
                        <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-medium">
                          AI Generated
                        </span>
                        <span className="text-xs text-white/50">
                          {post.ai_provider} {post.ai_model && `• ${post.ai_model}`}
                        </span>
                      </div>
                    )}

                    {/* External Link */}
                    {post.embed_url && (
                      <div className="flex items-center gap-1 text-secondary text-sm mb-4">
                        <ExternalLink className="h-3 w-3" />
                        <span>External Content</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-primary group-hover:text-primary-light transition-colors">
                      <span className="text-sm font-medium">Read Article</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            /* No Results */
            <div className="text-center py-12">
              <div className="text-white/60 mb-4">
                <Search className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg">
                  {searchTerm ? 'No articles found matching your search.' : 'No blog posts available yet.'}
                </p>
                {searchTerm && (
                  <p className="text-sm">Try adjusting your search terms.</p>
                )}
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="btn btn-secondary mt-4"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Newsletter Signup */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-8 mt-16 text-center">
            <h2 className="text-2xl font-semibold mb-4">Stay Updated</h2>
            <p className="text-white/70 mb-6">
              Get the latest insights on AI-powered content creation delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-dark-lighter border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button className="btn btn-primary">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}