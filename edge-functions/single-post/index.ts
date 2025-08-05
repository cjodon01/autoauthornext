// index.ts in your Supabase Edge Function (single-post)
// Updated Deno standard library version to a more recent, compatible version
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
console.log("Initializing Supabase client...");
// Supabase client initialized with service role key for database access
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
// Define CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
async function refreshTwitterToken(refreshToken, supabaseClient, socialConnectionId) {
  console.log("Attempting to refresh Twitter token...");
  const tokenUrl = "https://api.twitter.com/2/oauth2/token";
  const clientId = Deno.env.get("TWITTER_CLIENT_ID");
  const clientSecret = Deno.env.get("TWITTER_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    console.error("Twitter credentials (CLIENT_ID or CLIENT_SECRET) not configured.");
    return null;
  }
  const basicAuth = btoa(`${clientId}:${clientSecret}`);
  const bodyParams = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });
  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basicAuth}`
      },
      body: bodyParams
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Twitter token refresh failed:", errorData);
      return null;
    }
    const data = await response.json();
    console.log("Twitter token refreshed successfully.");
    // Update the database with the new access token and (if provided) new refresh token
    const updatePayload = {
      oauth_user_token: data.access_token,
      token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString()
    };
    if (data.refresh_token) {
      updatePayload.oauth_refresh_token = data.refresh_token;
    }
    const { error: updateError } = await supabaseClient.from("social_connections").update(updatePayload).eq("id", socialConnectionId);
    if (updateError) {
      console.error(`Failed to update DB with new Twitter token for connection ${socialConnectionId}:`, updateError);
    } else {
      console.log(`DB updated with new Twitter token for connection ${socialConnectionId}`);
    }
    return data.access_token;
  } catch (error) {
    console.error(`Error during Twitter token refresh for connection ${socialConnectionId}:`, error);
    return null;
  }
}
// Helper function to fetch AI Model and its associated Provider Configuration
async function getAiModelConfig(supabaseClient, modelName = "gpt-4.1-nano", modelType = "chat_completion") {
  console.log(`Fetching AI model config for name: ${modelName || "DEFAULT"}, type: ${modelType}`);
  let query = supabaseClient.from("ai_models").select(`
            *,
            provider_id (
                id,
                provider_name,
                api_key,
                api_base_url
            )
        `).eq("model_name", modelName);
  if (modelName) {
    query = query.eq("model_name", modelName);
  } else {
    // Fallback: If no modelName is provided, try to get a sensible default
    console.warn("No specific AI model_name provided. Attempting to fetch a default chat_completion model (e.g., gpt-4o-mini).");
    // Prioritize a common default like gpt-4o-mini if it exists
    query = query.eq("model_name", "gpt-4o-mini").order("created_at", {
      ascending: false
    }); // Add an order to ensure consistent default
  }
  const { data, error } = await query.limit(1).single();
  if (error) {
    console.error(`Error fetching AI model and provider config:`, error.message);
    return null;
  }
  if (!data || !data.provider_id) {
    console.warn(`No active AI model found for criteria, or associated provider is missing/inactive.`);
    return null;
  }
  return data;
}
// buildPrompt function (remains largely the same)
function buildPrompt(prompt) {
  console.log("Building AI prompt for single-post generation...");
  return `
You are a premium AI social media copywriter.

Prompt: "${prompt}"

Create 3 variations of a post suitable for social media platforms (Facebook, Instagram, Twitter, LinkedIn). Each should be punchy, engaging, and unique.

Return each variation as plain text, no JSON formatting, no tags. No more than 280 characters in each variation. Do not separate them into a numerical list.

