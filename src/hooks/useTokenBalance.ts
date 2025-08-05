'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';

export const useTokenBalance = () => {
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    const fetchTokenBalance = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setTokenBalance(null);
          setLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('token_balance')
          .eq('user_id', session.user.id)
          .single();

        if (profileError) {
          // If profile doesn't exist, create one
          if (profileError.code === 'PGRST116') {
            console.log('Profile not found, creating new profile for user');
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([
                {
                  user_id: session.user.id,
                  email: session.user.email,
                  token_balance: 1000, // Default token balance
                  brand_name: 'Default Brand', // Required field
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ])
              .select('token_balance')
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
              setTokenBalance(1000); // Use default on error
            } else {
              setTokenBalance(newProfile.token_balance || 1000);
            }
            setLoading(false);
            return;
          }

          // If tokens column doesn't exist or table doesn't exist, use default
          if (profileError.code === '42703' || profileError.code === '42P01') {
            console.warn('Tokens column not found in profiles table, using default balance');
            setTokenBalance(1000); // Default token balance
            setLoading(false);
            return;
          }
          console.error('Error fetching token balance:', profileError);
          setTokenBalance(1000); // Use default on error
          setLoading(false);
          return;
        }

        if (profile) {
          setTokenBalance(profile.token_balance || 1000);
        }
      } catch (error) {
        console.error('Error fetching token balance:', error);
        setTokenBalance(1000); // Use default on error instead of 0
      } finally {
        setLoading(false);
      }
    };

    fetchTokenBalance();
    
    // Set up real-time subscription for token balance updates
    const subscription = supabase
      .channel('profile_tokens')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          if (payload.new && typeof payload.new.token_balance === 'number') {
            setTokenBalance(payload.new.token_balance);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { tokenBalance, loading };
};