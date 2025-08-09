import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client';

const supabase = createClient();

export function useAiModels() {
  const [aiModels, setAiModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      const { data, error } = await supabase.from('ai_models').select('*');
      if (error) {
        console.error('[useAiModels] Error fetching models:', error);
      } else {
        setAiModels(data || []);
      }
      setLoading(false);
    };

    fetchModels();
  }, []);

  return { aiModels, loading };
}