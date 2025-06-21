import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all applications (for admins)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const applications = await prisma.bikeRentalApplication.findMany({
      orderBy: {
        submittedAt: 'desc',
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications for admin:', error);
    return NextResponse.json({ message: 'Error fetching applications' }, { status: 500 });
  }
}

// POST to update an application's status (for admins)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { applicationId, status } = body;

    if (!applicationId || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const updatedApplication = await prisma.bikeRentalApplication.update({
      where: { id: applicationId },
      data: { 
        status,
        reviewedAt: new Date(),
        reviewedBy: session.user.email, // Or user ID
      },
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json({ message: 'Error updating application status' }, { status: 500 });
  }
} 