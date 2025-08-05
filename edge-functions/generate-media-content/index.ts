// Deno Supabase Edge Function: generate-media-content.ts
//
// This function generates social media content using OpenAI only.
// 1. Uses OpenAI GPT-4 to generate content ideas and image descriptions
// 2. Uses OpenAI DALL-E to generate images
// 3. Uploads generated images to Supabase Storage
// 4. Stores generated content details in 'generated_media_posts' table
//
// Simplified to focus ONLY on 'image' and 'meme' content types using OpenAI only.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { Buffer } from 'node:buffer';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Define Zod schema for request body validation
const generateContentSchema = z.object({
  prompt: z.string().min(1),
  brand_id: z.string().uuid(),
  type: z.enum([
    'meme',
    'image'
  ]).default('image')
});

// Helper for consistent error responses
function sendErrorResponse(message, details, status) {
  console.error(`Error: ${message}`, details);
  return new Response(JSON.stringify({
    error: message,
    details: details
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: status
  });
}

Deno.serve(async (req) => {
  console.log('--- Edge Function Start: generate-media-content ---');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: req.headers.get('Authorization')
      }
    }
  });

  let prompt;
  let brand_id;
  let contentType;
  
  try {
    const body = await req.json();
    const validatedBody = generateContentSchema.parse(body);
    prompt = validatedBody.prompt;
    brand_id = validatedBody.brand_id;
    contentType = validatedBody.type;
  } catch (parseError) {
    return sendErrorResponse('Invalid request body', parseError.issues, 400);
  }

  // --- Fetch OpenAI API Key ---
  let openAIApiKey = null;
  
  // First try to get from database
  try {
    const { data: aiProviders, error: aiProvidersError } = await supabaseClient.from('ai_providers').select('provider_name, api_key');
    if (!aiProvidersError && aiProviders) {
      const openaiProvider = aiProviders.find(p => p.provider_name === 'openai');
      if (openaiProvider) {
        openAIApiKey = openaiProvider.api_key;
      }
    }
  } catch (err) {
    console.warn('Failed to retrieve OpenAI API key from database:', err.message);
  }
  
  // Fallback to environment variable if not found in database
  if (!openAIApiKey) {
    openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  }
  
  if (!openAIApiKey) {
    return sendErrorResponse('OpenAI API Key is missing from both database and environment variables.', null, 500);
  }
  
  console.log('OpenAI API Key status:', openAIApiKey ? 'Found' : 'Missing');

  // --- 1. Fetch Brand Profile ---
  let brandData;
  try {
    const { data: brand, error: brandError } = await supabaseClient.from('brands').select('*').eq('id', brand_id).single();
    if (brandError) throw brandError;
    brandData = brand;
  } catch (err) {
    return sendErrorResponse('Brand not found or database error.', err.message, 500);
  }

  // --- 2. Construct Context for OpenAI ---
  let context = `Brand Name: ${brandData.name}\nBrand Description: ${brandData.description || 'N/A'}\n`;
  if (brandData.mission_statement) context += `Brand Mission: ${brandData.mission_statement}\n`;
  if (brandData.industry) context += `Brand Industry: ${brandData.industry}\n`;
  if (brandData.site_url) context += `Brand Website: ${brandData.site_url}\n`;
  context += `\nUser Prompt: ${prompt}\nDesired Content Type: ${contentType}\n`;

  // --- 3. Token deduction skipped for now ---
  console.log('Token deduction step skipped');

  // --- 4. Call OpenAI GPT-4 for Content Idea Generation ---
  let llmPrompt = '';
  switch(contentType) {
    case 'meme':
      llmPrompt = `Based on the brand context, generate a creative and brand-appropriate meme idea relevant to "${prompt}".

Provide a JSON response with the following structure:
{
  "image_description": "A detailed description for DALL-E to generate the base image (focus on visuals only)",
  "overlay_text": "The exact text to overlay on the meme",
  "overlay_options": {
    "font_family": "Impact",
    "font_size": 60,
    "text_color": "white",
    "placement": "top",
    "text_shadow": true,
    "show_text_background": false
  }
}

Make the meme funny, relevant to the brand, and suitable for social media.`;
      break;
    case 'image':
      llmPrompt = `Based on the brand context, generate a detailed and vivid image generation prompt for a social media post relevant to "${prompt}". 

Provide a JSON response with:
{
  "image_description": "A detailed description for DALL-E to generate the image (focus on visual elements, style, and composition)"
}

Make it visually appealing and brand-appropriate.`;
      break;
  }

  let generatedIdea;
  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a creative content generator. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: `Context:\n${context}\n\nTask: ${llmPrompt}`
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${await openaiResponse.text()}`);
    }

    const openaiJson = await openaiResponse.json();
    const responseText = openaiJson.choices?.[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('OpenAI API response empty or invalid.');
    }

    // Try to parse the JSON response
    try {
      generatedIdea = JSON.parse(responseText);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedIdea = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from OpenAI response');
      }
    }

    if (!generatedIdea || Object.keys(generatedIdea).length === 0) {
      throw new Error('OpenAI API response empty or invalid.');
    }
  } catch (err) {
    return sendErrorResponse('Failed to generate content idea using OpenAI.', err.message, 500);
  }

  // --- 5. Generate Image using DALL-E ---
  let generatedMediaUrl = null;
  let finalResponseContent = generatedIdea;

  try {
    let dallePrompt;
    if (contentType === 'meme') {
      dallePrompt = generatedIdea.image_description;
    } else {
      dallePrompt = generatedIdea.image_description || prompt;
    }

    const dallePayload = {
      model: "dall-e-3",
      prompt: dallePrompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json"
    };

    const dalleResponse = await fetch(`https://api.openai.com/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify(dallePayload)
    });

    if (!dalleResponse.ok) {
      throw new Error(`OpenAI DALL-E API error: ${dalleResponse.status} ${await dalleResponse.text()}`);
    }

    const dalleJson = await dalleResponse.json();
    const imageBase64 = dalleJson.data?.[0]?.b64_json;
    
    if (!imageBase64) {
      throw new Error('DALL-E API response missing image data.');
    }

    // Upload the generated image to Supabase Storage
    const imageFileName = `${brand_id}/${contentType}_${Date.now()}.png`;
    const { error: uploadError } = await supabaseClient.storage.from('generated-images').upload(imageFileName, Buffer.from(imageBase64, 'base64'), {
      contentType: 'image/png',
      upsert: false
    });

    if (uploadError) {
      console.error('Error uploading image:', uploadError.message);
      throw new Error('Failed to upload generated image');
    }

    generatedMediaUrl = supabaseClient.storage.from('generated-images').getPublicUrl(imageFileName).data.publicUrl;

    finalResponseContent = {
      imageUrl: generatedMediaUrl,
      image_description: generatedIdea.image_description || dallePrompt,
      overlay_text: contentType === 'meme' ? generatedIdea?.overlay_text : null,
      overlay_options: contentType === 'meme' ? generatedIdea?.overlay_options : null
    };

  } catch (err) {
    console.error('Error in DALL-E generation:', err.message);
    finalResponseContent = {
      ...generatedIdea,
      error: `Image generation failed: ${err.message}.`
    };
  }

  // --- 6. Save Generated Content to Database ---
  try {
    const { error: insertError } = await supabaseClient.from('generated_media_posts').insert({
      brand_id: brand_id,
      prompt: prompt,
      content_type: contentType,
      generated_image_url: generatedMediaUrl,
      image_description: generatedIdea.image_description,
      overlay_text: contentType === 'meme' ? generatedIdea.overlay_text : null,
      overlay_options: contentType === 'meme' ? generatedIdea.overlay_options : null
    });
    
    if (insertError) throw insertError;
  } catch (err) {
    console.error('Error saving generated content to database:', err.message);
    finalResponseContent = {
      ...finalResponseContent,
      db_save_error: err.message
    };
  }

  return new Response(JSON.stringify({
    message: 'Media content generation process completed.',
    brand_id: brand_id,
    content_type: contentType,
    generated_content: finalResponseContent,
    sources_used: {
      brand_profile: brandData.name
    }
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 200
  });
});
