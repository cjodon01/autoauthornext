import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Task cost configuration
const TASK_COSTS = {
  'post_now_text': 10,
  'post_now_with_image': 25,
  'post_now_with_meme': 30,
  'general_campaign_post': 15,
  'journey_campaign_post': 20,
  'media_generation': 50,
  'brand_analysis': 30,
  'brand_generation': 25,
  'content_optimization': 25
};

// Platform multipliers
const PLATFORM_MULTIPLIERS = {
  1: 1.0,
  2: 1.5,
  3: 2.0,
  4: 2.5,
  5: 3.0
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { 
      user_id, 
      task_type, 
      model_id, 
      include_image = false, 
      include_meme = false, 
      platform_count = 1 
    } = body;

    // Validate required fields
    if (!user_id || !task_type) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: user_id and task_type' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ 
        error: 'Supabase configuration missing' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's current token balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('token_balance')
      .eq('user_id', user_id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch user token balance' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const currentBalance = profile?.token_balance || 0;

    // Calculate cost based on task type and modifiers
    let baseCost = TASK_COSTS[task_type as keyof typeof TASK_COSTS] || 10;
    
    // Apply image/meme modifiers
    if (include_image) {
      baseCost += 15;
    }
    if (include_meme) {
      baseCost += 20;
    }

    // Apply platform multiplier
    const platformMultiplier = PLATFORM_MULTIPLIERS[platform_count as keyof typeof PLATFORM_MULTIPLIERS] || 1.0;
    const totalCost = Math.ceil(baseCost * platformMultiplier);

    // Check if user has sufficient tokens
    if (currentBalance < totalCost) {
      return new Response(JSON.stringify({ 
        error: 'Insufficient tokens',
        required: totalCost,
        available: currentBalance
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Deduct tokens from user's balance
    const newBalance = currentBalance - totalCost;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ token_balance: newBalance })
      .eq('user_id', user_id);

    if (updateError) {
      console.error('Error updating token balance:', updateError);
      return new Response(JSON.stringify({ 
        error: 'Failed to update token balance' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log the transaction
    const { error: transactionError } = await supabase
      .from('token_transactions')
      .insert({
        user_id: user_id,
        task_type: task_type,
        model_id: model_id,
        tokens_deducted: totalCost,
        tokens_added: 0,
        notes: `Task: ${task_type}, Platforms: ${platform_count}, Image: ${include_image}, Meme: ${include_meme}`
      });

    if (transactionError) {
      console.error('Error logging transaction:', transactionError);
      // Don't fail the request if logging fails
    }

    return new Response(JSON.stringify({
      success: true,
      tokens_deducted: totalCost,
      new_balance: newBalance,
      task_type: task_type,
      platform_count: platform_count
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ 
      error: `Server error: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}); 