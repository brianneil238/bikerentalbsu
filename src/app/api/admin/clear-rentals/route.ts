import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('🧹 Clearing active rentals for user:', session.user.id);
    
    // End all active rentals for this user
    const result = await prisma.$transaction(async (tx) => {
      // Find active rentals
      const activeRentals = await tx.rental.findMany({
        where: {
          userId: session.user.id,
          status: 'ACTIVE',
        },
        include: {
          bike: true,
        },
      });

      console.log(`Found ${activeRentals.length} active rentals to clear`);

      // Update rentals to completed
      await tx.rental.updateMany({
        where: {
          userId: session.user.id,
          status: 'ACTIVE',
        },
        data: {
          status: 'COMPLETED',
          endTime: new Date(),
        },
      });

      // Update bikes back to available
      for (const rental of activeRentals) {
        await tx.bike.update({
          where: { id: rental.bikeId },
          data: { status: 'AVAILABLE' },
        });
      }

      return activeRentals;
    });

    return NextResponse.json({
      message: `Cleared ${result.length} active rentals`,
      clearedRentals: result.length,
    });
  } catch (error) {
    console.error('Error clearing rentals:', error);
    return NextResponse.json(
      { message: 'Error clearing rentals', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 