import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    console.log('🔍 Bikes API: Starting request...');
    
    const session = await getServerSession(authOptions);
    console.log('🔍 Bikes API: Session:', session ? 'Found' : 'Not found');

    if (!session) {
      console.log('❌ Bikes API: No session found, returning 401');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔍 Bikes API: Fetching bikes from database...');
    const bikes = await prisma.bike.findMany({
      select: {
        id: true,
        bikeNumber: true,
        status: true,
        currentLocation: true,
        model: true,
      },
      orderBy: {
        bikeNumber: 'asc',
      },
    });

    console.log(`✅ Bikes API: Found ${bikes.length} bikes`);
    return NextResponse.json(bikes);
  } catch (error) {
    console.error('❌ Bikes API Error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        message: 'Error fetching bikes',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { bikeNumber, model, currentLocation } = data;

    const bike = await prisma.bike.create({
      data: {
        bikeNumber,
        model,
        currentLocation,
        status: 'AVAILABLE',
        purchaseDate: new Date(),
      },
    });

    return NextResponse.json(bike, { status: 201 });
  } catch (error) {
    console.error('Error creating bike:', error);
    return NextResponse.json(
      { message: 'Error creating bike' },
      { status: 500 }
    );
  }
} 