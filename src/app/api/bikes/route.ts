import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bikes = await prisma.bike.findMany({
      select: {
        id: true,
        bikeNumber: true,
        status: true,
        currentLocation: true,
        model: true,
      },
    });

    return NextResponse.json(bikes);
  } catch (error) {
    console.error('Error fetching bikes:', error);
    return NextResponse.json(
      { message: 'Error fetching bikes' },
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