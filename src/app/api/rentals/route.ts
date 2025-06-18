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

    const rentals = await prisma.rental.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        bike: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return NextResponse.json(rentals);
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return NextResponse.json(
      { message: 'Error fetching rentals' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    console.log('🔍 Rentals API: Starting rental request...');
    
    const session = await getServerSession(authOptions);
    console.log('🔍 Rentals API: Session:', session ? 'Found' : 'Not found');
    console.log('🔍 Rentals API: User ID:', session?.user?.id);

    if (!session) {
      console.log('❌ Rentals API: No session found, returning 401');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const requestBody = await req.json();
    console.log('🔍 Rentals API: Request body:', requestBody);
    const { bikeId, pdfUrl } = requestBody;

    // Check if user has an active rental
    console.log('🔍 Rentals API: Checking for active rentals...');
    const activeRental = await prisma.rental.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (activeRental) {
      console.log('❌ Rentals API: User already has active rental');
      return NextResponse.json(
        { message: 'You already have an active rental' },
        { status: 400 }
      );
    }

    // Check if bike is available
    console.log('🔍 Rentals API: Checking bike availability for ID:', bikeId);
    const bike = await prisma.bike.findUnique({
      where: { id: bikeId },
    });

    console.log('🔍 Rentals API: Bike found:', bike ? `${bike.bikeNumber} (${bike.status})` : 'Not found');

    if (!bike || bike.status !== 'AVAILABLE') {
      console.log('❌ Rentals API: Bike not available');
      return NextResponse.json(
        { message: 'Bike is not available' },
        { status: 400 }
      );
    }

    // Create rental and update bike status in a transaction
    console.log('🔍 Rentals API: Creating rental...');
    const rental = await prisma.$transaction(async (tx) => {
      const rental = await tx.rental.create({
        data: {
          userId: session.user.id,
          bikeId,
          status: 'ACTIVE',
          pdfUrl: pdfUrl || null,
        },
        include: {
          bike: true,
        },
      });

      await tx.bike.update({
        where: { id: bikeId },
        data: { status: 'RENTED' },
      });

      return rental;
    });

    console.log('✅ Rentals API: Rental created successfully:', rental.id);
    return NextResponse.json(rental, { status: 201 });
  } catch (error) {
    console.error('❌ Rentals API Error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { 
        message: 'Error creating rental',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { rentalId, action } = await req.json();

    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { bike: true },
    });

    if (!rental || rental.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Rental not found' },
        { status: 404 }
      );
    }

    if (action === 'end') {
      // End rental and update bike status in a transaction
      const updatedRental = await prisma.$transaction(async (tx) => {
        const rental = await tx.rental.update({
          where: { id: rentalId },
          data: {
            status: 'COMPLETED',
            endTime: new Date(),
          },
          include: {
            bike: true,
          },
        });

        await tx.bike.update({
          where: { id: rental.bikeId },
          data: { status: 'AVAILABLE' },
        });

        return rental;
      });

      return NextResponse.json(updatedRental);
    }

    return NextResponse.json(
      { message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating rental:', error);
    return NextResponse.json(
      { message: 'Error updating rental' },
      { status: 500 }
    );
  }
} 