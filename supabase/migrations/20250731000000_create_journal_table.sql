-- Create journal entries table for different types of journals (BiP, personal, etc.)
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  
  -- Journal metadata
  title text,
  journal_type text NOT NULL DEFAULT 'general', -- 'bip', 'personal', 'project', etc.
  
  -- Content fields
  content_text text, -- Rich text content
  content_html text, -- HTML version for rich text
  audio_url text, -- Supabase storage URL for audio recordings
  audio_transcript text, -- Transcribed text from audio
  handwriting_data jsonb, -- Canvas drawing data for handwritten entries
  
  -- AI processing fields
  ai_summary text, -- AI-generated summary
  ai_social_post text, -- AI-generated social media post
  ai_blog_post text, -- AI-generated blog post
  ai_processing_status text DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  
  -- Metadata
  mood text, -- Optional mood tracking
  tags text[], -- Array of tags for categorization
  is_private boolean DEFAULT true,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_brand_id ON public.journal_entries(brand_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_journal_type ON public.journal_entries(journal_type);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON public.journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON public.journal_entries USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own journal entries
CREATE POLICY "Users can view own journal entries" ON public.journal_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own journal entries
CREATE POLICY "Users can insert own journal entries" ON public.journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own journal entries
CREATE POLICY "Users can update own journal entries" ON public.journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own journal entries
CREATE POLICY "Users can delete own journal entries" ON public.journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.journal_entries IS 'Stores journal entries with support for different types (BiP, personal, etc.) and multiple input methods (text, voice, handwriting)';
COMMENT ON COLUMN public.journal_entries.journal_type IS 'Type of journal entry: bip (Build in Public), personal, project, etc.';
COMMENT ON COLUMN public.journal_entries.content_text IS 'Plain text content of the journal entry';
COMMENT ON COLUMN public.journal_entries.content_html IS 'HTML formatted content for rich text entries';
COMMENT ON COLUMN public.journal_entries.audio_url IS 'Supabase storage URL for audio recordings';
COMMENT ON COLUMN public.journal_entries.audio_transcript IS 'AI-transcribed text from audio recordings';
COMMENT ON COLUMN public.journal_entries.handwriting_data IS 'JSON data for handwritten entries (canvas strokes, etc.)';
COMMENT ON COLUMN public.journal_entries.ai_summary IS 'AI-generated summary of the journal entry';
COMMENT ON COLUMN public.journal_entries.ai_social_post IS 'AI-generated social media post based on journal content';
COMMENT ON COLUMN public.journal_entries.ai_blog_post IS 'AI-generated blog post based on journal content';
COMMENT ON COLUMN public.journal_entries.ai_processing_status IS 'Status of AI processing: pending, processing, completed, failed';