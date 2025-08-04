'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PenTool, Mic, MicOff, FileText, Wand2, Share2, Save, Plus, BookOpen, Calendar, Tag, X, Check, Facebook, Twitter, Linkedin, MessageSquare, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../lib/auth/provider';
import { createClient } from '../../lib/supabase/client';
import { toast } from 'sonner';
import AuthenticatedNavbar from '../../components/layout/AuthenticatedNavbar';

interface JournalEntry {
  id: string;
  title: string | null;
  content_text: string | null;
  content_html: string | null;
  audio_url: string | null;
  audio_transcript: string | null;
  handwriting_data: any | null;
  ai_summary: string | null;
  ai_social_post: string | null;
  ai_blog_post: string | null;
  ai_processing_status: string;
  mood: string | null;
  tags: string[] | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

const JournalClient: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  // State for journal entries
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for new entry creation
  const [isCreating, setIsCreating] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content_text: '',
    content_html: '',
    mood: '',
    tags: [] as string[],
    is_private: true
  });
  
  // State for input modes
  const [inputMode, setInputMode] = useState<'text' | 'voice' | 'handwriting'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  // State for AI processing
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  
  // State for posting modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [postingEntry, setPostingEntry] = useState<JournalEntry | null>(null);
  const [socialConnections, setSocialConnections] = useState<any[]>([]);
  const [socialPages, setSocialPages] = useState<any[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [availableTargets, setAvailableTargets] = useState<any[]>([]);
  const [contentChoice, setContentChoice] = useState<'summary' | 'social'>('social');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEntries();
      fetchSocialConnections();
    }
  }, [user]);
  
  // Update available targets when social data changes
  useEffect(() => {
    updateAvailableTargets();
  }, [socialPages, socialConnections]);

  const fetchEntries = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('journal_type', 'bip')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching journal entries:', error);
        toast.error('Failed to load journal entries');
      } else {
        setEntries(data || []);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    if (!user || !newEntry.content_text.trim()) {
      toast.error('Please add some content to your journal entry');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          journal_type: 'bip',
          title: newEntry.title || null,
          content_text: newEntry.content_text,
          content_html: newEntry.content_html || null,
          mood: newEntry.mood || null,
          tags: newEntry.tags,
          is_private: newEntry.is_private
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving journal entry:', error);
        toast.error('Failed to save journal entry');
      } else {
        toast.success('Journal entry saved!');
        setEntries([data, ...entries]);
        setNewEntry({
          title: '',
          content_text: '',
          content_html: '',
          mood: '',
          tags: [],
          is_private: true
        });
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save journal entry');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        // Here you would upload to Supabase storage and transcribe
        // For now, just show a placeholder
        toast.info('Voice recording completed. Transcription feature coming soon!');
        setIsRecording(false);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.info('Recording started...');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const generateAIContent = async (entry: JournalEntry) => {
    if (!entry.content_text) {
      toast.error('No content to process');
      return;
    }

    setIsProcessingAI(true);
    setSelectedEntry(entry);

    try {
      const { data, error } = await supabase.functions.invoke('journal-ai-process', {
        body: { 
          entry_id: entry.id, 
          user_id: user?.id,
          ai_model_name: 'gpt-4o-mini' // Default model, could be made configurable
        }
      });

      if (error) {
        console.error('Error generating AI content:', error);
        toast.error('Failed to generate AI content');
      } else {
        toast.success('AI content generated successfully!');
        // Refresh the entries to show the updated content
        await fetchEntries();
      }
      
    } catch (error) {
      console.error('Error generating AI content:', error);
      toast.error('Failed to generate AI content');
    } finally {
      setIsProcessingAI(false);
      setSelectedEntry(null);
    }
  };

  const fetchSocialConnections = async () => {
    if (!user) return;
    
    try {
      // Fetch social connections
      const { data: connections, error: connectionsError } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id);
      
      if (connectionsError) {
        console.error('Error fetching social connections:', connectionsError);
      } else {
        setSocialConnections(connections || []);
      }
      
      // Fetch social pages
      const { data: pages, error: pagesError } = await supabase
        .from('social_pages')
        .select('*')
        .eq('user_id', user.id);
      
      if (pagesError) {
        console.error('Error fetching social pages:', pagesError);
      } else {
        setSocialPages(pages || []);
      }
    } catch (error) {
      console.error('Error fetching social data:', error);
    }
  };

  const platforms = [
    { name: "Facebook", key: "facebook", icon: Facebook, color: "#1877F2" },
    { name: "Twitter", key: "twitter", icon: Twitter, color: "#1DA1F2" },
    { name: "Instagram", key: "instagram", icon: MessageSquare, color: "#E4405F" },
    { name: "LinkedIn", key: "linkedin", icon: Linkedin, color: "#0A66C2" },
  ];
  
  const updateAvailableTargets = () => {
    const targets: any[] = [];

    // Add pages (Facebook/Instagram) 
    socialPages.forEach(page => {
      const platformConfig = platforms.find(p => p.key === page.provider?.toLowerCase());
      if (platformConfig) {
        targets.push({
          id: `page:${page.id}`,
          type: 'page',
          name: page.page_name || platformConfig.name,
          subtitle: `${platformConfig.name} Page`,
          icon: platformConfig.icon,
          color: platformConfig.color,
          description: page.page_category || 'No category'
        });
      }
    });

    // Add other connections (excluding Facebook/Instagram which use pages)
    socialConnections.forEach(connection => {
      if (connection.provider && 
          !['facebook', 'instagram'].includes(connection.provider.toLowerCase())) {
        const platformConfig = platforms.find(p => p.key === connection.provider?.toLowerCase());
        if (platformConfig) {
          targets.push({
            id: `connection:${connection.id}`,
            type: 'connection',
            name: platformConfig.name,
            subtitle: 'Personal Account',
            icon: platformConfig.icon,
            color: platformConfig.color,
            description: 'Connected account'
          });
        }
      }
    });

    setAvailableTargets(targets);
  };

  const toggleTarget = (targetId: string) => {
    setSelectedTargets(prev => 
      prev.includes(targetId)
        ? prev.filter(id => id !== targetId)
        : [...prev, targetId]
    );
  };

  const handlePostToSocial = (entry: JournalEntry) => {
    setPostingEntry(entry);
    setShowPostModal(true);
    setSelectedTargets([]);
    setContentChoice('social');
  };

  const handlePost = async () => {
    if (!postingEntry || selectedTargets.length === 0) {
      toast.error('Please select at least one platform to post to');
      return;
    }
    
    const contentToPost = contentChoice === 'summary' ? postingEntry.ai_summary : postingEntry.ai_social_post;
    if (!contentToPost) {
      toast.error(`No ${contentChoice === 'summary' ? 'summary' : 'social post'} content available`);
      return;
    }
    
    setIsPosting(true);
    let successfulPostsCount = 0;
    const errors: string[] = [];
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !user) {
        throw new Error('No active session or user found. Please log in.');
      }

      // Process each selected target individually
      for (const targetId of selectedTargets) {
        const [type, id] = targetId.split(':');

        let platformKey: string | undefined;
        let pageIdToUse: string | undefined;
        let connectionIdToUse: string | undefined;

        if (type === 'page') {
          const page = socialPages.find(p => p.id === id);
          if (page) {
            platformKey = page.provider?.toLowerCase();
            pageIdToUse = page.id;
          }
        } else if (type === 'connection') {
          const connection = socialConnections.find(c => c.id === id);
          if (connection) {
            platformKey = connection.provider?.toLowerCase();
            connectionIdToUse = connection.id;
          }
        }

        if (!platformKey) {
          errors.push(`Could not determine platform for target: ${targetId}`);
          continue;
        }

        if (!['facebook', 'instagram', 'twitter', 'linkedin'].includes(platformKey)) {
          errors.push(`Posting to ${platformKey} is not yet implemented on the server-side.`);
          continue;
        }

        const payload: any = {
          action: 'post',
          user_id: user.id,
          selected_post: contentToPost,
          platforms: [platformKey],
        };

        if (type === 'page') {
            if (!pageIdToUse) {
                errors.push(`Missing page ID for ${platformKey} target: ${targetId}`);
                continue;
            }
            payload.page_id = pageIdToUse;
        } else if (type === 'connection') {
            if (!connectionIdToUse) {
                errors.push(`Missing connection ID for ${platformKey} target: ${targetId}`);
                continue;
            }
            payload.social_connection_id = connectionIdToUse;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/single-post`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error posting to ${platformKey}:`, errorText);
          
          let errorMessage = `Failed to post to ${platformKey}`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          
          errors.push(errorMessage);
          continue;
        }

        const result = await response.json();
        console.log(`Successfully posted to ${platformKey}:`, result);
        successfulPostsCount++;
      }
      
      // Show results
      if (successfulPostsCount > 0) {
        toast.success(`Successfully posted to ${successfulPostsCount} platform${successfulPostsCount !== 1 ? 's' : ''}!`);
        
        if (errors.length === 0) {
          // All posts successful, close modal
          setShowPostModal(false);
        }
      }

      if (errors.length > 0) {
        console.error('Posting errors:', errors);
        toast.error(`Failed to post to ${errors.length} platform${errors.length !== 1 ? 's' : ''}. Check console for details.`);
      }
      
    } catch (error) {
      console.error('Error posting to social:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This should be handled by the middleware
  }

  return (
    <div className="min-h-screen bg-dark relative">
      {/* Navigation */}
      <AuthenticatedNavbar
        onLogout={handleLogout}
        onTokenClick={() => {}}
        userEmail={user?.email}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-card border border-dark-border rounded-xl p-8 shadow-elevation-2"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-gradient">
                  Build in Public Journal
                </h1>
                <p className="text-white/70">
                  Document your journey and let AI turn it into social content
                </p>
              </div>
            </div>
            
          <motion.button
            onClick={() => setIsCreating(!isCreating)}
            className="btn btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4" />
            New Entry
          </motion.button>
          </div>

          {/* New Entry Form */}
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-6 bg-dark-lighter border border-dark-border rounded-lg"
            >
              <h3 className="text-lg font-semibold mb-4">Create New Journal Entry</h3>
              
              {/* Input Mode Selection */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setInputMode('text')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    inputMode === 'text' 
                      ? 'border-primary bg-primary/20 text-primary' 
                      : 'border-dark-border text-white/70 hover:border-primary/50'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Text
                </button>
                <button
                  onClick={() => setInputMode('voice')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    inputMode === 'voice' 
                      ? 'border-secondary bg-secondary/20 text-secondary' 
                      : 'border-dark-border text-white/70 hover:border-secondary/50'
                  }`}
                >
                  <Mic className="h-4 w-4" />
                  Voice
                </button>
                <button
                  onClick={() => setInputMode('handwriting')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    inputMode === 'handwriting' 
                      ? 'border-accent bg-accent/20 text-accent' 
                      : 'border-dark-border text-white/70 hover:border-accent/50'
                  }`}
                >
                  <PenTool className="h-4 w-4" />
                  Handwriting
                </button>
              </div>

              {/* Title Input */}
              <input
                type="text"
                placeholder="Entry title (optional)"
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                className="w-full p-3 bg-dark border border-dark-border rounded-lg text-white placeholder-white/50 mb-4 focus:border-primary focus:outline-none"
              />

              {/* Content Input Based on Mode */}
              {inputMode === 'text' && (
                <textarea
                  placeholder="What's happening in your journey today? Share your wins, challenges, learnings..."
                  value={newEntry.content_text}
                  onChange={(e) => setNewEntry({ ...newEntry, content_text: e.target.value })}
                  className="w-full h-40 p-3 bg-dark border border-dark-border rounded-lg text-white placeholder-white/50 mb-4 focus:border-primary focus:outline-none resize-none"
                />
              )}

              {inputMode === 'voice' && (
                <div className="h-40 bg-dark border border-dark-border rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center hover:bg-secondary/30 transition-colors mb-4 mx-auto"
                      >
                        <Mic className="h-8 w-8 text-secondary" />
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-colors mb-4 mx-auto animate-pulse"
                      >
                        <MicOff className="h-8 w-8 text-red-500" />
                      </button>
                    )}
                    <p className="text-white/70">
                      {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                    </p>
                  </div>
                </div>
              )}

              {inputMode === 'handwriting' && (
                <div className="h-40 bg-dark border border-dark-border rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center text-white/70">
                    <PenTool className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Handwriting support coming soon!</p>
                    <p className="text-sm">Canvas-based drawing will be implemented</p>
                  </div>
                </div>
              )}

              {/* Mood and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Mood (optional)</label>
                  <select
                    value={newEntry.mood}
                    onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                    className="w-full p-2 bg-dark border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none"
                  >
                    <option value="">Select mood...</option>
                    <option value="excited">🚀 Excited</option>
                    <option value="focused">🎯 Focused</option>
                    <option value="challenged">💪 Challenged</option>
                    <option value="grateful">🙏 Grateful</option>
                    <option value="reflective">🤔 Reflective</option>
                    <option value="motivated">⚡ Motivated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Privacy</label>
                  <select
                    value={newEntry.is_private ? 'private' : 'public'}
                    onChange={(e) => setNewEntry({ ...newEntry, is_private: e.target.value === 'private' })}
                    className="w-full p-2 bg-dark border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none"
                  >
                    <option value="private">🔒 Private</option>
                    <option value="public">🌍 Public</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSaveEntry}
                  className="btn btn-primary flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="h-4 w-4" />
                  Save Entry
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Entries List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-dark-lighter rounded-lg animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/70 mb-2">No journal entries yet</h3>
              <p className="text-white/50 mb-4">Start documenting your Build in Public journey!</p>
              <motion.button
                onClick={() => setIsCreating(true)}
                className="btn btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create First Entry
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-dark-lighter border border-dark-border rounded-lg hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {entry.title || 'Untitled Entry'}
                        </h3>
                        {entry.mood && (
                          <span className="text-sm px-2 py-1 bg-primary/20 text-primary rounded-full">
                            {entry.mood}
                          </span>
                        )}
                        {entry.is_private && (
                          <span className="text-xs px-2 py-1 bg-dark-border text-white/60 rounded-full">
                            Private
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                        {entry.tags && entry.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Tag className="h-4 w-4" />
                            {entry.tags.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-white/80 mb-4 line-clamp-3">
                    {entry.content_text}
                  </p>

                  {/* AI Generated Content Preview */}
                  {(entry.ai_summary || entry.ai_social_post || entry.ai_blog_post) && (
                    <div className="mb-4 p-4 bg-dark border border-primary/30 rounded-lg">
                      <h4 className="text-sm font-semibold text-primary mb-2">✨ AI Generated Content</h4>
                      {entry.ai_summary && (
                        <div className="mb-2">
                          <span className="text-xs text-white/60">Summary:</span>
                          <p className="text-sm text-white/80">{entry.ai_summary}</p>
                        </div>
                      )}
                      {entry.ai_social_post && (
                        <div className="mb-2">
                          <span className="text-xs text-white/60">Social Post:</span>
                          <p className="text-sm text-white/80">{entry.ai_social_post}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => generateAIContent(entry)}
                      disabled={isProcessingAI}
                      className="flex items-center gap-2 px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Wand2 className="h-4 w-4" />
                      {isProcessingAI && selectedEntry?.id === entry.id ? 'Processing...' : 'Generate AI Content'}
                    </motion.button>
                    
                    {(entry.ai_social_post || entry.ai_summary) && (
                      <motion.button
                        onClick={() => handlePostToSocial(entry)}
                        className="flex items-center gap-2 px-3 py-2 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Share2 className="h-4 w-4" />
                        Post to Social
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
      
      {/* Post to Social Modal */}
      {showPostModal && postingEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-card border border-dark-border rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Post to Social Media</h3>
              <button
                onClick={() => setShowPostModal(false)}
                className="p-2 hover:bg-dark-lighter rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>
            
            {/* Content Selection */}
            <div className="mb-6">
              <label className="block text-white/70 text-sm mb-3">Select content to post:</label>
              <div className="space-y-2">
                {postingEntry.ai_social_post && (
                  <label className="flex items-start gap-3 p-3 bg-dark-lighter border border-dark-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <input
                      type="radio"
                      name="content"
                      value="social"
                      checked={contentChoice === 'social'}
                      onChange={(e) => setContentChoice(e.target.value as 'social' | 'summary')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium mb-1">Social Post</div>
                      <div className="text-white/70 text-sm line-clamp-3">{postingEntry.ai_social_post}</div>
                    </div>
                  </label>
                )}
                
                {postingEntry.ai_summary && (
                  <label className="flex items-start gap-3 p-3 bg-dark-lighter border border-dark-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <input
                      type="radio"
                      name="content"
                      value="summary"
                      checked={contentChoice === 'summary'}
                      onChange={(e) => setContentChoice(e.target.value as 'social' | 'summary')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium mb-1">Summary</div>
                      <div className="text-white/70 text-sm line-clamp-3">{postingEntry.ai_summary}</div>
                    </div>
                  </label>
                )}
              </div>
            </div>
            
            {/* Target Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/70 mb-3">
                Select Where to Post ({selectedTargets.length} selected)
              </label>
              
              {availableTargets.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {availableTargets.map((target) => {
                    const isSelected = selectedTargets.includes(target.id);
                    
                    return (
                      <button
                        key={target.id}
                        type="button"
                        onClick={() => toggleTarget(target.id)}
                        className={`w-full p-4 rounded-lg border transition-all duration-200 text-left relative group ${
                          isSelected
                            ? 'border-secondary bg-secondary/20 text-white shadow-glow-blue'
                            : 'border-dark-border bg-dark-lighter text-white/70 hover:border-secondary/50 hover:bg-dark-border'
                        }`}
                      >
                        {/* Selection indicator */}
                        <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'border-secondary bg-secondary' 
                            : 'border-white/30 group-hover:border-secondary/50'
                        }`}>
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        
                        <div className="pr-8">
                          <div className="flex items-center gap-3 mb-2">
                            <target.icon 
                              className="h-5 w-5" 
                              style={{ color: target.color }} 
                            />
                            <div>
                              <div className={`font-medium ${isSelected ? 'text-white' : 'text-white/90'}`}>
                                {target.name}
                              </div>
                              <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-white/60'}`}>
                                {target.subtitle}
                              </div>
                            </div>
                          </div>
                          {target.description && (
                            <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-white/50'}`}>
                              {target.description}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">
                  <p className="mb-4">No connected accounts found.</p>
                  <p className="text-sm">Connect your social media accounts first to start posting.</p>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPostModal(false)}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                disabled={isPosting}
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={isPosting || selectedTargets.length === 0}
                className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                {isPosting ? 'Posting...' : 'Post Now'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default JournalClient;