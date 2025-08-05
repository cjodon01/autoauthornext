'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../lib/auth/provider';
import { createClient } from '../../../lib/supabase/client';
import { toast } from 'sonner';
import AuthenticatedNavbar from '../../../components/layout/AuthenticatedNavbar';
import ParticleBackground from '../../../components/ui/ParticleBackground';
import JournalClientOriginal from '../../../app/journal/JournalClient';

const JournalClient: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasJournalEntries, setHasJournalEntries] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      checkJournalEntries();
    }
  }, [user, loading]);

  const checkJournalEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('user_id', user?.id)
        .eq('journal_type', 'bip')
        .limit(1);

      if (error) {
        console.error('Error checking journal entries:', error);
        toast.error('Failed to load journal data');
      } else {
        setHasJournalEntries(data && data.length > 0);
      }
    } catch (error) {
      console.error('Error checking journal entries:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading || isInitializing) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/70">Loading journal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/70">Please log in to access journal.</p>
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

      {/* Header with Back Button */}
      <div className="container mx-auto px-4 pt-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/tools')}
            className="btn btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-display font-bold mb-2">
              AI-Powered <span className="text-gradient">Journal</span>
            </h1>
            <p className="text-white/70">
              Transform your thoughts into engaging content
            </p>
          </div>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Welcome Message for New Users */}
        {!hasJournalEntries && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-card border border-dark-border rounded-xl p-6 mb-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2">Welcome to Your AI Journal!</h3>
                <p className="text-white/60 text-sm mb-4">
                  Start documenting your journey and let AI transform your thoughts into engaging social media content, 
                  blog posts, and summaries. Perfect for building in public and content creation.
                </p>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Sparkles className="h-3 w-3" />
                  <span>AI-powered content generation</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Original Journal Content */}
      <JournalClientOriginal />
    </div>
  );
};

export default JournalClient; 