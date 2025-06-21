import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get all applications with user information
    const applications = await prisma.bikeRentalApplication.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    return NextResponse.json(applications);

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { applicationId, status, notes } = await req.json();

    if (!applicationId || !status) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update application status
    const updatedApplication = await prisma.bikeRentalApplication.update({
      where: {
        id: applicationId
      },
      data: {
        status,
        notes,
        reviewedAt: new Date(),
        reviewedBy: session.user.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Application status updated successfully',
      application: updatedApplication
    });

  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 