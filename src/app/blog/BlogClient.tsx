'use client';

import React, { useState } from 'react';
import { Calendar, Clock, User, ArrowRight, Search, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import LoginModal from '../../components/auth/LoginModal';
import { useAuth } from '../../lib/auth/provider';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: string;
  tags: string[];
  featured: boolean;
}

export default function BlogClient() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const { session } = useAuth();

  const openModal = () => {
    setShowLoginModal(true);
  };

  const closeModal = () => {
    setShowLoginModal(false);
  };

  // Sample blog posts for SEO and demonstration
  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'The Future of AI-Powered Content Creation',
      excerpt: 'Explore how artificial intelligence is revolutionizing the way we create, distribute, and optimize content across digital platforms.',
      content: 'Full article content here...',
      author: 'AutoAuthor Team',
      publishDate: '2024-01-15',
      readTime: '5 min read',
      tags: ['AI', 'Content Creation', 'Future Trends'],
      featured: true
    },
    {
      id: '2',
      title: 'Building Your Brand Voice with AI',
      excerpt: 'Learn how to maintain consistency and authenticity in your brand voice while leveraging AI tools for content generation.',
      content: 'Full article content here...',
      author: 'Sarah Chen',
      publishDate: '2024-01-10',
      readTime: '7 min read',
      tags: ['Brand Voice', 'AI', 'Marketing Strategy'],
      featured: false
    },
    {
      id: '3',
      title: '10 Social Media Automation Best Practices',
      excerpt: 'Discover the essential strategies for automating your social media while maintaining genuine engagement with your audience.',
      content: 'Full article content here...',
      author: 'Mike Rodriguez',
      publishDate: '2024-01-05',
      readTime: '6 min read',
      tags: ['Social Media', 'Automation', 'Best Practices'],
      featured: false
    },
    {
      id: '4',
      title: 'Measuring ROI in Content Marketing',
      excerpt: 'A comprehensive guide to tracking and measuring the return on investment for your content marketing efforts.',
      content: 'Full article content here...',
      author: 'Lisa Park',
      publishDate: '2024-01-01',
      readTime: '8 min read',
      tags: ['ROI', 'Content Marketing', 'Analytics'],
      featured: false
    }
  ];

  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-dark">
      <Header openModal={openModal} session={session} />

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

          {/* Search and Filter */}
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
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !selectedTag
                    ? 'bg-primary text-white'
                    : 'bg-dark-card border border-dark-border text-white/70 hover:text-white'
                }`}
              >
                All Topics
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-primary text-white'
                      : 'bg-dark-card border border-dark-border text-white/70 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Post */}
          {featuredPost && (!searchTerm && !selectedTag) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-dark-card border border-dark-border rounded-xl p-8 mb-12"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 hover:text-gradient transition-colors cursor-pointer">
                {featuredPost.title}
              </h2>
              <p className="text-white/70 text-lg mb-6 leading-relaxed">
                {featuredPost.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-6 text-white/60 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{featuredPost.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(featuredPost.publishDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{featuredPost.readTime}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {featuredPost.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-dark-lighter px-3 py-1 rounded-full text-sm text-white/70"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
              <button className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors">
                Read More
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
              >
                <h3 className="text-xl font-semibold mb-3 group-hover:text-gradient transition-colors">
                  {post.title}
                </h3>
                <p className="text-white/70 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="bg-dark-lighter px-2 py-1 rounded text-xs text-white/70"
                    >
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 2 && (
                    <span className="text-xs text-white/50">
                      +{post.tags.length - 2} more
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-primary group-hover:text-primary-light transition-colors">
                  <span className="text-sm font-medium">Read Article</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </motion.article>
            ))}
          </div>

          {/* No Results */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-white/60 mb-4">
                <Search className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg">No articles found matching your criteria.</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTag('');
                }}
                className="btn btn-secondary mt-4"
              >
                Clear Filters
              </button>
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
      <LoginModal isOpen={showLoginModal} onClose={closeModal} />
    </div>
  );
}