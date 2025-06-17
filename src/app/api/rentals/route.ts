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
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { bikeId, pdfUrl } = await req.json();

    // Check if user has an active rental
    const activeRental = await prisma.rental.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (activeRental) {
      return NextResponse.json(
        { message: 'You already have an active rental' },
        { status: 400 }
      );
    }

    // Check if bike is available
    const bike = await prisma.bike.findUnique({
      where: { id: bikeId },
    });

    if (!bike || bike.status !== 'AVAILABLE') {
      return NextResponse.json(
        { message: 'Bike is not available' },
        { status: 400 }
      );
    }

    // Create rental and update bike status in a transaction
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

    return NextResponse.json(rental, { status: 201 });
  } catch (error) {
    console.error('Error creating rental:', error);
    return NextResponse.json(
      { message: 'Error creating rental' },
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