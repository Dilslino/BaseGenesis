import { NextRequest, NextResponse } from 'next/server';

/**
 * Farcaster Mini App Webhook Handler
 * 
 * Handles events from Farcaster (frame interactions, app installations, etc.)
 * Currently logs events for monitoring. Expand as needed.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log webhook event for monitoring
    console.log('Farcaster webhook event:', {
      timestamp: new Date().toISOString(),
      event: body,
    });

    // Handle different event types
    switch (body.event) {
      case 'frame.added':
        // User added the mini app
        console.log('User added mini app:', body.data);
        break;
        
      case 'frame.removed':
        // User removed the mini app
        console.log('User removed mini app:', body.data);
        break;
        
      default:
        console.log('Unknown event type:', body.event);
    }

    // Return success response
    return NextResponse.json({ 
      success: true,
      received: true 
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
    
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    webhook: 'active',
    timestamp: new Date().toISOString()
  });
}
