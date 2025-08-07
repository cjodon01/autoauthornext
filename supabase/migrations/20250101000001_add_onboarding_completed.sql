-- Add onboarding_completed field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Add comment explaining the purpose of this column
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Whether the user has completed the onboarding flow';

-- Update existing profiles to mark them as having completed onboarding (for existing users)
UPDATE public.profiles 
SET onboarding_completed = true 
WHERE onboarding_completed IS NULL; 