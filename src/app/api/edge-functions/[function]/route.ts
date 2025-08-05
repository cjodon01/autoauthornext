import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { function: string } }
) {
  try {
    // Get the function name from the URL
    const functionName = params.function;
    
    // Validate function name
    const validFunctions = [
      'single-post',
      'generate-media-content',
      'render-meme-image',
      'image-search',
      'journal-ai-process',
      'transcribe-audio',
      'stripe-checkout',
      'stripe-webhook',
      'social-media-connector',
      'ai-brand-build',
      'buildbrand',
      'generate-campaign-posts',
      'generate-posts'
    ];

    if (!validFunctions.includes(functionName)) {
      return NextResponse.json(
        { error: 'Invalid function name' },
        { status: 400 }
      );
    }

    // Get the request body
    const body = await request.json();

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client
    const supabase = await createClient();

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get Supabase URL and service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Prepare the request to the edge function
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/${functionName}`;
    
    // Add user information to the request body
    const requestBody = {
      ...body,
      user_id: user.id,
      user_email: user.email
    };

    // Call the edge function
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'X-Client-Info': 'nextjs-migration/1.0.0'
      },
      body: JSON.stringify(requestBody)
    });

    // Get the response data
    const responseData = await response.json();

    // Handle different response statuses
    if (!response.ok) {
      console.error(`Edge function ${functionName} error:`, responseData);
      
      // Return appropriate error response
      return NextResponse.json(
        { 
          error: responseData.error || 'Edge function execution failed',
          details: responseData.details || null
        },
        { status: response.status }
      );
    }

    // Log successful execution
    console.log(`Edge function ${functionName} executed successfully for user ${user.id}`);

    // Return the successful response
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('API route error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : null
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  });
} 