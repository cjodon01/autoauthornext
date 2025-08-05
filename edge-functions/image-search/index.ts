import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, platform = 'all', page = 1, per_page = 20 } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    // Search Pexels
    if (platform === 'all' || platform === 'pexels') {
      try {
        const pexelsResponse = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`,
          {
            headers: {
              'Authorization': Deno.env.get('PEXELS_API_KEY') || '',
            },
          }
        );
        
        if (pexelsResponse.ok) {
          const pexelsData = await pexelsResponse.json();
          results.push(...pexelsData.photos.map((photo: any) => ({
            id: `pexels_${photo.id}`,
            url: photo.src.medium,
            thumbnail: photo.src.small,
            large: photo.src.large,
            original: photo.src.original,
            photographer: photo.photographer,
            photographer_url: photo.photographer_url,
            platform: 'pexels',
            width: photo.width,
            height: photo.height,
            alt: photo.alt || query
          })));
        }
      } catch (error) {
        console.error('Pexels API error:', error);
      }
    }

    // Search Pixabay
    if (platform === 'all' || platform === 'pixabay') {
      try {
        const pixabayResponse = await fetch(
          `https://pixabay.com/api/?key=${Deno.env.get('PIXABAY_API_KEY')}&q=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}&image_type=photo`
        );
        
        if (pixabayResponse.ok) {
          const pixabayData = await pixabayResponse.json();
          results.push(...pixabayData.hits.map((hit: any) => ({
            id: `pixabay_${hit.id}`,
            url: hit.webformatURL,
            thumbnail: hit.previewURL,
            large: hit.largeImageURL,
            original: hit.fullHDURL,
            photographer: hit.user,
            photographer_url: `https://pixabay.com/users/${hit.user}-${hit.user_id}/`,
            platform: 'pixabay',
            width: hit.imageWidth,
            height: hit.imageHeight,
            alt: hit.tags || query
          })));
        }
      } catch (error) {
        console.error('Pixabay API error:', error);
      }
    }

    // Search Unsplash
    if (platform === 'all' || platform === 'unsplash') {
      try {
        const unsplashResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`,
          {
            headers: {
              'Authorization': `Client-ID ${Deno.env.get('UNSPLASH_ACCESS_KEY')}`,
            },
          }
        );
        
        if (unsplashResponse.ok) {
          const unsplashData = await unsplashResponse.json();
          results.push(...unsplashData.results.map((photo: any) => ({
            id: `unsplash_${photo.id}`,
            url: photo.urls.regular,
            thumbnail: photo.urls.thumb,
            large: photo.urls.full,
            original: photo.urls.raw,
            photographer: photo.user.name,
            photographer_url: photo.user.links.html,
            platform: 'unsplash',
            width: photo.width,
            height: photo.height,
            alt: photo.alt_description || query
          })));
        }
      } catch (error) {
        console.error('Unsplash API error:', error);
      }
    }

    // Shuffle results for better variety
    const shuffledResults = results.sort(() => Math.random() - 0.5);

    return new Response(
      JSON.stringify({
        success: true,
        images: shuffledResults,
        total: shuffledResults.length,
        query,
        platform
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Image search error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to search images' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 