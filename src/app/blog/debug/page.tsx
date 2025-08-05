'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase/client';

export default function BlogDebugPage() {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        
        // First, let's get all blog posts to see what's in the database
        const { data: allPosts, error: allError } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (allError) {
          console.error('Error fetching all blog posts:', allError);
          setError('Failed to load all blog posts');
          return;
        }

        console.log('All blog posts:', allPosts);

        // Now get posts for the specific user
        const { data: userPosts, error: userError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('user_id', '87e05ae7-8f83-4c89-afcc-450fc1572e2c')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (userError) {
          console.error('Error fetching user blog posts:', userError);
          setError('Failed to load user blog posts');
          return;
        }

        console.log('User blog posts:', userPosts);
        setBlogPosts(userPosts || []);
      } catch (err) {
        console.error('Error in fetchBlogPosts:', err);
        setError('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/70">Loading blog debug info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Blog Debug Information</h1>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Blog Posts for User 87e05ae7-8f83-4c89-afcc-450fc1572e2c</h2>
          
          {blogPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60 mb-4">No blog posts found for this user.</p>
              <p className="text-white/40 text-sm">This could mean:</p>
              <ul className="text-white/40 text-sm mt-2 space-y-1">
                <li>• No posts exist for this user ID</li>
                <li>• All posts are in 'draft' status</li>
                <li>• The user ID is incorrect</li>
                <li>• The blog_posts table is empty</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              {blogPosts.map((post) => (
                <div key={post.id} className="bg-dark-lighter border border-dark-border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Slug:</span>
                      <p className="text-white">{post.slug}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Status:</span>
                      <p className="text-white">{post.status}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Created:</span>
                      <p className="text-white">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-white/60">User ID:</span>
                      <p className="text-white font-mono text-xs">{post.user_id}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <a 
                      href={`/blog/${post.slug}`}
                      className="text-primary hover:text-primary-light text-sm"
                    >
                      View Post →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 