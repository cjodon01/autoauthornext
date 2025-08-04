'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';

interface AiModel {
  id: string;
  model_name: string;
  api_model_id: string;
  provider_id: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
  token_cost_per_1k: number | null;
  created_at: string;
  updated_at: string;
}

interface UseAiModelsReturn {
  aiModels: AiModel[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAiModels(): UseAiModelsReturn {
  const [aiModels, setAiModels] = useState<AiModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchAiModels = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('ai_models')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true }); // Use created_at instead of display_order

      if (fetchError) {
        // Check if table doesn't exist or column doesn't exist
        if (fetchError.code === '42P01' || fetchError.code === '42703') {
          console.warn('AI models table not found, using fallback data');
        } else {
          throw fetchError;
        }
      } else {
        setAiModels(data || []);
        return; // Success, don't use fallback
      }
    } catch (err) {
      console.warn('Using fallback AI models due to database error:', err);
    }
    
    // Always provide fallback models if database fails
    setAiModels([
      {
        id: 'mock-gpt-4',
        model_name: 'GPT-4',
        api_model_id: 'gpt-4',
        provider_id: 'openai',
        description: 'OpenAI GPT-4 - Most capable model',
        is_active: true,
        display_order: 1,
        token_cost_per_1k: 0.03,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mock-gpt-3.5',
        model_name: 'GPT-3.5 Turbo',
        api_model_id: 'gpt-3.5-turbo',
        provider_id: 'openai',
        description: 'OpenAI GPT-3.5 - Fast and efficient',
        is_active: true,
        display_order: 2,
        token_cost_per_1k: 0.002,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchAiModels();
  }, []);

  const refresh = async () => {
    await fetchAiModels();
  };

  return {
    aiModels,
    loading,
    error,
    refresh
  };
}