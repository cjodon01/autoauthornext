/*
  # Add Multi-Platform Support to Campaigns

  1. New Columns
    - `target_platforms` (text[]): Array of platform identifiers
    - `target_page_ids` (uuid[]): Array of social page IDs
    - `target_connection_ids` (uuid[]): Array of social connection IDs
  
  2. Changes
    - Adds array columns to store multiple platforms, pages, and connections
    - Maintains backward compatibility with existing columns
    - Enables a single campaign to target multiple social platforms
*/

-- Add array columns to store multiple platforms, pages, and connections
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS target_platforms text[],
ADD COLUMN IF NOT EXISTS target_page_ids uuid[],
ADD COLUMN IF NOT EXISTS target_connection_ids uuid[];

-- Add comment explaining the purpose of these columns
COMMENT ON COLUMN public.campaigns.target_platforms IS 'Array of platform identifiers (e.g., facebook, twitter) for multi-platform campaigns';
COMMENT ON COLUMN public.campaigns.target_page_ids IS 'Array of social_pages.id references for multi-platform campaigns';
COMMENT ON COLUMN public.campaigns.target_connection_ids IS 'Array of social_connections.id references for multi-platform campaigns';

-- Update the campaigns table to add start_date and end_date columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'campaigns' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE public.campaigns ADD COLUMN start_date date;
    COMMENT ON COLUMN public.campaigns.start_date IS 'The date when the campaign should start';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'campaigns' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE public.campaigns ADD COLUMN end_date date;
    COMMENT ON COLUMN public.campaigns.end_date IS 'The date when the campaign should end';
  END IF;
END $$;