Separate each variation with ===SEPARATOR===.
`.trim();
}
serve(async (req)=>{
  console.log(`Received request: ${req.method} ${req.url}`);
  // 1. Handle CORS Preflight (OPTIONS) requests FIRST
  if (req.method === "OPTIONS") {
    console.log("Handling CORS OPTIONS preflight request.");
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }
  // 2. Enforce POST method for actual requests
  if (req.method !== "POST") {
    console.error("Method Not Allowed: Expected POST request. Received:", req.method);
    return new Response(JSON.stringify({
      error: `Method Not Allowed. Expected POST, received ${req.method}`
    }), {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json"
      }
    });
  }
  try {
    const body = await req.json();
    console.log("Parsed request body:", body);
    // Destructure all expected fields from the body, including ai_model_name and journey_data
    let { user_id, prompt, action, selected_post, platforms, page_id, social_connection_id, ai_model_name, journey_data, media_url } = body;
    // --- Basic Input Validation ---
    if (!user_id) {
      console.error("Missing user_id in request body");
      return new Response(JSON.stringify({
        error: "Missing user_id"
      }), {
        status: 400,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json"
        }
      });
    }
    // --- Important: Re-add Server-Side Session/Authentication Check for Production ---
    /*
    // It's highly recommended to re-enable this for robust security.
    // This uses the SUPABASE_ANON_KEY initially to get the session from the request's Authorization header.
    const supabaseAuthClient = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_ANON_KEY') as string
    );
    const { data: { session }, error: sessionError } = await supabaseAuthClient.auth.getSession();

    if (sessionError) {
      console.error(`[Edge Function] Supabase getSession error: ${sessionError.message}`);
      return new Response(JSON.stringify({
        error: `Authentication failed: ${sessionError.message}`
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    if (!session || session.user.id !== user_id) {
      console.warn('[Edge Function] No active Supabase session found or user_id mismatch. Returning 401 Unauthorized.');
      return new Response(JSON.stringify({
        error: 'Unauthorized: No active user session or user ID mismatch.'
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    console.log(`[Edge Function] Session valid for user ID: ${session.user.id}`);
    */ 
    
    // --- Action: 'generate_journey_map' ---
    if (action === 'generate_journey_map') {
      console.log('Generating journey map with data:', journey_data)

      if (!journey_data) {
        console.error("Missing journey_data in request body for generate_journey_map action");
        return new Response(JSON.stringify({
          error: "Missing journey_data for journey map generation"
        }), {
          status: 400,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json"
          }
        });
      }

      // Get OpenAI API key from environment
      const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
      if (!openaiApiKey) {
        console.error('OPENAI_API_KEY not found in environment variables');
        return new Response(JSON.stringify({
          error: 'OpenAI API key not configured'
        }), {
          status: 500,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json"
          }
        });
      }

      // Fetch brand information
      let brandContext = ''
      if (journey_data.brandId) {
        const { data: brand, error: brandError } = await supabase
          .from('brands')
          .select('*')
          .eq('id', journey_data.brandId)
          .single()

        if (!brandError && brand) {
          brandContext = `
Brand: ${brand.name}${brand.industry ? ` (${brand.industry})` : ''}
${brand.description ? `Description: ${brand.description}` : ''}
${brand.mission_statement ? `Mission: ${brand.mission_statement}` : ''}
${brand.target_audience ? `Target Audience: ${brand.target_audience}` : ''}
${brand.brand_voice ? `Brand Voice: ${brand.brand_voice}` : ''}
${brand.core_values ? `Core Values: ${brand.core_values.join(', ')}` : ''}
`.trim()
        }
      }

      // Build journey map generation prompt
      const journeyPrompt = `You are an expert narrative designer and content strategist.
The user is planning a "${journey_data.name}" journey campaign, intending to post daily updates for ${journey_data.durationDays} days.

${brandContext ? `BRAND CONTEXT:\n${brandContext}\n` : ''}

JOURNEY DETAILS:
- Journey Goal: "${journey_data.goal}"
- Journey Description: "${journey_data.description}"
${journey_data.keyMilestones ? `- Key Milestones/Themes: "${journey_data.keyMilestones}"` : ''}
${journey_data.targetAudience ? `- Target Audience: "${journey_data.targetAudience}"` : ''}
${journey_data.desiredTone ? `- Desired Brand Voice: "${journey_data.desiredTone}"` : ''}

Your task is to create a ${journey_data.durationDays}-day journey map. This map should be a chronological list of compelling, distinct, and logical daily topics or themes that build a cohesive narrative over the specified duration. Each topic should be suitable for a social media post.

The topics should reflect progress, challenges, lessons learned, insights, and engagement opportunities for the audience.

CRITICAL: Return ONLY a JSON array of strings, where each string is a single, concise topic for one day. Do NOT include any other text, formatting, or explanations outside the JSON array.

