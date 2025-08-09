'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  ArrowLeft, 
  Loader2, 
  Download,
  ExternalLink,
  Settings,
  Sparkles,
  Check,
  Copy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/provider';
import { createClient } from '../../../lib/supabase/client';
import { toast } from 'sonner';
import { useAiModels } from '../../../hooks/useAiModels';
import { useTokenBalance } from '../../../hooks/useTokenBalance';
import AuthenticatedNavbar from '../../../components/layout/AuthenticatedNavbar';
import Footer from '../../../components/layout/Footer';

interface Brand {
  id: string;
  name: string;
  description: string | null;
  mission_statement: string | null;
  usp_statement: string | null;
  brand_persona_description: string | null;
  core_values: string[] | null;
  target_audience: string | null;
  brand_keywords_include: string[] | null;
  brand_keywords_exclude: string[] | null;
  brand_voice: string | null;
  industry: string | null;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  embed_url?: string;
  created_at: string;
}

const BlogGeneratorClient: React.FC = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const { aiModels, loading: modelsLoading } = useAiModels();
  const { tokenBalance, loading: tokenLoading } = useTokenBalance();

  // Form states
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('');
  const [tone, setTone] = useState('professional');
  const [contentStyle, setContentStyle] = useState('educational');
  const [targetAudience, setTargetAudience] = useState('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');

  // Data states
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  
  // Generation states
  const [generating, setGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<BlogPost | null>(null);
  const [copied, setCopied] = useState(false);

  // Tone and style options
  const toneOptions = [
    'professional', 'casual', 'friendly', 'authoritative', 'conversational',
    'inspiring', 'educational', 'humorous', 'serious', 'enthusiastic'
  ];

  const styleOptions = [
    'educational', 'storytelling', 'how-to', 'listicle', 'case-study',
    'opinion', 'news', 'tutorial', 'review', 'comparison'
  ];

  useEffect(() => {
    if (user) {
      fetchBrands();
    }
  }, [user]);

  useEffect(() => {
    if (aiModels.length > 0 && !selectedModelId) {
      // Set default model
      const defaultModel = aiModels.find(m => m.api_model_id === 'gpt-3.5-turbo') || aiModels[0];
      setSelectedModelId(defaultModel.id);
    }
  }, [aiModels, selectedModelId]);

  const fetchBrands = async () => {
    if (!user) return;

    try {
      setBrandsLoading(true);
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching brands:', error);
        toast.error('Failed to load brands');
      } else {
        setBrands(data || []);
        if (data && data.length > 0 && !selectedBrandId) {
          setSelectedBrandId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setBrandsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error('Please sign in to generate blog posts');
      return;
    }

    if (!selectedBrandId) {
      toast.error('Please select a brand');
      return;
    }

    if (!topic.trim()) {
      toast.error('Please enter a blog topic');
      return;
    }

    if (!selectedModelId) {
      toast.error('Please select an AI model');
      return;
    }

    const selectedBrand = brands.find(b => b.id === selectedBrandId);
    if (!selectedBrand) {
      toast.error('Selected brand not found');
      return;
    }

    try {
      setGenerating(true);

      // Create a temporary campaign for the blog post
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          user_id: user.id,
          campaign_name: `Blog: ${topic}`,
          brand_id: selectedBrandId,
          status: 'completed',
          goal: goal,
          ai_tone: tone,
          ai_content_style: contentStyle,
          target_audience_psychographics: targetAudience,
          // Explicitly set page_id and social_id to null for website campaigns
          page_id: null,
          social_id: null
        })
        .select()
        .single();

      if (campaignError || !campaignData) {
        throw new Error('Failed to create campaign');
      }

      // Call the blog generation edge function
      const session = await supabase.auth.getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generateFullBlogPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`
        },
        body: JSON.stringify({
          brand: selectedBrand,
          campaignData: {
            goal: goal || topic,
            strategy: topic,
            tone: tone,
            contentStyle: contentStyle,
            audience: targetAudience || 'general'
          },
          campaign_id: campaignData.id,
          model_id: selectedModelId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate blog post');
      }

      const result = await response.json();
      
      if (result.success) {
        setGeneratedPost({
          id: result.blog_post.id,
          title: result.blog_post.title,
          content: result.blog_post.content_html || result.blog_post.content_markdown || result.blog_post.content || '',
          slug: result.slug,
          embed_url: result.embed_url,
          created_at: result.blog_post.created_at
        });
        toast.success('Blog post generated successfully!');
      } else {
        throw new Error('Blog generation failed');
      }

    } catch (error) {
      console.error('Error generating blog post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate blog post');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Content copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const downloadAsMarkdown = () => {
    if (!generatedPost) return;

    const markdown = `# ${generatedPost.title}\n\n${generatedPost.content}`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedPost.slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Sign In Required</h1>
          <p className="text-white/70 mb-6">Please sign in to use the blog generator.</p>
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <AuthenticatedNavbar 
        onLogout={signOut} 
        onTokenClick={() => router.push('/pricing')}
        userEmail={user?.email}
      />
      
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/tools')}
              className="p-2 rounded-lg bg-dark-lighter border border-dark-border hover:border-white/40 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <FileText className="h-8 w-8 text-indigo-500" />
                Blog Generator
              </h1>
              <p className="text-white/70 mt-1">Generate full blog posts with AI-powered content creation</p>
            </div>
          </div>

          {/* Token Balance */}
          {!tokenLoading && tokenBalance !== null && (
            <div className="mb-6 p-4 bg-dark-card border border-dark-border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Current Token Balance:</span>
                <span className="text-white font-medium">{tokenBalance} tokens</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Blog Configuration
              </h2>

              <div className="space-y-6">
                {/* Brand Selection */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Select Brand
                  </label>
                  {brandsLoading ? (
                    <div className="flex items-center gap-2 text-white/60">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading brands...
                    </div>
                  ) : brands.length > 0 ? (
                    <select
                      value={selectedBrandId}
                      onChange={(e) => setSelectedBrandId(e.target.value)}
                      className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-white/60 text-sm p-4 bg-dark-lighter rounded-lg border border-dark-border">
                      No brands found. Please create a brand first.
                    </div>
                  )}
                </div>

                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Blog Topic *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., The Future of AI in Marketing"
                    className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Goal */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Blog Goal (Optional)
                  </label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Educate readers about AI benefits"
                    className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Target Audience (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Marketing professionals, entrepreneurs"
                    className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {toneOptions.map(option => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content Style */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Content Style
                  </label>
                  <select
                    value={contentStyle}
                    onChange={(e) => setContentStyle(e.target.value)}
                    className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {styleOptions.map(option => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AI Model Selection */}
                {!modelsLoading && aiModels.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      AI Model
                    </label>
                    <select
                      value={selectedModelId}
                      onChange={(e) => setSelectedModelId(e.target.value)}
                      className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {aiModels.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.model_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={generating || !topic.trim() || !selectedBrandId}
                  className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Blog Post...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Blog Post
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Content */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Blog Post
              </h2>

              {!generatedPost ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">
                    Configure your blog settings and click &quot;Generate Blog Post&quot; to create content.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{generatedPost.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(generatedPost.title)}
                        className="text-xs px-2 py-1 bg-dark-lighter border border-dark-border rounded text-white/70 hover:text-white flex items-center gap-1"
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        Copy Title
                      </button>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Content Preview
                    </label>
                    <div className="bg-dark-lighter border border-dark-border rounded-lg p-4 max-h-64 overflow-y-auto">
                      <div className="text-white/80 text-sm whitespace-pre-wrap">
                        {generatedPost.content.substring(0, 500)}
                        {generatedPost.content.length > 500 && '...'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => copyToClipboard(generatedPost.content)}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      Copy Content
                    </button>
                    
                    <button
                      onClick={downloadAsMarkdown}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>

                    {generatedPost.embed_url && (
                      <button
                        onClick={() => window.open(generatedPost.embed_url, '_blank')}
                        className="btn btn-secondary flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Live
                      </button>
                    )}
                  </div>

                  {/* Embed URL */}
                  {generatedPost.embed_url && (
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Blog URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={generatedPost.embed_url}
                          readOnly
                          className="flex-1 bg-dark-lighter border border-dark-border rounded-lg px-4 py-2 text-white/80 text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(generatedPost.embed_url!)}
                          className="px-3 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white/70 hover:text-white"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogGeneratorClient;