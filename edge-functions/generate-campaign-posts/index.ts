import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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
    const { campaign_id } = requestBody;

    // Validate required fields
    if (!campaign_id) {
      return new Response(
        JSON.stringify({ error: 'Campaign ID is required' }),
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

    // Fetch the campaign data with all related information
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        brands:brand_id (*),
        social_pages:page_id (*),
        social_connections:social_id (*)
      `)
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ error: 'Campaign not found', details: campaignError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing campaign: ${campaign.campaign_name} (ID: ${campaign_id})`);

    // Get AI model configuration
    const { data: aiModel, error: aiModelError } = await supabase
      .from('ai_models')
      .select(`
        *,
        provider:provider_id (*)
      `)
      .eq('id', campaign.ai_model_for_general_campaign)
      .single();

    if (aiModelError || !aiModel) {
      return new Response(
        JSON.stringify({ error: 'AI model not found', details: aiModelError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine the platforms to generate content for
    let targetPlatforms: string[] = [];
    
    // First check the new target_platforms array
    if (campaign.target_platforms && campaign.target_platforms.length > 0) {
      targetPlatforms = campaign.target_platforms;
    } 
    // Then check the legacy platforms field
    else if (campaign.platforms && campaign.platforms.length > 0) {
      targetPlatforms = campaign.platforms;
    }
    // Fallback to determine platform from other fields
    else if (campaign.page_id && campaign.social_pages) {
      targetPlatforms.push(campaign.social_pages.provider.toLowerCase());
    } else if (campaign.social_id && campaign.social_connections) {
      targetPlatforms.push(campaign.social_connections.provider.toLowerCase());
    } else {
      targetPlatforms.push('website'); // Default fallback
    }

    console.log(`Generating posts for platforms: ${targetPlatforms.join(', ')}`);

    // Fetch all relevant social pages and connections
    let relevantPages = [];
    let relevantConnections = [];

    // If we have target_page_ids, fetch those pages
    if (campaign.target_page_ids && campaign.target_page_ids.length > 0) {
      const { data: pages, error: pagesError } = await supabase
        .from('social_pages')
        .select('*')
        .in('id', campaign.target_page_ids);
        
      if (!pagesError) {
        relevantPages = pages || [];
      } else {
        console.error('Error fetching target pages:', pagesError);
      }
    } 
    // Otherwise, if we have a single page_id, fetch that page
    else if (campaign.page_id) {
      const { data: page, error: pageError } = await supabase
        .from('social_pages')
        .select('*')
        .eq('id', campaign.page_id)
        .single();
        
      if (!pageError && page) {
        relevantPages = [page];
      } else {
        console.error('Error fetching page:', pageError);
      }
    }

    // If we have target_connection_ids, fetch those connections
    if (campaign.target_connection_ids && campaign.target_connection_ids.length > 0) {
      const { data: connections, error: connectionsError } = await supabase
        .from('social_connections')
        .select('*')
        .in('id', campaign.target_connection_ids);
        
      if (!connectionsError) {
        relevantConnections = connections || [];
      } else {
        console.error('Error fetching target connections:', connectionsError);
      }
    } 
    // Otherwise, if we have a single social_id, fetch that connection
    else if (campaign.social_id) {
      const { data: connection, error: connectionError } = await supabase
        .from('social_connections')
        .select('*')
        .eq('id', campaign.social_id)
        .single();
        
      if (!connectionError && connection) {
        relevantConnections = [connection];
      } else {
        console.error('Error fetching connection:', connectionError);
      }
    }

    console.log(`Found ${relevantPages.length} relevant pages and ${relevantConnections.length} relevant connections`);

    // Deduct tokens before generating campaign posts
    try {
      const deductResponse = await fetch(`${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || 'http://localhost:54321'}/.netlify/functions/deductTokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: campaign.user_id,
          task_type: 'general_campaign_post',
          model_id: aiModel.api_model_id,
          include_image: false,
          include_meme: false,
          platform_count: targetPlatforms.length
        })
      });

      if (!deductResponse.ok) {
        return new Response(
          JSON.stringify({ error: 'Insufficient tokens or server error' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error('Error deducting tokens:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to process token deduction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate content for each platform
    const generatedPosts = [];
    
    for (const platform of targetPlatforms) {
      try {
        // Skip website platform - handled separately
        if (platform.toLowerCase() === 'website') {
          console.log('Skipping website platform - handled by Netlify function');
          continue;
        }
        
        // Build prompt for this platform
        const prompt = buildPromptForPlatform(campaign, platform);
        
        // Call AI model to generate content
        const content = await generateContent(aiModel, prompt);
        
        // For page-based platforms (Facebook, Instagram)
        if (['facebook', 'instagram'].includes(platform.toLowerCase())) {
          // Find pages for this platform
          const platformPages = relevantPages.filter(page => 
            page.provider?.toLowerCase() === platform.toLowerCase()
          );
          
          if (platformPages.length > 0) {
            for (const page of platformPages) {
              // Store the generated post for each page
              const postData = {
                campaign_id: campaign_id,
                social_connection_id: page.connection_id,
                page_id: page.id,
                post_content: content,
                post_date: calculateNextPostTime(campaign),
                approved: true,
                platform: platform.toLowerCase()
              };
              
              const { data: post, error: postError } = await supabase
                .from('posts')
                .insert(postData)
                .select()
                .single();
                
              if (postError) {
                console.error(`Error storing post for ${platform} page ${page.page_name}:`, postError);
                generatedPosts.push({
                  platform,
                  page_name: page.page_name,
                  success: false,
                  error: postError.message
                });
              } else {
                generatedPosts.push({
                  platform,
                  page_name: page.page_name,
                  success: true,
                  post_id: post.id
                });
              }
            }
          } else {
            console.warn(`No pages found for platform ${platform}`);
          }
        } 
        // For connection-based platforms (Twitter, LinkedIn, Reddit)
        else {
          // Find connections for this platform
          const platformConnections = relevantConnections.filter(conn => 
            conn.provider?.toLowerCase() === platform.toLowerCase()
          );
          
          if (platformConnections.length > 0) {
            for (const connection of platformConnections) {
              // Store the generated post for each connection
              const postData = {
                campaign_id: campaign_id,
                social_connection_id: connection.id,
                post_content: content,
                post_date: calculateNextPostTime(campaign),
                approved: true,
                platform: platform.toLowerCase()
              };
              
              const { data: post, error: postError } = await supabase
                .from('posts')
                .insert(postData)
                .select()
                .single();
                
              if (postError) {
                console.error(`Error storing post for ${platform} connection:`, postError);
                generatedPosts.push({
                  platform,
                  success: false,
                  error: postError.message
                });
              } else {
                generatedPosts.push({
                  platform,
                  success: true,
                  post_id: post.id
                });
              }
            }
          } else {
            console.warn(`No connections found for platform ${platform}`);
          }
        }
      } catch (error) {
        console.error(`Error generating post for ${platform}:`, error);
        generatedPosts.push({
          platform,
          success: false,
          error: error.message
        });
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: generatedPosts.some(p => p.success), 
        message: 'Campaign posts generated',
        campaign_id: campaign_id,
        posts: generatedPosts
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Server error:", error);
    
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to build platform-specific prompts
function buildPromptForPlatform(campaign, platform) {
  const brand = campaign.brands || {};
  const metadata = campaign.ai_extra_metadata || {};
  
  // Base prompt components
  const brandContext = `
Brand: ${brand.name || 'Unknown Brand'}
Industry: ${brand.industry || 'General'}
Description: ${brand.description || 'No description provided'}
Voice: ${brand.brand_voice || 'Professional'}
Target Audience: ${brand.target_audience || 'General audience'}
  `.trim();
  
  const campaignContext = `
Campaign Goal: ${campaign.goal || 'Not specified'}
Content Strategy: ${campaign.ai_intent || 'Manual'}
Tone Preferences: ${campaign.ai_tone_preference?.join(', ') || 'Not specified'}
Content Style: ${campaign.ai_content_style_preference?.join(', ') || 'Not specified'}
Target Audience: ${campaign.target_audience_psychographics || brand.target_audience || 'General audience'}
CTA: ${campaign.cta_action ? `${campaign.cta_action} - ${campaign.cta_link || ''}` : 'None'}
  `.trim();
  
  // Platform-specific instructions
  let platformInstructions = '';
  
  switch (platform.toLowerCase()) {
    case 'twitter':
      platformInstructions = `
Create a Twitter post (max 280 characters) that is engaging and shareable.
Use hashtags sparingly (1-2 max) and only if they add value.
Make it conversational and include a clear call to action.
      `.trim();
      break;
      
    case 'facebook':
      platformInstructions = `
Create a Facebook post that encourages engagement.
Keep it relatively short (2-4 sentences) but more detailed than Twitter.
Ask questions when appropriate to encourage comments.
Include emojis if they fit the brand voice.
      `.trim();
      break;
      
    case 'linkedin':
      platformInstructions = `
Create a professional LinkedIn post that demonstrates thought leadership.
Focus on industry insights, professional development, or business value.
Keep it concise but informative (3-5 sentences).
Use a professional tone while maintaining the brand voice.
      `.trim();
      break;
      
    case 'instagram':
      platformInstructions = `
Create an Instagram caption that is visually descriptive and engaging.
Include relevant hashtags (3-5) at the end of the post.
Focus on storytelling and emotional connection.
Keep it concise but impactful.
      `.trim();
      break;
      
    case 'reddit':
      platformInstructions = `
Create a Reddit post that feels authentic and conversational.
Avoid overly promotional language that would feel like spam.
Focus on providing value, asking questions, or sharing insights.
Keep it genuine and community-oriented.
      `.trim();
      break;
      
    default:
      platformInstructions = `
Create a social media post appropriate for general platforms.
Keep it engaging and aligned with the brand voice.
Include a clear call to action when appropriate.
      `.trim();
  }
  
  // Custom instructions from campaign
  const customInstructions = metadata.custom_prompt || '';
  
  // Combine all components into final prompt
  return `
You are an expert social media content creator for ${brand.name || 'a brand'}.

BRAND CONTEXT:
${brandContext}

CAMPAIGN CONTEXT:
${campaignContext}

PLATFORM INSTRUCTIONS (${platform.toUpperCase()}):
${platformInstructions}

${customInstructions ? `ADDITIONAL INSTRUCTIONS:\n${customInstructions}` : ''}

Create a single, high-quality post for ${platform}. Return ONLY the post content, no explanations or formatting.
  `.trim();
}

// Helper function to call AI model and generate content
async function generateContent(aiModel, prompt) {
  const provider = aiModel.provider;
  
  // This is a simplified implementation - in production, you'd handle different AI providers
  // For this example, we'll assume OpenAI
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: aiModel.api_model_id,
        messages: [
          {
            role: 'system',
            content: 'You are an expert social media content creator. Create engaging, platform-appropriate content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: aiModel.temperature_default || 0.7,
        max_tokens: aiModel.max_tokens_default || 500
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI API error: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || '';
    
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

// Helper function to calculate the next post time based on campaign settings
function calculateNextPostTime(campaign) {
  // Use the campaign's timezone or default to UTC
  const userTimezone = campaign.timezone || "UTC";
  
  // Get current time in user's timezone
  const now = new Date();
  const userNow = new Date(now.toLocaleString("en-US", { timeZone: userTimezone }));
  
  // Start with today's date in user's timezone
  let postDate = new Date(userNow);
  
  // If we have a cron expression, extract the time
  if (campaign.schedule_cron) {
    const cronParts = campaign.schedule_cron.split(' ');
    if (cronParts.length >= 2) {
      const minute = parseInt(cronParts[0]);
      const hour = parseInt(cronParts[1]);
      
      if (!isNaN(hour) && !isNaN(minute)) {
        // Set the time in user's timezone
        postDate.setHours(hour, minute, 0, 0);
      }
    }
  }
  
  // Ensure the date is in the future
  if (postDate <= userNow) {
    // If in the past, set to tomorrow at the same time
    postDate.setDate(postDate.getDate() + 1);
  }
  
  return postDate.toISOString();
}