import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { entry_id, user_id, ai_model_name = 'gpt-4o-mini' } = await req.json();

    if (!entry_id || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: entry_id and user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the journal entry
    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', entry_id)
      .eq('user_id', user_id)
      .single();

    if (entryError || !entry) {
      return new Response(
        JSON.stringify({ error: 'Journal entry not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!entry.content_text) {
      return new Response(
        JSON.stringify({ error: 'Journal entry has no content to process' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update processing status
    await supabase
      .from('journal_entries')
      .update({ ai_processing_status: 'processing' })
      .eq('id', entry_id);

    // Generate AI content using OpenAI
    const prompt = `You are an expert content creator and social media strategist. 

Based on this journal entry, create three different pieces of content:

1. A concise summary (2-3 sentences) that captures the key insights
2. A social media post (optimized for engagement, include relevant hashtags)
3. A blog post excerpt (more detailed, professional tone)

Journal Entry Content:
${entry.content_text}

Please respond with a JSON object in this exact format:
{
  "summary": "Brief summary here",
  "social_post": "Social media post content here",
  "blog_post": "Blog post excerpt here"
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ai_model_name,
        messages: [
          {
            role: "system",
            content: "You are a professional content creator. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      
      // Update processing status to failed
      await supabase
        .from('journal_entries')
        .update({ ai_processing_status: 'failed' })
        .eq('id', entry_id);

      return new Response(
        JSON.stringify({ error: 'Failed to generate AI content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    const aiContent = result.choices[0]?.message?.content;

    if (!aiContent) {
      // Update processing status to failed
      await supabase
        .from('journal_entries')
        .update({ ai_processing_status: 'failed' })
        .eq('id', entry_id);

      return new Response(
        JSON.stringify({ error: 'No AI content generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the AI response
    let parsedContent;
    try {
      parsedContent = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Update processing status to failed
      await supabase
        .from('journal_entries')
        .update({ ai_processing_status: 'failed' })
        .eq('id', entry_id);

      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the journal entry with AI-generated content
    const { error: updateError } = await supabase
      .from('journal_entries')
      .update({
        ai_summary: parsedContent.summary || null,
        ai_social_post: parsedContent.social_post || null,
        ai_blog_post: parsedContent.blog_post || null,
        ai_processing_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', entry_id);

    if (updateError) {
      console.error('Error updating journal entry:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save AI content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'AI content generated successfully',
        data: {
          summary: parsedContent.summary,
          social_post: parsedContent.social_post,
          blog_post: parsedContent.blog_post
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in journal-ai-process:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 