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
    const { brand, campaignData, campaign_id, model_id } = await req.json()

    // Validate required fields
    if (!campaign_id) {
      throw new Error('Missing required field: campaign_id')
    }
    
    if (!model_id) {
      throw new Error('Missing required field: model_id')
    }
    
    if (!brand?.name) {
      throw new Error('Missing required field: brand.name')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      throw new Error('Campaign not found')
    }

    // Get user details for token deduction
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('token_balance')
      .eq('user_id', campaign.user_id)
      .single()

    if (profileError) {
      throw new Error('User profile not found')
    }

    // Deduct tokens for blog generation
    const blogGenerationCost = 50 // Cost for generating a full blog post
    if (profile.token_balance < blogGenerationCost) {
      throw new Error('Insufficient token balance for blog generation')
    }

    // Update token balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ token_balance: profile.token_balance - blogGenerationCost })
      .eq('user_id', campaign.user_id)

    if (updateError) {
      throw new Error('Failed to update token balance')
    }

    // Log token transaction
    await supabase
      .from('token_transactions')
      .insert({
        user_id: campaign.user_id,
        amount: -blogGenerationCost,
        task_type: 'blog_generation',
        description: `Blog generation for campaign: ${campaign.campaign_name}`,
        campaign_id: campaign_id
      })

    // Generate blog content using AI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Create blog content using OpenAI
    const blogContent = await generateBlogContent(brand, campaignData, openaiApiKey)

    // Create a unique slug for the blog post
    const slug = createSlug(brand.name, campaign.campaign_name)

    // Store blog post in database
    const { data: blogPost, error: blogError } = await supabase
      .from('blog_posts')
      .insert({
        campaign_id: campaign_id,
        title: blogContent.title,
        content_html: blogContent.content,
        content_markdown: blogContent.content, // Store as both HTML and markdown for now
        slug: slug,
        brand_id: campaign.brand_id,
        user_id: campaign.user_id,
        status: 'published'
      })
      .select()
      .single()

    if (blogError) {
      throw new Error('Failed to save blog post')
    }

    // Generate embed URL
    const embedUrl = `${supabaseUrl}/blog/${slug}`

    return new Response(
      JSON.stringify({
        success: true,
        slug: slug,
        embed_url: embedUrl,
        blog_post: blogPost
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in generateFullBlogPost:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function generateBlogContent(brand: any, campaignData: any, apiKey: string) {
  const prompt = `
    Create a comprehensive blog post for ${brand.name}.
    
    Brand Details:
    - Name: ${brand.name}
    - Mission: ${brand.mission || 'Not specified'}
    - USP: ${brand.usp || 'Not specified'}
    - Tone: ${brand.tone || 'professional'}
    - Values: ${brand.values?.join(', ') || 'Not specified'}
    - Audience: ${brand.audience || 'General public'}
    
    Campaign Details:
    - Goal: ${campaignData.goal || 'Increase brand awareness'}
    - Strategy: ${campaignData.strategy || 'Educational content'}
    - Tone: ${campaignData.tone || 'neutral'}
    - Content Style: ${campaignData.contentStyle || 'educational'}
    - Target Audience: ${campaignData.audience || 'general'}
    
    Please create:
    1. An engaging title (max 60 characters)
    2. A comprehensive blog post (800-1200 words) that aligns with the brand's voice and campaign goals
    3. Include relevant headings, subheadings, and a call-to-action
    4. Make it SEO-friendly and engaging for the target audience
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
          content: 'You are a professional content writer specializing in brand-aligned blog content. Create engaging, SEO-friendly blog posts that match the brand voice and campaign objectives.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error('Failed to generate blog content')
  }

  const data = await response.json()
  const content = data.choices[0].message.content

  // Extract title and content
  const lines = content.split('\n')
  const title = lines[0].replace(/^#\s*/, '').trim()
  const blogContent = lines.slice(1).join('\n').trim()

  return {
    title: title,
    content: blogContent
  }
}

function createSlug(brandName: string, campaignName: string): string {
  const base = `${brandName}-${campaignName}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  
  const timestamp = Date.now()
  return `${base}-${timestamp}`
} 