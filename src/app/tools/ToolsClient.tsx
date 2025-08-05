'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  PenTool, 
  Image, 
  Type, 
  Search,
  Sparkles,
  Zap,
  BookOpen,
  Mic,
  Calendar,
  Hash,
  FileText,
  RefreshCw,
  BarChart3,
  Grid3X3,
  BarChart
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';
import AuthenticatedNavbar from '../../components/layout/AuthenticatedNavbar';
import Footer from '../../components/layout/Footer';
import ParticleBackground from '../../components/ui/ParticleBackground';
import ToolsDashboard from '../../components/tools/ToolsDashboard';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  route: string;
  category: 'core' | 'media' | 'enhancement' | 'future';
  status: 'available' | 'coming-soon';
}

const tools: Tool[] = [
  // Core Tools (Available Now)
  {
    id: 'post-now',
    name: 'Post Now',
    description: 'Create and publish single posts to multiple platforms',
    icon: MessageSquare,
    color: '#3B82F6',
    route: '/tools/post-now',
    category: 'core',
    status: 'available'
  },
  {
    id: 'journal',
    name: 'Journal',
    description: 'AI-powered journal entries with content processing',
    icon: BookOpen,
    color: '#10B981',
    route: '/tools/journal',
    category: 'core',
    status: 'available'
  },
  {
    id: 'media-generator',
    name: 'AI Media Generator',
    description: 'Generate images and memes using AI',
    icon: Sparkles,
    color: '#8B5CF6',
    route: '/tools/media-generator',
    category: 'core',
    status: 'available'
  },
  {
    id: 'meme-creator',
    name: 'Meme Creator',
    description: 'Create memes with text overlay and stock photos',
    icon: Type,
    color: '#F59E0B',
    route: '/tools/meme-creator',
    category: 'core',
    status: 'available'
  },
  {
    id: 'image-search',
    name: 'Image Search',
    description: 'Search stock photos from multiple platforms',
    icon: Search,
    color: '#EF4444',
    route: '/tools/image-search',
    category: 'core',
    status: 'available'
  },

  // Enhancement Tools (Coming Soon)
  {
    id: 'content-calendar',
    name: 'Content Calendar',
    description: 'Plan and schedule your content visually',
    icon: Calendar,
    color: '#06B6D4',
    route: '/tools/calendar',
    category: 'enhancement',
    status: 'coming-soon'
  },
  {
    id: 'hashtag-generator',
    name: 'Hashtag Generator',
    description: 'AI-powered hashtag suggestions',
    icon: Hash,
    color: '#EC4899',
    route: '/tools/hashtags',
    category: 'enhancement',
    status: 'coming-soon'
  },
  {
    id: 'caption-writer',
    name: 'Caption Writer',
    description: 'Generate engaging captions for your posts',
    icon: FileText,
    color: '#84CC16',
    route: '/tools/captions',
    category: 'enhancement',
    status: 'coming-soon'
  },
  {
    id: 'content-repurpose',
    name: 'Content Repurposer',
    description: 'Convert content for different platforms',
    icon: RefreshCw,
    color: '#6366F1',
    route: '/tools/repurpose',
    category: 'enhancement',
    status: 'coming-soon'
  },
  {
    id: 'voice-to-text',
    name: 'Voice to Text',
    description: 'Convert voice recordings to text',
    icon: Mic,
    color: '#F97316',
    route: '/tools/voice',
    category: 'enhancement',
    status: 'coming-soon'
  },
  {
    id: 'analytics',
    name: 'Content Analytics',
    description: 'Track performance and engagement',
    icon: BarChart3,
    color: '#14B8A6',
    route: '/tools/analytics',
    category: 'enhancement',
    status: 'coming-soon'
  }
];

