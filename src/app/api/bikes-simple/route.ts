import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Simple Bikes API: Starting request...');
    
    const bikes = await prisma.bike.findMany({
      select: {
        id: true,
        bikeNumber: true,
        status: true,
        model: true,
      },
      take: 5, // Limit to 5 bikes for testing
    });

    console.log(`✅ Simple Bikes API: Found ${bikes.length} bikes`);
    return NextResponse.json({
      success: true,
      count: bikes.length,
      bikes
    });
  } catch (error) {
    console.error('❌ Simple Bikes API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error fetching bikes',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 