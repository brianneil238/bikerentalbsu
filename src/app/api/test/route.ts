import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ 
      message: 'API is working!', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV 
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error in test API', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 