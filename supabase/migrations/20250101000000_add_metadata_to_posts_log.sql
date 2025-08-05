-- Add metadata column to posts_log table for storing meme editing data
ALTER TABLE public.posts_log 
ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb; 