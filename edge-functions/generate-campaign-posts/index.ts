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
    const { campaign_id } = await req.json()

    if (!campaign_id) {
      throw new Error('Missing required field: campaign_id')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        brands (*),
        social_pages (*),
        social_connections (*)
      `)
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      throw new Error('Campaign not found')
    }

    // Get brand details
    const brand = campaign.brands
    if (!brand) {
      throw new Error('Brand not found for campaign')
    }

    // Get target platforms and pages/connections
    const targetPlatforms = campaign.target_platforms || []
    const targetPageIds = campaign.target_page_ids || []
    const targetConnectionIds = campaign.target_connection_ids || []

    // Get pages and connections
    const { data: pages } = await supabase
      .from('social_pages')
      .select('*')
      .in('id', targetPageIds)

    const { data: connections } = await supabase
      .from('social_connections')
      .select('*')
      .in('id', targetConnectionIds)

    // Generate posts for each platform
    const generatedPosts = []
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    for (const platform of targetPlatforms) {
      if (platform === 'website') {
        continue // Website posts are handled separately
      }

      // Generate content for this platform
      const postContent = await generatePlatformPost(
        brand,
        campaign,
        platform,
        openaiApiKey
      )

      // Create pending post entry
      const { data: pendingPost, error: postError } = await supabase
        .from('pending_posts')
        .insert({
          campaign_id: campaign_id,
          platform: platform,
          content: postContent,
          status: 'pending',
          scheduled_for: campaign.next_run_at,
          user_id: campaign.user_id,
          brand_id: campaign.brand_id
        })
        .select()
        .single()

      if (postError) {
        console.error(`Error creating pending post for ${platform}:`, postError)
        continue
      }

      generatedPosts.push(pendingPost)
    }

    return new Response(
      JSON.stringify({
        success: true,
        posts_generated: generatedPosts.length,
        posts: generatedPosts
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in generate-campaign-posts:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function generatePlatformPost(brand: any, campaign: any, platform: string, apiKey: string) {
  const platformPrompts = {
    facebook: 'Create an engaging Facebook post that encourages community interaction and sharing.',
    twitter: 'Create a concise Twitter post with relevant hashtags and engagement elements.',
    instagram: 'Create an Instagram caption that's visually descriptive and includes relevant hashtags.',
    linkedin: 'Create a professional LinkedIn post that positions the brand as a thought leader.',
    reddit: 'Create a Reddit post that's authentic and adds value to the community discussion.'
  }

  const prompt = `
    Create a social media post for ${platform} for ${brand.name}.
    
    Brand Details:
    - Name: ${brand.name}
    - Mission: ${brand.mission || 'Not specified'}
    - USP: ${brand.usp || 'Not specified'}
    - Tone: ${brand.tone || 'professional'}
    - Values: ${brand.values?.join(', ') || 'Not specified'}
    - Audience: ${brand.audience || 'General public'}
    
    Campaign Details:
    - Goal: ${campaign.goal || 'Increase brand awareness'}
    - AI Intent: ${campaign.ai_intent || 'Educational content'}
    - Tone Preference: ${campaign.ai_tone_preference?.join(', ') || 'neutral'}
    - Content Style: ${campaign.ai_content_style_preference?.join(', ') || 'educational'}
    - Target Audience: ${campaign.target_audience_psychographics || 'general'}
    - Custom Prompt: ${campaign.ai_extra_metadata?.custom_prompt || ''}
    
    Platform: ${platform}
    Platform-specific requirements: ${platformPrompts[platform] || 'Create an engaging social media post.'}
    
    Please create:
    1. A compelling post that aligns with the brand voice and campaign goals
    2. Appropriate for the specific platform's format and audience
    3. Include relevant hashtags if appropriate for the platform
    4. Keep it engaging and actionable
  `

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional social media content creator. Create platform-specific posts that engage audiences and align with brand objectives.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to generate content for ${platform}`)
  }

  const data = await response.json()
  return data.choices[0].message.content.trim()
}