// Deno Supabase Edge Function: generate-media-content.ts
//
// This function acts as the orchestrator for generating social media content.
// 1. Calls Gemini to get content ideas, including image descriptions, meme overlay text, and overlay styling options.
// 2. Calls OpenAI DALL-E to generate the base image (without text).
// 3. Calls an external 'render-meme-image' Deno Edge Function (which uses Satori) to overlay text onto the base image.
// 4. Uploads the final overlaid image (or base image for non-memes) to Supabase Storage.
// 5. Stores generated content details and embeddings in 'generated_media_posts' table for reuse.
//
// Simplified to focus ONLY on 'image' and 'meme' content types.
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
const SIMILARITY_THRESHOLD = 0.1; // Cosine distance threshold for content reuse
// URL for the external render-meme-image Edge Function
// IMPORTANT: REPLACE THIS PLACEHOLDER WITH THE ACTUAL URL OF YOUR DEPLOYED render-meme-image function.
// e.g., 'https://your-project-ref.supabase.co/functions/v1/render-meme-image'
const RENDER_MEME_IMAGE_FUNCTION_URL = Deno.env.get('RENDER_MEME_IMAGE_FUNCTION_URL') || 'https://birlfjexwyrxhvibhcao.supabase.co/functions/v1/render-meme-image';
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
Deno.serve(async (req)=>{
  console.log('--- Edge Function Start: generate-media-content ---');
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  // Use SUPABASE_ANON_KEY for this function, as it's the public-facing endpoint
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
  // --- Fetch AI Provider API Keys ---
  let googleGeminiApiKey = null;
  let openAIApiKey = null;
  let googleSearchApiKey = null;
  try {
    const { data: aiProviders, error: aiProvidersError } = await supabaseClient.from('ai_providers').select('provider_name, api_key');
    if (aiProvidersError) throw aiProvidersError;
    aiProviders.forEach((p)=>{
      if (p.provider_name === 'google') googleGeminiApiKey = p.api_key;
      else if (p.provider_name === 'openai') openAIApiKey = p.api_key;
      else if (p.provider_name === 'google_search') googleSearchApiKey = p.api_key;
    });
    if (!googleGeminiApiKey) return sendErrorResponse('Google Gemini (embedding) API Key is missing.', null, 500);
  } catch (err) {
    return sendErrorResponse('Failed to retrieve AI provider keys from database.', err.message, 500);
  }
  // --- 1. Fetch Brand Profile ---
  let brandData;
  try {
    const { data: brand, error: brandError } = await supabaseClient.from('brands').select('*').eq('id', brand_id).single();
    if (brandError) throw brandError;
    brandData = brand;
  } catch (err) {
    return sendErrorResponse('Brand not found or database error.', err.message, 500);
  }
  // --- 2. Embed the User Prompt for Search and Generation Context ---
  let promptEmbedding = [];
  try {
    const embedRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${googleGeminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: {
          parts: [
            {
              text: prompt
            }
          ]
        }
      })
    });
    if (!embedRes.ok) throw new Error(`Embedding API error: ${embedRes.status} ${await embedRes.text()}`);
    const embedJson = await embedRes.json();
    if (!embedJson.embedding?.values) throw new Error('Invalid embedding response structure.');
    promptEmbedding = embedJson.embedding.values;
  } catch (err) {
    return sendErrorResponse('Failed to embed user prompt for search.', err.message, 500);
  }
  // --- 3. Search for Existing Generated Content for Reuse ---
  let reusedContent = null;
  try {
    const { data: existingContent, error: searchError } = await supabaseClient.from('generated_media_posts').select('id, content_type, generated_image_url, image_description, overlay_text, overlay_options, embedding') // Include overlay_options
    .eq('brand_id', brand_id).eq('content_type', contentType).order('embedding', {
      ascending: true,
      foreignTable: null,
      distance: '<=>',
      reference: promptEmbedding
    }).limit(1);
    if (searchError) console.warn('Error searching for existing content:', searchError.message);
    else if (existingContent && existingContent.length > 0 && existingContent[0].embedding) {
      const mostSimilar = existingContent[0];
      const { data: distanceData, error: distanceError } = await supabaseClient.rpc('get_embedding_distance', {
        embedding1: promptEmbedding,
        embedding2: mostSimilar.embedding
      });
      if (!distanceError && distanceData !== null && distanceData <= SIMILARITY_THRESHOLD) {
        reusedContent = mostSimilar;
        console.log(`Reused existing content with ID ${reusedContent.id}. Cosine distance: ${distanceData}`);
      }
    }
  } catch (reuseErr) {
    console.error('Error during content reuse search:', reuseErr.message);
  }
  if (reusedContent) {
    return new Response(JSON.stringify({
      message: 'Reused existing media content.',
      brand_id: brand_id,
      content_type: contentType,
      generated_content: {
        ...reusedContent,
        reused: true
      },
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
  }
  // --- Continue with generation if no content was reused ---
  // --- 4. Vector Search for Brand Assets ---
  let relevantBrandAssets = [];
  try {
    const { data, error } = await supabaseClient.from('brand_assets').select('content, source, asset_type').eq('brand_id', brand_id).order('embedding', {
      ascending: true,
      foreignTable: null,
      distance: '<=>',
      reference: promptEmbedding
    }).limit(5);
    if (error) console.warn('Error searching brand assets:', error.message);
    relevantBrandAssets = data || [];
  } catch (err) {
    console.warn('Error fetching brand assets for context:', err.message);
  }
  // --- 5. Vector Search for Trending Assets ---
  let relevantTrendingAssets = [];
  try {
    const trendingQuery = supabaseClient.from('trending_assets').select('topic, snippet, source, industry').order('embedding', {
      ascending: true,
      foreignTable: null,
      distance: '<=>',
      reference: promptEmbedding
    }).eq('industry', brandData.industry || 'general');
    const { data, error } = await trendingQuery.limit(5);
    if (error) console.warn('Error searching trending assets:', error.message);
    relevantTrendingAssets = data || [];
  } catch (err) {
    console.warn('Error fetching trending assets for context:', err.message);
  }
  // --- 6. Construct Context for LLM ---
  let context = `Brand Name: ${brandData.name}\nBrand Description: ${brandData.description || 'N/A'}\n`;
  if (brandData.mission_statement) context += `Brand Mission: ${brandData.mission_statement}\n`;
  if (brandData.industry) context += `Brand Industry: ${brandData.industry}\n`;
  if (brandData.site_url) context += `Brand Website: ${brandData.site_url}\n`;
  if (relevantBrandAssets.length > 0) {
    context += "\n--- Relevant Brand Assets ---\n";
    relevantBrandAssets.forEach((asset, index)=>{
      let contentString = asset.content;
      try {
        if (asset.asset_type === 'website_content' && typeof asset.content === 'string') {
          const parsed = JSON.parse(asset.content);
          contentString = parsed.mainText || parsed.title || asset.content;
        }
      } catch (e) {}
      context += `Asset ${index + 1} (${asset.asset_type}, Source: ${asset.source}): ${contentString.substring(0, 300)}...\n`;
    });
  }
  if (relevantTrendingAssets.length > 0) {
    context += "\n--- Relevant Trending Topics ---\n";
    relevantTrendingAssets.forEach((trend, index)=>{
      context += `Trend ${index + 1} (Source: ${trend.source}, Industry: ${trend.industry}): ${trend.topic} - ${trend.snippet.substring(0, 200)}...\n`;
    });
  }
  context += `\nUser Prompt: ${prompt}\nDesired Content Type: ${contentType}\n`;

  // --- 6.5. Deduct tokens before generating content ---
  try {
    // Extract user_id from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
      
      if (!userError && user) {
        const deductResponse = await fetch(`${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || 'http://localhost:54321'}/.netlify/functions/deductTokens`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            task_type: contentType === 'meme' ? 'meme' : 'image',
            model_id: null,
            include_image: true,
            include_meme: contentType === 'meme',
            platform_count: 1
          })
        });

        if (!deductResponse.ok) {
          return sendErrorResponse('Insufficient tokens or server error', null, 402);
        }
      }
    }
  } catch (error) {
    console.error('Error deducting tokens:', error);
    return sendErrorResponse('Failed to process token deduction', error.message, 500);
  }

  // --- 7. Call LLM (Gemini) for Content Idea Generation ---
  let llmPrompt = '';
  let llmSchema = {};
  switch(contentType){
    case 'meme':
      llmPrompt = `Based on the brand context and trending topics, generate a creative and brand-appropriate meme idea relevant to "${prompt}".
      Provide a very concise image generation description for an AI image generator focusing ONLY on visuals.
      Also, provide the exact overlay text.
      Crucially, provide an 'overlay_options' JSON object for the text overlay. This object should contain:
      - 'font_family': A string, choose ONE from the following "Inter Regular", "Inter Bold", "Inter Black", "Inter Medium".
      - 'font_size': A number (e.g., 60, 70, 80) suitable for a 1024x1024 image.
      - 'text_color': A string (e.g., "white", "black", "yellow", "blue").
      - 'placement': A string, choose ONE from "top", "center", "bottom".
      - 'text_shadow': A boolean (true or false).
      - 'show_text_background': A boolean (true or false).
      Return a JSON object with 'image_description' (string), 'overlay_text' (string), and 'overlay_options' (object).`;
      llmSchema = {
        type: "OBJECT",
        properties: {
          image_description: {
            type: "STRING"
          },
          overlay_text: {
            type: "STRING"
          },
          overlay_options: {
            type: "OBJECT",
            properties: {
              font_family: {
                type: "STRING"
              },
              font_size: {
                type: "NUMBER"
              },
              text_color: {
                type: "STRING"
              },
              placement: {
                type: "STRING"
              },
              text_shadow: {
                type: "BOOLEAN"
              },
              show_text_background: {
                type: "BOOLEAN"
              }
            },
            required: [
              "font_family",
              "font_size",
              "text_color",
              "placement",
              "text_shadow",
              "show_text_background"
            ]
          }
        },
        required: [
          "image_description",
          "overlay_text",
          "overlay_options"
        ]
      };
      break;
    case 'image':
      llmPrompt = `Based on the brand context and trending topics, generate a detailed and vivid image generation prompt for a social media post relevant to "${prompt}". Focus purely on visual elements, style, and composition for an AI image generator. Return JSON with 'image_description' (string).`;
      llmSchema = {
        type: "OBJECT",
        properties: {
          image_description: {
            type: "STRING"
          }
        },
        required: [
          "image_description"
        ]
      };
      break;
  }
  let generatedIdea;
  try {
    const geminiPayload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Context:\n${context}\n\nTask: ${llmPrompt}`
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: llmSchema
      }
    };
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleGeminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiPayload)
    });
    if (!geminiResponse.ok) throw new Error(`Gemini API error: ${geminiResponse.status} ${await geminiResponse.text()}`);
    const geminiJson = await geminiResponse.json();
    generatedIdea = JSON.parse(geminiJson.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
    if (!generatedIdea || Object.keys(generatedIdea).length === 0) throw new Error('Gemini API response empty or invalid.');
  } catch (err) {
    return sendErrorResponse('Failed to generate content idea using LLM.', err.message, 500);
  }
  // --- 8. Generate Media (OpenAI DALL-E) and/or Content Embedding ---
  let generatedMediaUrl = null;
  let finalResponseContent = generatedIdea;
  let generatedContentEmbedding = [];
  if (openAIApiKey) {
    let dallePrompt;
    if (contentType === 'meme') {
      // DALL-E generates the base image without text overlay.
      // The overlay_text and overlay_options are passed back for external processing.
      dallePrompt = generatedIdea.image_description;
    } else {
      dallePrompt = generatedIdea.image_description || prompt;
    }
    try {
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
      if (!dalleResponse.ok) throw new Error(`OpenAI DALL-E API error: ${dalleResponse.status} ${await dalleResponse.text()}`);
      const dalleJson = await dalleResponse.json();
      const imageBase64 = dalleJson.data?.[0]?.b64_json;
      if (!imageBase64) throw new Error('DALL-E API response missing image data.');
      // --- Call render-meme-image for text overlay if content type is meme ---
      if (contentType === 'meme' && generatedIdea?.overlay_text && generatedIdea?.overlay_options) {
        console.log('Calling render-meme-image function for text overlay...');
        try {
          const overlayPayload = {
            image: `data:image/png;base64,${imageBase64}`,
            overlay_text: generatedIdea.overlay_text,
            options: generatedIdea.overlay_options
          };
          const overlayResponse = await fetch(RENDER_MEME_IMAGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(overlayPayload)
          });
          if (!overlayResponse.ok) throw new Error(`Overlay function error: ${overlayResponse.status} ${await overlayResponse.text()}`);
          const overlayJson = await overlayResponse.json();
          if (overlayJson.success && overlayJson.url) {
            generatedMediaUrl = overlayJson.url; // Update to the overlaid image URL (SVG)
            console.log('Text overlay successful. Final image URL:', generatedMediaUrl);
          } else {
            console.warn('Overlay function returned success: false or missing URL. Falling back to base image.', overlayJson);
            // Fallback: If overlay fails, upload the base image and use its URL
            const baseImageFileName = `${brand_id}/base_image_${Date.now()}_fallback.png`;
            const { error: uploadErrorBase } = await supabaseClient.storage.from('generated-images').upload(baseImageFileName, Buffer.from(imageBase64, 'base64'), {
              contentType: 'image/png',
              upsert: false
            });
            if (uploadErrorBase) {
              console.error('Error uploading fallback base image:', uploadErrorBase.message);
            }
            generatedMediaUrl = supabaseClient.storage.from('generated-images').getPublicUrl(baseImageFileName).data.publicUrl;
          }
        } catch (overlayErr) {
          console.error('Error calling overlay function:', overlayErr.message);
          // Fallback: If overlay call fails, upload the base image and use its URL
          const baseImageFileName = `${brand_id}/base_image_${Date.now()}_fallback.png`;
          const { error: uploadErrorBase } = await supabaseClient.storage.from('generated-images').upload(baseImageFileName, Buffer.from(imageBase64, 'base64'), {
            contentType: 'image/png',
            upsert: false
          });
          if (uploadErrorBase) {
            console.error('Error uploading fallback base image:', uploadErrorBase.message);
          }
          generatedMediaUrl = supabaseClient.storage.from('generated-images').getPublicUrl(baseImageFileName).data.publicUrl;
        }
      } else {
        // If not a meme, or meme but missing text/options, just upload the base image
        const baseImageFileName = `${brand_id}/image_${Date.now()}.png`; // Use generic image name
        const { error: uploadErrorBase } = await supabaseClient.storage.from('generated-images').upload(baseImageFileName, Buffer.from(imageBase64, 'base64'), {
          contentType: 'image/png',
          upsert: false
        });
        if (uploadErrorBase) {
          console.error('Error uploading base image:', uploadErrorBase.message);
        }
        generatedMediaUrl = supabaseClient.storage.from('generated-images').getPublicUrl(baseImageFileName).data.publicUrl;
      }
      // Prepare content for embedding
      const embeddingText = contentType === 'meme' ? `${generatedIdea.image_description} ${generatedIdea.overlay_text}` : generatedIdea.image_description;
      // Generate embedding for the new content
      const embedRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${googleGeminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: {
            parts: [
              {
                text: embeddingText
              }
            ]
          }
        })
      });
      if (embedRes.ok) {
        const embedJson = await embedRes.json();
        if (embedJson.embedding?.values) generatedContentEmbedding = embedJson.embedding.values;
        else console.warn('Invalid embedding response structure for generated content.');
      } else {
        console.error(`Embedding API error for generated content: ${embedRes.status} ${await embedRes.text()}`);
      }
      finalResponseContent = {
        image_url: generatedMediaUrl,
        image_description: generatedIdea.image_description || dallePrompt,
        overlay_text: contentType === 'meme' ? generatedIdea?.overlay_text : null,
        overlay_options: contentType === 'meme' ? generatedIdea?.overlay_options : null
      };
    } catch (err) {
      console.error('Error in DALL-E generation/orchestration:', err.message);
      finalResponseContent = {
        ...generatedIdea,
        error: `Image generation or orchestration failed: ${err.message}.`
      };
    }
  } else {
    finalResponseContent = {
      ...generatedIdea,
      warning: 'OpenAI API Key is missing. Image generation skipped.'
    };
  }
  // --- 9. Save Generated Content to Database ---
  try {
    const { error: insertError } = await supabaseClient.from('generated_media_posts').insert({
      brand_id: brand_id,
      prompt: prompt,
      content_type: contentType,
      generated_image_url: generatedMediaUrl,
      image_description: generatedIdea.image_description,
      overlay_text: contentType === 'meme' ? generatedIdea.overlay_text : null,
      overlay_options: contentType === 'meme' ? generatedIdea.overlay_options : null,
      embedding: generatedContentEmbedding.length > 0 ? generatedContentEmbedding : null
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
      brand_profile: brandData.name,
      relevant_brand_assets_count: relevantBrandAssets.length,
      relevant_trending_assets_count: relevantTrendingAssets.length
    }
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 200
  });
});
