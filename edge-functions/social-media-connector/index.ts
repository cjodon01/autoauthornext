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
    const { provider, user_token } = requestBody;

    // Validate required fields
    if (!provider) {
      return new Response(
        JSON.stringify({ error: 'Provider is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${provider} connection for user: ${user.id}`);

    if (provider === 'facebook') {
      if (!user_token) {
        return new Response(
          JSON.stringify({ error: 'User token required for Facebook' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Exchange short-lived token for long-lived token
      const fbAppId = Deno.env.get('FACEBOOK_APP_ID');
      const fbAppSecret = Deno.env.get('FACEBOOK_APP_SECRET');
      
      if (!fbAppId || !fbAppSecret) {
        return new Response(
          JSON.stringify({ error: 'Facebook configuration missing' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Exchange token
      const tokenResponse = await fetch(`https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${fbAppId}&client_secret=${fbAppSecret}&fb_exchange_token=${user_token}`);
      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error('Facebook token exchange failed:', tokenData);
        return new Response(
          JSON.stringify({ error: 'Failed to exchange Facebook token' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user's pages
      const pagesResponse = await fetch(`https://graph.facebook.com/me/accounts?access_token=${tokenData.access_token}`);
      const pagesData = await pagesResponse.json();

      if (!pagesResponse.ok) {
        console.error('Failed to fetch Facebook pages:', pagesData);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch Facebook pages' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if connection already exists
      const { data: existingConnection } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'facebook')
        .single();

      if (existingConnection) {
        // Update existing connection
        const { error: updateError } = await supabase
          .from('social_connections')
          .update({
            access_token: tokenData.access_token,
            refresh_token: tokenData.access_token, // Facebook doesn't have refresh tokens
            expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConnection.id);

        if (updateError) {
          console.error('Error updating Facebook connection:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update connection' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // Create new connection
        const { error: insertError } = await supabase
          .from('social_connections')
          .insert([{
            user_id: user.id,
            provider: 'facebook',
            access_token: tokenData.access_token,
            refresh_token: tokenData.access_token,
            expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
            is_active: true
          }]);

        if (insertError) {
          console.error('Error creating Facebook connection:', insertError);
          return new Response(
            JSON.stringify({ error: 'Failed to create connection' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Store pages in social_pages table
      if (pagesData.data && pagesData.data.length > 0) {
        for (const page of pagesData.data) {
          const { error: pageError } = await supabase
            .from('social_pages')
            .upsert([{
              user_id: user.id,
              provider: 'facebook',
              page_id: page.id,
              page_name: page.name,
              access_token: page.access_token,
              is_active: true
            }], { onConflict: 'user_id,provider,page_id' });

          if (pageError) {
            console.error('Error storing Facebook page:', pageError);
          }
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Facebook connected successfully',
          pages_count: pagesData.data?.length || 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      // For other platforms, return OAuth URL
      const oauthUrls = {
        twitter: `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${Deno.env.get('TWITTER_CLIENT_ID')}&redirect_uri=${encodeURIComponent(Deno.env.get('TWITTER_REDIRECT_URI') || '')}&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=${user.id}`,
        instagram: `https://api.instagram.com/oauth/authorize?client_id=${Deno.env.get('INSTAGRAM_CLIENT_ID')}&redirect_uri=${encodeURIComponent(Deno.env.get('INSTAGRAM_REDIRECT_URI') || '')}&scope=user_profile,user_media&response_type=code&state=${user.id}`,
        linkedin: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${Deno.env.get('LINKEDIN_CLIENT_ID')}&redirect_uri=${encodeURIComponent(Deno.env.get('LINKEDIN_REDIRECT_URI') || '')}&scope=r_liteprofile%20r_emailaddress%20w_member_social&state=${user.id}`
      };

      const oauthUrl = oauthUrls[provider as keyof typeof oauthUrls];
      
      if (!oauthUrl) {
        return new Response(
          JSON.stringify({ error: `Unsupported provider: ${provider}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          url: oauthUrl,
          message: `Redirecting to ${provider} OAuth`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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