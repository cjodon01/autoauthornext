'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';

export const useTokenBalance = () => {
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenBalance = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setTokenBalance(null);
          setLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('token_balance')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          // If tokens column doesn't exist or table doesn't exist, use default
          if (profileError.code === '42703' || profileError.code === '42P01') {
            console.warn('Tokens column not found in profiles table, using default balance');
            setTokenBalance(1000); // Default token balance
            return;
          }
          throw profileError;
        }

        if (profile) {
          setTokenBalance(profile.token_balance || 1000);
        }
      } catch (error) {
        console.error('Error fetching token balance:', error);
        setTokenBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenBalance();
    
    // Set up real-time subscription for token balance updates
    const supabase = createClient();
    const subscription = supabase
      .channel('profile_tokens')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          if (payload.new && typeof payload.new.tokens === 'number') {
            setTokenBalance(payload.new.tokens);
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