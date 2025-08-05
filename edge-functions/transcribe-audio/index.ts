import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the request body
    const requestBody = await req.json()
    const { audioUrl, audioData } = requestBody

    // Validate input - need either audioUrl or audioData
    if (!audioUrl && !audioData) {
      return new Response(
        JSON.stringify({ error: 'Either audioUrl or audioData is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get ElevenLabs API key from environment
    const elevenLabsApiKey = Deno.env.get("ELEVEN_LABS_API_KEY")
    
    if (!elevenLabsApiKey) {
      console.error('ELEVEN_LABS_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Making request to ElevenLabs transcription API...')

    // Create FormData for the request
    const formData = new FormData()

    if (audioUrl) {
      // For URL-based audio, we need to fetch it first and convert to file
      console.log('Fetching audio from URL:', audioUrl)
      
      const audioResponse = await fetch(audioUrl)
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio from URL: ${audioResponse.status}`)
      }
      
      const audioBlob = await audioResponse.blob()
      formData.append("file", audioBlob, "audio.wav")
      
    } else if (audioData) {
      // Handle base64 audio data
      console.log('Processing base64 audio data...')
      
      // Convert base64 to Uint8Array
      const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0))
      const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' })
      
      formData.append("file", audioBlob, "recording.wav")
    }

    // Add the model_id as specified in the documentation
    formData.append("model_id", "scribe_v1")

    // Make request to ElevenLabs speech-to-text API
    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "Xi-Api-Key": elevenLabsApiKey,
        // Don't set Content-Type - let FormData set it with proper boundary
      },
      body: formData
    })

    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error:', response.status, errorText)
      
      return new Response(
        JSON.stringify({
          error: 'Transcription failed',
          details: `ElevenLabs API returned ${response.status}`,
          message: errorText
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse the response from ElevenLabs
    const transcriptionData = await response.json()
    console.log('Transcription successful:', transcriptionData)

    // Return the transcription result
    return new Response(
      JSON.stringify(transcriptionData),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in transcribe-audio function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})