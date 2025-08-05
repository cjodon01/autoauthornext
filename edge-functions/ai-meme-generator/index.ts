import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { description, style = 'meme' } = await req.json()

    if (!description) {
      return new Response(
        JSON.stringify({ error: 'Description is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // AI prompt to generate image prompt and text overlay
    const aiPrompt = `
You are an expert meme creator. Given a description, create:
1. An optimized image prompt for AI image generation
2. A suggested text overlay for the meme

User description: "${description}"
Style: ${style}

Respond in this exact JSON format:
{
  "imagePrompt": "detailed image prompt for AI image generation",
  "textOverlay": "suggested text for the meme overlay",
  "fontStyle": "impact|comic|bold|elegant",
  "textPosition": "top|bottom|center",
  "explanation": "brief explanation of the meme concept"
}

Make the image prompt detailed and specific for best AI image generation results.
Make the text overlay funny, relevant, and meme-worthy.
`

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert meme creator and AI image prompt engineer. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to generate meme concept' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openaiData = await openaiResponse.json()
    const aiResponse = openaiData.choices[0]?.message?.content

    if (!aiResponse) {
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse AI response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(aiResponse)
    } catch (e) {
      console.error('Failed to parse AI response:', aiResponse)
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate required fields
    if (!parsedResponse.imagePrompt || !parsedResponse.textOverlay) {
      return new Response(
        JSON.stringify({ error: 'AI response missing required fields' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return the generated meme concept
    return new Response(
      JSON.stringify({
        success: true,
        memeConcept: {
          imagePrompt: parsedResponse.imagePrompt,
          textOverlay: parsedResponse.textOverlay,
          fontStyle: parsedResponse.fontStyle || 'impact',
          textPosition: parsedResponse.textPosition || 'bottom',
          explanation: parsedResponse.explanation || '',
          originalDescription: description
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in AI meme generator:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 