Example format: ["Day 1 Topic", "Day 2 Topic", "Day 3 Topic", ..., "Day N Topic"]

Ensure you generate exactly ${journey_data.durationDays} topics.`

      console.log('Journey prompt:', journeyPrompt)

      // Call OpenAI API
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
              content: 'You are a professional content strategist and narrative designer. You create structured, engaging content plans for social media campaigns.'
            },
            {
              role: 'user',
              content: journeyPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenAI API error:', errorText)
        return new Response(JSON.stringify({
          error: `OpenAI API error: ${response.status}`,
          details: errorText
        }), {
          status: response.status,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json"
          }
        });
      }

      const data = await response.json()
      const aiResponse = data.choices?.[0]?.message?.content?.trim()

      if (!aiResponse) {
        return new Response(JSON.stringify({
          error: 'No response from AI model'
        }), {
          status: 500,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json"
          }
        });
      }

      console.log('AI Response:', aiResponse)

      // Extract and validate JSON array
      const extractJsonArray = (text) => {
        const firstBracket = text.indexOf('[')
        const lastBracket = text.lastIndexOf(']')
        
        if (firstBracket === -1 || lastBracket === -1 || firstBracket >= lastBracket) {
          throw new Error('No valid JSON array found in response')
        }
        
        return text.slice(firstBracket, lastBracket + 1)
      }

      try {
        const cleanJsonString = extractJsonArray(aiResponse)
        const journeyMap = JSON.parse(cleanJsonString)
        
        if (!Array.isArray(journeyMap)) {
          throw new Error('Response is not an array')
        }

        if (journeyMap.length !== journey_data.durationDays) {
          console.warn(`Expected ${journey_data.durationDays} topics, got ${journeyMap.length}`)
        }

        console.log('Successfully generated journey map:', journeyMap)

        return new Response(
          JSON.stringify({
            success: true,
            journey_map: journeyMap
          }),
          {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      } catch (parseError) {
        console.error('Failed to parse journey map JSON:', parseError)
        console.error('Raw AI response:', aiResponse)
        return new Response(JSON.stringify({
          error: `Failed to parse journey map: ${parseError.message}`,
          raw_response: aiResponse
        }), {
          status: 500,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json"
          }
        });
      }
    }
    
    // --- Action: 'generate' ---
    if (action === "generate") {
      console.log("Action: generate");
      if (!prompt) {
        console.error("Missing prompt in request body");
        return new Response(JSON.stringify({
          error: "Missing prompt"
        }), {
          status: 400,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json"
          }
        });
      }

      // Deduct tokens before generating content
      try {
        const deductResponse = await fetch(`${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || 'http://localhost:54321'}/.netlify/functions/deductTokens`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id,
            task_type: 'post_now_text',
            model_id: ai_model_name,
            include_image: false,
            include_meme: false,
            platform_count: platforms?.length || 1
          })
        });

        if (!deductResponse.ok) {
          return new Response(JSON.stringify({
            error: 'Insufficient tokens or server error'
          }), {
            status: 402,
            headers: {
              ...CORS_HEADERS,
              "Content-Type": "application/json"
            }
          });
        }
      } catch (error) {
        console.error('Error deducting tokens:', error);
        return new Response(JSON.stringify({
          error: 'Failed to process token deduction'
        }), {
          status: 500,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json"
          }
        });
      }
      // --- FOR TESTING ONLY: Hardcode modelName here if you need to override the request body ---
      // Uncomment the line below and replace 'gemini-1.5-flash' with the model_name you want to test
      // ai_model_name = 'gemini-1.5-flash';
      // -----------------------------------------------------------------------------------------
      // --- Dynamically fetch AI model and provider configuration by model name ---
      const aiModelConfig = await getAiModelConfig(supabase, ai_model_name, "chat_completion");
      if (!aiModelConfig || !aiModelConfig.provider_id) {
        console.error("Failed to retrieve AI model or its provider configuration from database.");
        return new Response(JSON.stringify({
          error: "Server configuration error: AI model or its provider not found/inactive."
        }), {
          status: 500,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json"
          }
        });
      }
      const providerInfo = aiModelConfig.provider_id;
      console.log(`Using AI Model: ${providerInfo.provider_name} - ${aiModelConfig.model_name}`);
      let apiUrl;
      let headers;
      let requestBody;
      let aiText = "";
      switch(providerInfo.provider_name.toLowerCase()){
        case "openai":
          apiUrl = `${providerInfo.api_base_url}/chat/completions`;
          headers = {
            "Authorization": `Bearer ${providerInfo.api_key}`,
            "Content-Type": "application/json"
          };
          requestBody = {
            model: aiModelConfig.api_model_id,
            messages: [
              {
                role: "user",
                content: buildPrompt(prompt)
              }
            ],
            temperature: aiModelConfig.temperature_default || 0.7,
            max_tokens: aiModelConfig.max_tokens_default || 600
          };
          break;
        case "google":
          // Google Gemini API uses model name directly in the URL path and key as query param
          // Note: The model name in the URL path should typically be "gemini-pro", "gemini-flash" etc.
          // The database stores "gemini-1.5-flash" so we extract the base model name for the URL.
          const googleModelPath = ai_model_name;
          apiUrl = `${providerInfo.api_base_url}/${aiModelConfig.api_model_id}:generateContent?key=${providerInfo.api_key}`;
          headers = {
            "Content-Type": "application/json"
          };
          requestBody = {
            contents: [
              {
                parts: [
                  {
                    text: buildPrompt(prompt)
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: aiModelConfig.temperature_default || 0.7,
              maxOutputTokens: aiModelConfig.max_tokens_default || 600
            }
          };
          break;
        case "anthropic":
          apiUrl = `${providerInfo.api_base_url}/messages`;
          headers = {
            "x-api-key": providerInfo.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
          };
          requestBody = {
            model: aiModelConfig.api_model_id,
            messages: [
              {
                role: "user",
                content: buildPrompt(prompt)
              }
            ],
            temperature: aiModelConfig.temperature_default || 0.7,
            max_tokens: aiModelConfig.max_tokens_default || 600
          };
          break;
        default:
          console.error(`Unsupported AI provider: ${providerInfo.provider_name}`);
          return new Response(JSON.stringify({
            error: `Unsupported AI provider: ${providerInfo.provider_name}`
          }), {
            status: 400,
            headers: {
              ...CORS_HEADERS,
              "Content-Type": "application/json"
            }
          });
      }
      console.log(`Sending request to ${providerInfo.provider_name} API...`);
      const aiResponse = await fetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody)
      });
      if (!aiResponse.ok) {
        const errBody = await aiResponse.text();
        console.error(`AI API error from ${providerInfo.provider_name} (${aiModelConfig.model_name}):`, aiResponse.status, errBody);
        return new Response(JSON.stringify({
          error: `Failed to generate content from AI (${providerInfo.provider_name}): ${aiResponse.status} - ${errBody}`
        }), {
          status: aiResponse.status,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json"
          }
        });
      }
      const aiData = await aiResponse.json();
      console.log("AI response received:", aiData);
      // Parse response based on provider
      switch(providerInfo.provider_name.toLowerCase()){
        case "openai":
          aiText = aiData.choices?.[0]?.message?.content || "";
          break;
        case "google":
          aiText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          break;
        case "anthropic":
          aiText = aiData.content?.[0]?.text || "";
          break;
        default:
          aiText = ""; // Should not happen due to prior switch, but for safety
      }
      console.log("🔍 AI Provider:", providerInfo.provider_name);
      console.log("📄 Raw aiText (pre-split):", aiText);
      const posts = aiText.split("===SEPARATOR===").map((text)=>text.trim()).filter(Boolean);
      console.log("Generated posts:", posts);
      return new Response(JSON.stringify({
        posts
      }), {
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json"
        }
      });
    }
    // --- Action: 'post' ---
    if (action === "post") {
      console.log("Action: post");
      if (!selected_post || !platforms || platforms.length === 0) {
        console.error("Missing selected_post or platforms in request body");
        return new Response(JSON.stringify({
          error: "Missing selected post or platforms"
        }), {
          status: 400,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json"
          }
        });
      }
      const postResults = [];
      for (const platform of platforms){
        console.log(`Attempting to post to platform: ${platform}`);
        let accessToken = "";
        let platformApiEndpoint = "";
        let socialProvider = platform;
        try {
          if ([
            "facebook",
            "instagram"
          ].includes(platform)) {
            if (!page_id) {
              const errorMsg = `No page_id provided for ${platform}`;
              console.error(errorMsg);
              postResults.push({
                platform,
                success: false,
                error: errorMsg
              });
              continue;
            }
            const { data: pageRow, error: pageError } = await supabase.from("social_pages").select("page_id, page_access_token, provider").eq("id", page_id).single();
            if (pageError || !pageRow) {
              const errorMsg = `Failed to fetch page ${page_id} for ${platform}: ${pageError?.message || "not found"}`;
              console.error(errorMsg);
              postResults.push({
                platform,
                success: false,
                error: errorMsg
              });
              continue;
            }
            accessToken = pageRow.page_access_token;
            
            // Check if media_url is provided to determine if this is an image post
            if (media_url) {
              // For image posts, use the /photos endpoint
              platformApiEndpoint = `https://graph.facebook.com/${pageRow.page_id}/photos`;
              console.log(`Posting image to Facebook/Instagram page ID ${pageRow.page_id}`);
              
              const fbPostResponse = await fetch(platformApiEndpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  caption: selected_post, // Use caption for image posts
                  url: media_url, // The image URL
                  access_token: accessToken
                })
              });
              
              const fbPostResult = await fbPostResponse.json();
              if (!fbPostResponse.ok) {
                const errorMsg = `Facebook/Instagram image post error (${fbPostResponse.status}): ${JSON.stringify(fbPostResult)}`;
                console.error(errorMsg);
                postResults.push({
                  platform,
                  success: false,
                  error: errorMsg
                });
              } else {
                console.log(`Facebook/Instagram image post successful:`, fbPostResult);
                postResults.push({
                  platform,
                  success: true,
                  data: fbPostResult
                });
              }
            } else {
              // For text-only posts, use the /feed endpoint as before
              platformApiEndpoint = `https://graph.facebook.com/${pageRow.page_id}/feed`;
              console.log(`Posting text to Facebook/Instagram page ID ${pageRow.page_id}`);
              
              const fbPostResponse = await fetch(platformApiEndpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  message: selected_post,
                  access_token: accessToken
                })
              });
              
              const fbPostResult = await fbPostResponse.json();
              if (!fbPostResponse.ok) {
                const errorMsg = `Facebook/Instagram text post error (${fbPostResponse.status}): ${JSON.stringify(fbPostResult)}`;
                console.error(errorMsg);
                postResults.push({
                  platform,
                  success: false,
                  error: errorMsg
                });
              } else {
                console.log(`Facebook/Instagram text post successful:`, fbPostResult);
                postResults.push({
                  platform,
                  success: true,
                  data: fbPostResult
                });
              }
            }
          } else {
            if (!social_connection_id) {
              const errorMsg = `No social_connection_id provided for ${platform}`;
              console.error(errorMsg);
              postResults.push({
                platform,
                success: false,
                error: errorMsg
              });
              continue;
            }
            const { data: connRow, error: connError } = await supabase.from("social_connections").select("oauth_user_token, oauth_refresh_token, token_expires_at, provider, id") // SELECT token_expires_at and oauth_refresh_token
            .eq("id", social_connection_id).single();
            if (connError || !connRow) {
              const errorMsg = `Failed to fetch social_connections row id=${social_connection_id} for ${platform}: ${connError?.message || "not found"}`;
              console.error(errorMsg);
              postResults.push({
                platform,
                success: false,
                error: errorMsg
              });
              continue;
            }
            accessToken = connRow.oauth_user_token;
            socialProvider = connRow.provider;
            if (!accessToken) {
              const errorMsg = `Access token missing for ${socialProvider} connection ${social_connection_id}`;
              console.error(errorMsg);
              postResults.push({
                platform,
                success: false,
                error: errorMsg
              });
              continue;
            }
            // --- Twitter Token Refresh Logic ---
            if (socialProvider === "twitter") {
              const tokenExpiresAt = connRow.token_expires_at ? new Date(connRow.token_expires_at) : null;
              const now = new Date();
              const refreshThresholdMinutes = 10; // Refresh if token expires in 10 minutes or less
              if (!tokenExpiresAt || tokenExpiresAt < new Date(now.getTime() + refreshThresholdMinutes * 60 * 1000)) {
                console.log(`Twitter token for connection ${social_connection_id} is expired or near expiration. Attempting refresh.`);
                if (connRow.oauth_refresh_token) {
                  const newAccessToken = await refreshTwitterToken(connRow.oauth_refresh_token, supabase, social_connection_id);
                  if (newAccessToken) {
                    accessToken = newAccessToken; // Update accessToken for the current post attempt
                    console.log(`Using newly refreshed Twitter access token.`);
                  } else {
                    const errorMsg = `Failed to refresh Twitter token for connection ${social_connection_id}. Posting will likely fail.`;
                    console.error(errorMsg);
                    postResults.push({
                      platform: "twitter",
                      success: false,
                      error: errorMsg
                    });
                    continue; // Skip posting for this platform if token refresh failed
                  }
                } else {
                  const errorMsg = `No refresh token available for Twitter connection ${social_connection_id}. User needs to re-authenticate.`;
                  console.error(errorMsg);
                  postResults.push({
                    platform: "twitter",
                    success: false,
                    error: errorMsg
                  });
                  continue; // Skip posting if no refresh token
                }
              } else {
                console.log(`Twitter access token for connection ${social_connection_id} is valid. Expires at: ${tokenExpiresAt.toISOString()}`);
              }
              
              // Proceed with Twitter post using the (potentially refreshed) accessToken
              if (media_url) {
                // For Twitter with media, we need to use a different approach
                // First, we need to upload the media, then create the tweet with the media ID
                console.log(`Twitter image posting is not yet implemented. Falling back to text-only post.`);
                // For now, just post the text without the image
                platformApiEndpoint = `https://api.twitter.com/2/tweets`;
                console.log(`Posting to Twitter as user ${connRow.id}`);
                const twitterPostResponse = await fetch(platformApiEndpoint, {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    text: selected_post
                  })
                });
                const twitterPostResult = await twitterPostResponse.json();
                if (!twitterPostResponse.ok) {
                  const errorMsg = `Twitter API error (${twitterPostResponse.status}): ${JSON.stringify(twitterPostResult)}`;
                  console.error(errorMsg);
                  postResults.push({
                    platform: "twitter",
                    success: false,
                    error: errorMsg
                  });
                } else {
                  console.log(`Twitter post successful:`, twitterPostResult);
                  postResults.push({
                    platform: "twitter",
                    success: true,
                    data: twitterPostResult
                  });
                }
              } else {
                // Text-only Twitter post
                platformApiEndpoint = `https://api.twitter.com/2/tweets`;
                console.log(`Posting to Twitter as user ${connRow.id}`);
                const twitterPostResponse = await fetch(platformApiEndpoint, {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    text: selected_post
                  })
                });
                const twitterPostResult = await twitterPostResponse.json();
                if (!twitterPostResponse.ok) {
                  const errorMsg = `Twitter API error (${twitterPostResponse.status}): ${JSON.stringify(twitterPostResult)}`;
                  console.error(errorMsg);
                  postResults.push({
                    platform: "twitter",
                    success: false,
                    error: errorMsg
                  });
                } else {
                  console.log(`Twitter post successful:`, twitterPostResult);
                  postResults.push({
                    platform: "twitter",
                    success: true,
                    data: twitterPostResult
                  });
                }
              }
            } else if (socialProvider === "linkedin") {
              const meResp = await fetch("https://api.linkedin.com/v2/userinfo", {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${accessToken}`,
                  "X-Restli-Protocol-Version": "2.0.0",
                  "LinkedIn-Version": "202306"
                }
              });
              if (!meResp.ok) {
                const meErr = await meResp.json();
                const errorMsg = `LinkedIn /userinfo error (${meResp.status}): ${JSON.stringify(meErr)}. Ensure 'r_liteprofile' permission.`;
                console.error(errorMsg);
                postResults.push({
                  platform: "linkedin",
                  success: false,
                  error: errorMsg
                });
                continue;
              }
              const meData = await meResp.json();
              const linkedInMemberId = meData.sub;
              if (!linkedInMemberId) {
                const errorMsg = `LinkedIn member ID missing in /userinfo response: ${JSON.stringify(meData)}`;
                console.error(errorMsg);
                postResults.push({
                  platform: "linkedin",
                  success: false,
                  error: errorMsg
                });
                continue;
              }
              const authorUrn = `urn:li:person:${linkedInMemberId}`;
              platformApiEndpoint = "https://api.linkedin.com/v2/ugcPosts";
              console.log(`Posting to LinkedIn as ${authorUrn}`);
              
              // Check if media_url is provided
              if (media_url) {
                console.log(`LinkedIn image posting is not yet implemented. Falling back to text-only post.`);
                // For now, just post the text without the image
                const linkedInBody = {
                  author: authorUrn,
                  lifecycleState: "PUBLISHED",
                  specificContent: {
                    "com.linkedin.ugc.ShareContent": {
                      shareCommentary: {
                        text: selected_post
                      },
                      shareMediaCategory: "NONE"
                    }
                  },
                  visibility: {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                  }
                };
                
                const linkedInPostResponse = await fetch(platformApiEndpoint, {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    "X-Restli-Protocol-Version": "2.0.0",
                    "LinkedIn-Version": "202306"
                  },
                  body: JSON.stringify(linkedInBody)
                });
                
                const linkedInPostResult = await linkedInPostResponse.json();
                if (!linkedInPostResponse.ok) {
                  const errorMsg = `LinkedIn API error (${linkedInPostResponse.status}): ${JSON.stringify(linkedInPostResult)}`;
                  console.error(errorMsg);
                  postResults.push({
                    platform: "linkedin",
                    success: false,
                    error: errorMsg
                  });
                } else {
                  console.log(`LinkedIn post successful:`, linkedInPostResult);
                  postResults.push({
                    platform: "linkedin",
                    success: true,
                    data: linkedInPostResult
                  });
                }
              } else {
                // Text-only LinkedIn post
                const linkedInBody = {
                  author: authorUrn,
                  lifecycleState: "PUBLISHED",
                  specificContent: {
                    "com.linkedin.ugc.ShareContent": {
                      shareCommentary: {
                        text: selected_post
                      },
                      shareMediaCategory: "NONE"
                    }
                  },
                  visibility: {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                  }
                };
                
                const linkedInPostResponse = await fetch(platformApiEndpoint, {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    "X-Restli-Protocol-Version": "2.0.0",
                    "LinkedIn-Version": "202306"
                  },
                  body: JSON.stringify(linkedInBody)
                });
                
                const linkedInPostResult = await linkedInPostResponse.json();
                if (!linkedInPostResponse.ok) {
                  const errorMsg = `LinkedIn API error (${linkedInPostResponse.status}): ${JSON.stringify(linkedInPostResult)}`;
                  console.error(errorMsg);
                  postResults.push({
                    platform: "linkedin",
                    success: false,
                    error: errorMsg
                  });
                } else {
                  console.log(`LinkedIn post successful:`, linkedInPostResult);
                  postResults.push({
                    platform: "linkedin",
                    success: true,
                    data: linkedInPostResult
                  });
                }
              }
            } else {
              const warningMsg = `Posting to ${platform} is not yet implemented on the server-side.`;
              console.warn(warningMsg);
              postResults.push({
                platform,
                success: false,
                error: warningMsg
              });
            }
          }
        } catch (platformPostError) {
          const errorMsg = `Unhandled error during posting to ${platform}: ${platformPostError.message}`;
          console.error(errorMsg, platformPostError.stack);
          postResults.push({
            platform,
            success: false,
            error: errorMsg
          });
        }
      } // End of for...of platforms loop
      const overallSuccess = postResults.some((result)=>result.success);
      const overallMessage = overallSuccess ? "Post(s) processed." : "No posts were successful.";
      return new Response(JSON.stringify({
        success: overallSuccess,
        message: overallMessage,
        results: postResults
      }), {
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json"
        }
      });
    }
    // --- Handle Invalid Action ---
    console.error("Invalid action received:", action);
    return new Response(JSON.stringify({
      error: "Invalid action"
    }), {
      status: 400,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    // --- Catch All Other Errors ---
    console.error("Server error:", err);
    return new Response(JSON.stringify({
      error: `Server error: ${err.message}`
    }), {
      status: 500,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json"
      }
    });
  }
});
console.log("Server started...");