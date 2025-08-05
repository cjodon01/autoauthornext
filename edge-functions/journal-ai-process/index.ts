import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Function to extract JSON from markdown code blocks
function extractJsonFromMarkdown(text: string): string {
  // Remove markdown code block markers
  let cleaned = text.trim();
  
  // Remove ```json and ``` markers
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  
  return cleaned.trim();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Parse request body
    const requestBody = await req.json();
    const { entry_id } = requestBody;

    // Validate required fields
    if (!entry_id) {
      return new Response(
        JSON.stringify({ error: 'Entry ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the journal entry
    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', entry_id)
      .single();

    if (entryError || !entry) {
      return new Response(
        JSON.stringify({ error: 'Journal entry not found', details: entryError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update processing status to processing
    await supabase
      .from('journal_entries')
      .update({ ai_processing_status: 'processing' })
      .eq('id', entry_id);

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      // Update processing status to failed
      await supabase
        .from('journal_entries')
        .update({ ai_processing_status: 'failed' })
        .eq('id', entry_id);

      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build prompt for AI processing
    const prompt = `
You are an expert content creator and social media strategist. Analyze the following journal entry and create three different pieces of content:

Journal Entry:
${entry.content}

Create the following content types:

1. Summary: A concise 2-3 sentence summary of the key points
2. Social Post: An engaging social media post (1-2 paragraphs) that captures the essence of the entry
3. Blog Post: A longer, more detailed blog post version (3-4 paragraphs) that expands on the themes

Return your response as a JSON object with these exact keys:
{
  "summary": "concise summary text",
  "social_post": "social media post content",
  "blog_post": "blog post content"
}

Make the content engaging, authentic, and true to the original entry's tone and message.
`.trim();

    // Call OpenAI API
    console.log(`Processing journal entry: ${entry_id}`);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content creator who analyzes journal entries and creates engaging content. Always respond with valid JSON.'
          },
          {
            role: 'user',
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

    // Parse the AI response - handle both pure JSON and markdown-wrapped JSON
    let parsedContent;
    try {
      let jsonToParse = aiContent;
      
      // Check if response is wrapped in markdown code blocks
      if (aiContent.includes('```')) {
        jsonToParse = extractJsonFromMarkdown(aiContent);
        console.log("Extracted JSON from markdown code blocks");
      }
      
      parsedContent = JSON.parse(jsonToParse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw AI response:', aiContent);
      
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