const ToolsClient: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [viewMode, setViewMode] = useState<'grid' | 'dashboard'>('grid');

  const handleLogout = async () => {
    await signOut();
  };

  const handleToolClick = (tool: Tool) => {
    if (tool.status === 'available') {
      router.push(tool.route);
    } else {
      // Show coming soon message
      console.log(`${tool.name} coming soon!`);
    }
  };

  const getCategoryTools = (category: Tool['category']) => {
    return tools.filter(tool => tool.category === category);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/70">Loading tools...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/70">Please log in to access tools.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <ParticleBackground />
      
      {/* Navigation */}
      <AuthenticatedNavbar
        onLogout={handleLogout}
        userEmail={user?.email}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-display font-bold mb-4">
                Content Creation <span className="text-gradient">Tools</span>
              </h1>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Everything you need to create engaging content for social media. 
                From AI-powered generation to custom memes, we&apos;ve got you covered.
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('dashboard')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'dashboard' 
                    ? 'bg-primary text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <BarChart className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Conditional Rendering based on view mode */}
          {viewMode === 'dashboard' ? (
            <ToolsDashboard />
          ) : (
            <>
              {/* Core Tools */}
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  Core Tools
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getCategoryTools('core').map((tool, index) => (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      onClick={() => handleToolClick(tool)}
                      className={`bg-dark-card border border-dark-border rounded-xl p-6 cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-elevation-2 ${
                        tool.status === 'coming-soon' ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${tool.color}20` }}
                        >
                          <tool.icon className="h-6 w-6" style={{ color: tool.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-white">{tool.name}</h3>
                            {tool.status === 'coming-soon' && (
                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                                Coming Soon
                              </span>
                            )}
                          </div>
                          <p className="text-white/60 text-sm">{tool.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Enhancement Tools */}
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-secondary" />
                  Coming Soon
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getCategoryTools('enhancement').map((tool, index) => (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      onClick={() => handleToolClick(tool)}
                      className="bg-dark-card border border-dark-border rounded-xl p-6 cursor-pointer transition-all duration-200 opacity-60 hover:border-secondary/50"
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${tool.color}20` }}
                        >
                          <tool.icon className="h-6 w-6" style={{ color: tool.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-white">{tool.name}</h3>
                            <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                              Coming Soon
                            </span>
                          </div>
                          <p className="text-white/60 text-sm">{tool.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => router.push('/tools/post-now')}
                    className="p-4 bg-dark-lighter rounded-lg border border-dark-border hover:border-primary/50 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-2 group-hover:bg-blue-500/30 transition-colors">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                    </div>
                    <h4 className="font-medium text-white text-sm">Post Now</h4>
                    <p className="text-xs text-white/60">Quick post creation</p>
                  </button>

                  <button
                    onClick={() => router.push('/tools/journal')}
                    className="p-4 bg-dark-lighter rounded-lg border border-dark-border hover:border-primary/50 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mb-2 group-hover:bg-green-500/30 transition-colors">
                      <BookOpen className="h-4 w-4 text-green-500" />
                    </div>
                    <h4 className="font-medium text-white text-sm">Journal</h4>
                    <p className="text-xs text-white/60">AI-powered entries</p>
                  </button>

                  <button
                    onClick={() => router.push('/tools/media-generator')}
                    className="p-4 bg-dark-lighter rounded-lg border border-dark-border hover:border-primary/50 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mb-2 group-hover:bg-purple-500/30 transition-colors">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                    </div>
                    <h4 className="font-medium text-white text-sm">Generate</h4>
                    <p className="text-xs text-white/60">AI media creation</p>
                  </button>

                  <button
                    onClick={() => router.push('/tools/meme-creator')}
                    className="p-4 bg-dark-lighter rounded-lg border border-dark-border hover:border-primary/50 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center mb-2 group-hover:bg-orange-500/30 transition-colors">
                      <Type className="h-4 w-4 text-orange-500" />
                    </div>
                    <h4 className="font-medium text-white text-sm">Meme</h4>
                    <p className="text-xs text-white/60">Create memes</p>
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ToolsClient; 