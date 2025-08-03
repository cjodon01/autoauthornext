'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/provider';
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';
import AddTokensModal from '@/components/modals/AddTokensModal';
import SinglePostModal from '@/components/dashboard/SinglePostModal';
import ConnectSocialsModal from '@/components/dashboard/ConnectSocialsModal';
import { Loader2, Plus, BarChart3, Calendar, Users, TrendingUp, Sparkles, Link } from 'lucide-react';

const DashboardClient: React.FC = () => {
  const { user, session, loading, signOut } = useAuth();
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showSinglePostModal, setShowSinglePostModal] = useState(false);
  const [showConnectSocialsModal, setShowConnectSocialsModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
  };

  const stats = [
    {
      title: 'Total Posts',
      value: '24',
      change: '+12%',
      icon: BarChart3,
      color: 'text-primary'
    },
    {
      title: 'Campaigns Active',
      value: '3',
      change: '+2',
      icon: Calendar,
      color: 'text-secondary'
    },
    {
      title: 'Engagement Rate',
      value: '8.2%',
      change: '+1.4%',
      icon: TrendingUp,
      color: 'text-accent'
    },
    {
      title: 'Followers',
      value: '1.2K',
      change: '+43',
      icon: Users,
      color: 'text-primary'
    }
  ];

  return (
    <div className="min-h-screen bg-dark">
      <AuthenticatedNavbar
        onLogout={handleLogout}
        onTokenClick={() => setShowTokenModal(true)}
        userEmail={user?.email}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-white/70">
            Here&apos;s what&apos;s happening with your content today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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
                <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-white/60 text-sm">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            onClick={() => setShowSinglePostModal(true)}
            className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary/30 transition-colors cursor-pointer group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Create Post</h3>
            </div>
            <p className="text-white/70 text-sm">
              Generate a single AI-powered post for your social media.
            </p>
          </motion.div>

          <motion.div
            className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary/30 transition-colors cursor-pointer group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Create Campaign</h3>
            </div>
            <p className="text-white/70 text-sm">
              Start a new content campaign with AI-powered automation.
            </p>
          </motion.div>

          <motion.div
            onClick={() => setShowConnectSocialsModal(true)}
            className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-secondary/30 transition-colors cursor-pointer group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
                <Link className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="font-semibold">Connect Socials</h3>
            </div>
            <p className="text-white/70 text-sm">
              Connect your social media accounts for automated posting.
            </p>
          </motion.div>

          <motion.div
            onClick={() => window.location.href = '/analytics'}
            className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-accent/30 transition-colors cursor-pointer group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors">
                <BarChart3 className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold">View Analytics</h3>
            </div>
            <p className="text-white/70 text-sm">
              Track your content performance and engagement metrics.
            </p>
          </motion.div>

          <motion.div
            className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-accent/30 transition-colors cursor-pointer group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold">Scheduled Posts</h3>
            </div>
            <p className="text-white/70 text-sm">
              Manage your upcoming posts and publication schedule.
            </p>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          className="bg-dark-card border border-dark-border rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-dark-lighter rounded-lg">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm">Campaign &quot;Summer Sale&quot; published 3 posts</span>
              <span className="text-white/40 text-xs ml-auto">2 hours ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-dark-lighter rounded-lg">
              <div className="w-2 h-2 rounded-full bg-secondary"></div>
              <span className="text-sm">Analytics report generated for June</span>
              <span className="text-white/40 text-xs ml-auto">1 day ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-dark-lighter rounded-lg">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <span className="text-sm">New brand &quot;TechCorp&quot; created</span>
              <span className="text-white/40 text-xs ml-auto">3 days ago</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Modals */}
      <AddTokensModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
      />
      
      <SinglePostModal
        isOpen={showSinglePostModal}
        onClose={() => setShowSinglePostModal(false)}
      />
      
      <ConnectSocialsModal
        isOpen={showConnectSocialsModal}
        onClose={() => setShowConnectSocialsModal(false)}
        onConnectionsUpdated={() => {
          // Refresh any cached connection data
          console.log('Social connections updated');
        }}
      />
    </div>
  );
};

export default DashboardClient;