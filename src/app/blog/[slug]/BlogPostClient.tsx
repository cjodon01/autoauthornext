'use client';

import React, { useState } from 'react';
import { Calendar, Clock, ArrowLeft, ExternalLink, Share2, Copy, Check, Twitter, Facebook, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AuthenticatedNavbar from '../../../components/layout/AuthenticatedNavbar';
import Footer from '../../../components/layout/Footer';
import { useAuth } from '../../../lib/auth/provider';

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

interface BlogPostClientProps {
  post: BlogPost;
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, session, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
  };

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

  const handleShare = async (platform?: string) => {
    const url = `https://autoauthor.ai/blog/${post.slug}`;
    const title = post.title;
    const text = post.preview_text || title;

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
    
    setShareDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-dark">
      <AuthenticatedNavbar onLogout={handleLogout} userEmail={user?.email} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 pt-20"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Blog</span>
          </motion.button>

          {/* Article Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {post.preview_text && (
              <p className="text-xl text-white/80 mb-6 leading-relaxed">
                {post.preview_text}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-white/60 text-sm mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{calculateReadTime(post.content_html)}</span>
              </div>
              
              {/* Share Button */}
              <div className="relative ml-auto">
                <button
                  onClick={() => setShareDropdownOpen(!shareDropdownOpen)}
                  className="flex items-center gap-2 bg-dark-card border border-dark-border px-4 py-2 rounded-lg hover:border-primary/50 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>

                {shareDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-dark-card border border-dark-border rounded-lg shadow-lg z-10 min-w-[180px]">
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-dark-lighter transition-colors"
                    >
                      <Twitter className="h-4 w-4 text-blue-400" />
                      <span>Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-dark-lighter transition-colors"
                    >
                      <Facebook className="h-4 w-4 text-blue-600" />
                      <span>Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-dark-lighter transition-colors"
                    >
                      <Linkedin className="h-4 w-4 text-blue-500" />
                      <span>LinkedIn</span>
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-dark-lighter transition-colors border-t border-dark-border"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* AI Badge */}
            {post.ai_provider && (
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  AI Generated Content
                </span>
                <span className="text-sm text-white/60">
                  Created with {post.ai_provider} {post.ai_model && `• ${post.ai_model}`}
                </span>
              </div>
            )}

            {/* External Link */}
            {post.embed_url && (
              <div className="bg-dark-card border border-dark-border rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-secondary mb-2">
                  <ExternalLink className="h-4 w-4" />
                  <span className="font-medium">External Resource</span>
                </div>
                <a
                  href={post.embed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors break-all"
                >
                  {post.embed_url}
                </a>
              </div>
            )}
          </motion.header>

          {/* Featured Image */}
          {post.image_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <div className="aspect-video bg-dark-lighter rounded-xl overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Article Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose prose-invert prose-lg max-w-none"
          >
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.content_html }}
            />
          </motion.article>

          {/* Article Footer */}
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 pt-8 border-t border-dark-border"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">
                <p>Published on {formatDate(post.created_at)}</p>
                {post.updated_at !== post.created_at && (
                  <p>Last updated on {formatDate(post.updated_at)}</p>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShareDropdownOpen(!shareDropdownOpen)}
                  className="flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share Article</span>
                </button>
              </div>
            </div>
          </motion.footer>

          {/* Newsletter Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-dark-card border border-dark-border rounded-xl p-8 mt-16 text-center"
          >
            <h2 className="text-2xl font-semibold mb-4">Enjoyed this article?</h2>
            <p className="text-white/70 mb-6">
              Subscribe to get more insights on AI-powered content creation delivered to your inbox.
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
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Click outside to close share dropdown */}
      {shareDropdownOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShareDropdownOpen(false)}
        />
      )}

      <style jsx global>{`
        .blog-content {
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.7;
        }
        
        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4,
        .blog-content h5,
        .blog-content h6 {
          color: white;
          font-weight: 600;
          margin: 2rem 0 1rem 0;
        }
        
        .blog-content h1 { font-size: 2rem; }
        .blog-content h2 { font-size: 1.75rem; }
        .blog-content h3 { font-size: 1.5rem; }
        .blog-content h4 { font-size: 1.25rem; }
        
        .blog-content p {
          margin: 1.5rem 0;
        }
        
        .blog-content a {
          color: #3B82F6;
          text-decoration: underline;
        }
        
        .blog-content a:hover {
          color: #60A5FA;
        }
        
        .blog-content ul,
        .blog-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }
        
        .blog-content li {
          margin: 0.5rem 0;
        }
        
        .blog-content blockquote {
          border-left: 4px solid #3B82F6;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .blog-content code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: 'Fira Code', monospace;
          font-size: 0.9em;
        }
        
        .blog-content pre {
          background: rgba(0, 0, 0, 0.5);
          padding: 1.5rem;
          border-radius: 0.5rem;
          margin: 2rem 0;
          overflow-x: auto;
        }
        
        .blog-content pre code {
          background: none;
          padding: 0;
        }
        
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 2rem 0;
        }
        
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
        }
        
        .blog-content th,
        .blog-content td {
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.75rem;
          text-align: left;
        }
        
        .blog-content th {
          background: rgba(255, 255, 255, 0.1);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}