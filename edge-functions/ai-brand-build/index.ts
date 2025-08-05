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
    const { brand_name, brand_url, brand_summary, brand_type = 'individual' } = requestBody;

    // Validate required fields
    if (!brand_name || !brand_summary) {
      return new Response(
        JSON.stringify({ error: 'Brand name and summary are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build prompt for OpenAI
    const prompt = `
You are an expert brand strategist and marketing consultant. Your task is to create a comprehensive brand profile based on the following information:

Brand Name: ${brand_name}
${brand_url ? `Brand Website: ${brand_url}` : ''}
Brand Type: ${brand_type} (${brand_type === 'individual' ? 'Personal brand or creator' : 'Company or organization'})

Brand Summary (provided by user):
${brand_summary}

Based on this information, create a complete brand profile with the following elements:

1. Brand Description: A concise overview of what the brand does and its unique value proposition (2-3 sentences)
2. Mission Statement: The brand's purpose and goals (1-2 sentences)
3. USP Statement: What makes this brand unique in its market (1-2 sentences)
4. Brand Persona Description: If this brand were a person, what would their personality be like? (2-3 sentences)
5. Core Values: 3-5 single words or short phrases that represent the brand's fundamental beliefs
6. Target Audience: Description of the ideal customer or audience (1-2 sentences)
7. Brand Keywords to Include: 5-8 keywords that should be emphasized in content
8. Brand Keywords to Exclude: 3-5 keywords or topics to avoid
9. Brand Voice: Choose one: Professional, Friendly, Authoritative, Casual, Inspirational, Humorous, Educational, Empathetic, Bold, or Sophisticated
10. Industry: Best matching industry category

Return your response as a JSON object with these exact keys:
{
  "description": string,
  "mission_statement": string,
  "usp_statement": string,
  "brand_persona_description": string,
  "core_values": string[],
  "target_audience": string,
  "brand_keywords_include": string[],
  "brand_keywords_exclude": string[],
  "brand_voice": string,
  "industry": string
}

Ensure all text is concise, impactful, and aligns with the brand type and summary provided. Do not include any explanations or additional text outside the JSON object.
`.trim();

    // Call OpenAI API
    console.log("Calling OpenAI API to generate brand profile...");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert brand strategist who creates comprehensive brand profiles based on minimal information. You always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${response.status}`, details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
      return new Response(
        JSON.stringify({ error: 'No response from AI model' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response - handle both pure JSON and markdown-wrapped JSON
    try {
      let jsonToParse = aiResponse;
      
      // Check if response is wrapped in markdown code blocks
      if (aiResponse.includes('```')) {
        jsonToParse = extractJsonFromMarkdown(aiResponse);
        console.log("Extracted JSON from markdown code blocks");
      }
      
      const brandProfile = JSON.parse(jsonToParse);
      console.log("Successfully generated brand profile");
      
      return new Response(
        JSON.stringify(brandProfile),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Raw AI response:", aiResponse);
      
      return new Response(
        JSON.stringify({ 
          error: `Failed to parse brand profile: ${parseError.message}`,
          raw_response: aiResponse
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 