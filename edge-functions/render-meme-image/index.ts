import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TextOverlay {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  strokeColor?: string;
  strokeWidth?: number;
}

interface MemeRequest {
  imageUrl: string;
  overlays: TextOverlay[];
  width?: number;
  height?: number;
  format?: 'png' | 'jpg' | 'webp';
  quality?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageUrl, overlays, width = 800, height = 600, format = 'png', quality = 90 }: MemeRequest = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!overlays || overlays.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one text overlay is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For now, we'll use a simple approach with HTML5 Canvas
    // In production, you might want to use a more robust image processing library
    
    // Create a simple HTML template for rendering
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 0; }
            .meme-container {
              position: relative;
              width: ${width}px;
              height: ${height}px;
              background: #000;
            }
            .meme-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .text-overlay {
              position: absolute;
              color: white;
              font-family: Impact, Arial, sans-serif;
              text-align: center;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
              word-wrap: break-word;
              max-width: 90%;
            }
          </style>
        </head>
        <body>
          <div class="meme-container">
            <img src="${imageUrl}" class="meme-image" alt="Meme base" />
            ${overlays.map((overlay, index) => `
              <div class="text-overlay" style="
                left: ${overlay.x}px;
                top: ${overlay.y}px;
                font-size: ${overlay.fontSize}px;
                color: ${overlay.color};
                font-family: ${overlay.fontFamily};
                text-shadow: ${overlay.strokeWidth || 2}px ${overlay.strokeWidth || 2}px ${overlay.strokeWidth || 4}px ${overlay.strokeColor || 'rgba(0,0,0,0.8)'};
              ">
                ${overlay.text}
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

    // For now, return the HTML template
    // In a real implementation, you would use a headless browser or image processing library
    // to render this to an actual image file
    
    // Mock response with a placeholder image URL
    const mockImageUrl = `https://via.placeholder.com/${width}x${height}/f59e0b/ffffff?text=Meme+Generated`;

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: mockImageUrl,
        html: htmlTemplate,
        width,
        height,
        format,
        overlays: overlays.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Meme rendering error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to render meme' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
